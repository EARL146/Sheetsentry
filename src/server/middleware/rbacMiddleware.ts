/**
 * SheetSentry Role-Based Access Control (RBAC) Middleware
 * Enforces Platform Admin Roles (6 Roles) & Workspace Roles (4 Roles)
 */

import { Request, Response, NextFunction } from 'express';
import { AuthenticationError, ForbiddenError } from './errorHandler';

export const requireAdminRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AuthenticationError());
    }

    if (!req.user.adminRole) {
      return next(new ForbiddenError('Admin console access required'));
    }

    if (req.user.adminRole === 'SUPER_ADMIN') {
      return next(); // Super admin has universal bypass
    }

    if (!allowedRoles.includes(req.user.adminRole)) {
      return next(new ForbiddenError(`Required one of roles: ${allowedRoles.join(', ')}`));
    }

    next();
  };
};

export const requireWorkspaceRole = (...allowedRoles: Array<'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER'>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AuthenticationError());
    }

    const currentRole = req.user.workspaceRole;
    if (!currentRole || !allowedRoles.includes(currentRole)) {
      return next(new ForbiddenError(`Workspace capability requires one of: ${allowedRoles.join(', ')}`));
    }

    next();
  };
};
