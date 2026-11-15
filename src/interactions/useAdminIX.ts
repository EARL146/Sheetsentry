import { useState } from 'react';
import { useAppState } from '../context/AppStateContext';

/**
 * IX Layer — 03 Admin Console Interaction Handlers
 * Manages ticket-gated payload inspection modal, dual-admin refund approval,
 * search filtering, and security/audit event dispatch.
 */
export function useAdminIX() {
  const appState = useAppState();

  const [ticketModalEntity, setTicketModalEntity] = useState<string | null>(null);
  const [activeLedgersFilter, setActiveLedgersFilter] = useState<'ALL' | 'USD' | 'PHP'>('ALL');
  const [adminSearch, setAdminSearch] = useState('');

  const handleOpenTicketGate = (entityKey: string) => {
    setTicketModalEntity(entityKey);
  };

  const handleCloseTicketGate = () => {
    setTicketModalEntity(null);
  };

  const handleApproveLargeRefund = (refundId: string, approverName: string) => {
    appState.approveRefundSecondAdmin(refundId, approverName);
  };

  return {
    ...appState,
    ticketModalEntity,
    handleOpenTicketGate,
    handleCloseTicketGate,
    activeLedgersFilter,
    setActiveLedgersFilter,
    adminSearch,
    setAdminSearch,
    handleApproveLargeRefund,
  };
}
