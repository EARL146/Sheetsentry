/**
 * SheetSentry Relational Database Interface & Pool Abstraction
 * Supports MySQL 8.0+ (Local AMPPS / phpMyAdmin, Docker, Azure MySQL)
 */
import 'dotenv/config';
import { MysqlDatabaseClient } from './mysqlClient';

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password?: string;
  database: string;
  ssl?: boolean;
  connectionLimit: number;
  charset: string;
}

export const getDatabaseConfigFromEnv = (): DatabaseConfig => ({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME || 'sheetsentry',
  ssl: process.env.DB_SSL === 'true',
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
  charset: 'utf8mb4',
});

export interface QueryResult<T = unknown> {
  rows: T[];
  affectedRows?: number;
  insertId?: number | string;
}

/**
 * Database client contract
 */
export interface IDatabaseClient {
  query<T = unknown>(sql: string, params?: unknown[]): Promise<QueryResult<T>>;
  transaction<T>(work: (client: IDatabaseClient) => Promise<T>): Promise<T>;
  close(): Promise<void>;
  ping(): Promise<boolean>;
  isLive(): boolean;
}

/**
 * In-Memory fallback implementation for isolated unit tests
 * when running without a MySQL 8 socket.
 */
export class InMemoryDatabaseClient implements IDatabaseClient {
  private isConnected: boolean = true;

  async query<T = unknown>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sql: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    params: unknown[] = []
  ): Promise<QueryResult<T>> {
    return { rows: [] as T[], affectedRows: 0 };
  }

  async transaction<T>(work: (client: IDatabaseClient) => Promise<T>): Promise<T> {
    return work(this);
  }

  async close(): Promise<void> {
    this.isConnected = false;
  }

  async ping(): Promise<boolean> {
    return this.isConnected;
  }

  isLive(): boolean {
    return false;
  }
}

let singletonClient: IDatabaseClient | null = null;

export function getDb(): IDatabaseClient {
  if (singletonClient) {
    return singletonClient;
  }

  const isVitest = process.env.VITEST === 'true' && process.env.USE_LIVE_DB !== 'true';
  const engine = process.env.DB_ENGINE || 'mysql8';

  if (!isVitest && engine === 'mysql8') {
    singletonClient = new MysqlDatabaseClient(getDatabaseConfigFromEnv());
  } else {
    singletonClient = new InMemoryDatabaseClient();
  }

  return singletonClient;
}
