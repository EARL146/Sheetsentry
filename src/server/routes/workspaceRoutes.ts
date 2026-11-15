/**
 * SheetSentry Workspace Routes (/api/v1/workspaces)
 * Multi-Tenant Boundaries, Memberships, Quotas & Profile Preferences backed by MySQL 8
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { requireWorkspaceRole } from '../middleware/rbacMiddleware';
import { getDb } from '../database/dbInterface';

export const workspaceRouter = Router();

workspaceRouter.use(authenticate);

// GET /workspaces — List authenticated user workspaces from MySQL
workspaceRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const db = getDb();
    if (!db.isLive() || !req.user) {
      return res.status(200).json({
        workspaces: [
          {
            id: 'ws_olivia_01',
            name: "Olivia's workspace",
            slug: 'olivias-workspace',
            role: req.user?.workspaceRole || 'OWNER',
            currency: 'USD',
            activePlan: 'starter',
          },
        ],
      });
    }

    const { rows } = await db.query<{
      id: string;
      name: string;
      slug: string;
      role: string;
      default_currency: 'USD' | 'PHP';
      plan_id: string | null;
      validations_used: number | null;
      monthly_validations_limit: number | null;
    }>(
      `SELECT
         w.id,
         w.name,
         w.slug,
         wm.role,
         w.default_currency,
         s.plan_id,
         u.validations_used,
         p.monthly_validations_limit
       FROM workspace_memberships wm
       INNER JOIN workspaces w ON w.id = wm.workspace_id
       LEFT JOIN subscriptions s ON s.workspace_id = w.id
       LEFT JOIN plans p ON p.id = s.plan_id
       LEFT JOIN subscription_usage_counters u
         ON u.workspace_id = w.id AND u.period_ym = DATE_FORMAT(NOW(), '%Y-%m')
       WHERE wm.user_id = ?
       ORDER BY wm.created_at ASC`,
      [req.user.id]
    );

    res.status(200).json({
      workspaces: rows.map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        role: r.role,
        currency: r.default_currency,
        activePlan: r.plan_id || 'free',
        validationsUsed: r.validations_used || 0,
        monthlyLimit: r.monthly_validations_limit,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// GET /workspaces/:id
workspaceRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const db = getDb();
    if (!db.isLive() || !req.user) {
      return res.status(200).json({
        workspace: {
          id: req.params.id,
          name: "Olivia's workspace",
          slug: 'olivias-workspace',
          ownerUserId: 'usr_olivia_01',
          defaultCurrency: 'USD',
          plan: {
            id: 'starter',
            name: 'Starter Plan',
            monthlyLimit: 50,
            usedValidations: 32,
            storageBytesUsed: 1480000000,
            retentionDays: 30,
          },
        },
      });
    }

    const { rows } = await db.query<{
      id: string;
      name: string;
      slug: string;
      owner_user_id: string;
      default_currency: 'USD' | 'PHP';
      plan_id: string | null;
      plan_name: string | null;
      monthly_validations_limit: number | null;
      retention_days: number | null;
      validations_used: number | null;
      storage_bytes_used: number | null;
    }>(
      `SELECT
         w.id,
         w.name,
         w.slug,
         w.owner_user_id,
         w.default_currency,
         s.plan_id,
         p.name AS plan_name,
         p.monthly_validations_limit,
         p.retention_days,
         uc.validations_used,
         uc.storage_bytes_used
       FROM workspaces w
       INNER JOIN workspace_memberships wm ON wm.workspace_id = w.id AND wm.user_id = ?
       LEFT JOIN subscriptions s ON s.workspace_id = w.id
       LEFT JOIN plans p ON p.id = s.plan_id
       LEFT JOIN subscription_usage_counters uc
         ON uc.workspace_id = w.id AND uc.period_ym = DATE_FORMAT(NOW(), '%Y-%m')
       WHERE w.id = ?
       LIMIT 1`,
      [req.user.id, req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Workspace not found' } });
    }

    const ws = rows[0];
    res.status(200).json({
      workspace: {
        id: ws.id,
        name: ws.name,
        slug: ws.slug,
        ownerUserId: ws.owner_user_id,
        defaultCurrency: ws.default_currency,
        plan: {
          id: ws.plan_id || 'free',
          name: `${ws.plan_name || 'Free'} Plan`,
          monthlyLimit: ws.monthly_validations_limit,
          usedValidations: ws.validations_used || 0,
          storageBytesUsed: ws.storage_bytes_used || 0,
          retentionDays: ws.retention_days || 7,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /workspaces/:id — Persist currency, plan tier, workspace name, or user full name to MySQL
workspaceRouter.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const db = getDb();
    if (!db.isLive() || !req.user) {
      return res.status(200).json({ updated: true });
    }

    const wsId = req.params.id;
    const { currency, planId, fullName, workspaceName } = req.body || {};

    await db.transaction(async (tx) => {
      if (currency === 'USD' || currency === 'PHP') {
        await tx.query('UPDATE workspaces SET default_currency = ? WHERE id = ?', [currency, wsId]);
        await tx.query('UPDATE subscriptions SET billing_currency = ? WHERE workspace_id = ?', [
          currency,
          wsId,
        ]);
      }
      if (planId === 'free' || planId === 'starter' || planId === 'pro') {
        await tx.query('UPDATE subscriptions SET plan_id = ? WHERE workspace_id = ?', [
          planId,
          wsId,
        ]);
      }
      if (typeof fullName === 'string' && fullName.trim().length > 0) {
        await tx.query('UPDATE users SET full_name = ? WHERE id = ?', [fullName.trim(), req.user!.id]);
      }
      if (typeof workspaceName === 'string' && workspaceName.trim().length > 0) {
        await tx.query('UPDATE workspaces SET name = ? WHERE id = ?', [workspaceName.trim(), wsId]);
      }
    });

    res.status(200).json({ updated: true, workspaceId: wsId });
  } catch (err) {
    next(err);
  }
});

// GET /workspaces/:id/members
workspaceRouter.get(
  '/:id/members',
  requireWorkspaceRole('OWNER', 'ADMIN', 'EDITOR', 'VIEWER'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const db = getDb();
      if (!db.isLive()) {
        return res.status(200).json({
          members: [
            {
              id: 'mem_01',
              userId: 'usr_olivia_01',
              fullName: 'Olivia Lee',
              email: 'olivia@sheetsentry.io',
              role: 'OWNER',
              joinedAt: '2026-10-15T08:00:00Z',
            },
          ],
        });
      }

      const { rows } = await db.query<{
        id: string;
        user_id: string;
        full_name: string;
        email: string;
        role: string;
        created_at: Date;
      }>(
        `SELECT wm.id, wm.user_id, u.full_name, u.email, wm.role, wm.created_at
         FROM workspace_memberships wm
         INNER JOIN users u ON u.id = wm.user_id
         WHERE wm.workspace_id = ?`,
        [req.params.id]
      );

      res.status(200).json({
        members: rows.map((m) => ({
          id: m.id,
          userId: m.user_id,
          fullName: m.full_name,
          email: m.email,
          role: m.role,
          joinedAt: m.created_at,
        })),
      });
    } catch (err) {
      next(err);
    }
  }
);
