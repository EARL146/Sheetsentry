import mysql, { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import type { DatabaseConfig, IDatabaseClient, QueryResult } from './dbInterface';

class MysqlTransactionClient implements IDatabaseClient {
  constructor(private readonly conn: PoolConnection) {}

  async query<T = unknown>(sql: string, params: unknown[] = []): Promise<QueryResult<T>> {
    const [result] = await this.conn.query(sql, params);
    if (Array.isArray(result)) {
      return { rows: result as T[] };
    }
    const header = result as ResultSetHeader;
    return {
      rows: [] as T[],
      affectedRows: header.affectedRows,
      insertId: header.insertId,
    };
  }

  async transaction<T>(work: (client: IDatabaseClient) => Promise<T>): Promise<T> {
    return work(this);
  }

  async close(): Promise<void> {
    // Managed by outer transaction lifecycle
  }

  async ping(): Promise<boolean> {
    await this.conn.ping();
    return true;
  }

  isLive(): boolean {
    return true;
  }
}

export class MysqlDatabaseClient implements IDatabaseClient {
  private pool: Pool;

  constructor(config: DatabaseConfig) {
    this.pool = mysql.createPool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password || '',
      database: config.database,
      waitForConnections: true,
      connectionLimit: config.connectionLimit,
      charset: config.charset,
      timezone: 'Z',
      ...(config.ssl ? { ssl: { rejectUnauthorized: true } } : {}),
    });
  }

  async query<T = unknown>(sql: string, params: unknown[] = []): Promise<QueryResult<T>> {
    const [result] = await this.pool.query(sql, params);
    if (Array.isArray(result)) {
      return { rows: (result as RowDataPacket[]) as T[] };
    }
    const header = result as ResultSetHeader;
    return {
      rows: [] as T[],
      affectedRows: header.affectedRows,
      insertId: header.insertId,
    };
  }

  async transaction<T>(work: (client: IDatabaseClient) => Promise<T>): Promise<T> {
    const conn = await this.pool.getConnection();
    await conn.beginTransaction();
    try {
      const txClient = new MysqlTransactionClient(conn);
      const output = await work(txClient);
      await conn.commit();
      return output;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  async ping(): Promise<boolean> {
    try {
      await this.pool.query('SELECT 1 AS ok');
      return true;
    } catch {
      return false;
    }
  }

  isLive(): boolean {
    return true;
  }
}
