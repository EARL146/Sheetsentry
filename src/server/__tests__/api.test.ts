import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'http';
import { app } from '../app';

describe('SheetSentry Backend Foundation REST API', () => {
  let server: http.Server;
  let baseUrl: string;

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server = http.createServer(app);
      server.listen(0, () => {
        const address = server.address() as { port: number };
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  it('GET /api/health returns HTTP 200 and UP status', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('UP');
    expect(data.service).toBe('SheetSentry API');
  });

  it('POST /api/v1/auth/login succeeds with valid demo credentials', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'olivia@sheetsentry.io', password: 'password123' }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.token).toBeDefined();
    expect(data.user.email).toBe('olivia@sheetsentry.io');
    expect(data.user.fullName).toBe('Olivia Lee');
  });

  it('POST /api/v1/uploads/preflight detects magic bytes and verifies safe expansion ratio', async () => {
    const res = await fetch(`${baseUrl}/api/v1/uploads/preflight`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer usr_token_olivia_2026',
      },
      body: JSON.stringify({
        filename: 'sales_q4.xlsx',
        sizeBytes: 1250000,
        magicBytesHex: '504B0304',
      }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('PASSED');
    expect(data.preflight.magicBytesValid).toBe(true);
    expect(data.preflight.zipExpansionRatio).toBeLessThan(100);
  });

  it('GET /api/v1/jobs/JOB-2026-8941 returns decoupled Data Quality Score (98.4%) and ELIGIBLE status', async () => {
    const res = await fetch(`${baseUrl}/api/v1/jobs/JOB-2026-8941`, {
      headers: {
        Authorization: 'Bearer usr_token_olivia_2026',
      },
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.job.dataQualityScore).toBe(98.4);
    expect(data.job.validationGrade).toBe('A');
    expect(data.job.processingEligibility).toBe('ELIGIBLE');
  });

  it('GET /api/v1/admin/ledger enforces admin authentication and returns segregated currency ledgers', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/ledger?currency=USD`, {
      headers: {
        Authorization: 'Bearer adm_token_marcus_2026',
      },
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.fxReferenceRate).toBe('1 USD = 55.00 PHP');
    expect(data.netUsd).toBe(14820.0);
    expect(Array.isArray(data.transactions)).toBe(true);
  });

  it('POST /api/v1/admin/unmask-ticket validates Support Ticket format SUP-XXXX', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/unmask-ticket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer adm_token_marcus_2026',
      },
      body: JSON.stringify({
        supportTicketId: 'SUP-4902',
        justification: 'Customer requested audit inspection of critical blocking row',
        entityKey: 'JOB-2026-8941 / Row 14',
      }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.unmasked).toBe(true);
    expect(data.supportTicketId).toBe('SUP-4902');
  });
});
