import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';

/**
 * IX Layer — 02 Customer App Interaction Handlers
 * Encapsulates workbook upload drag/drop, preflight sample loading, validation job
 * execution, rule builder sandbox simulation, and settings/billing interactions.
 */
export function useCustomerIX() {
  const navigate = useNavigate();
  const appState = useAppState();

  const [isDragging, setIsDragging] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedExportFormat, setSelectedExportFormat] = useState<'csv' | 'json'>('csv');

  const handleRunValidationAndOpenResults = () => {
    const createdJob = appState.executeValidationJob();
    navigate(`/app/results/${createdJob.id}`);
    return createdJob;
  };

  const handleDragState = (dragging: boolean) => {
    setIsDragging(dragging);
  };

  return {
    ...appState,
    navigate,
    isDragging,
    handleDragState,
    searchFilter,
    setSearchFilter,
    selectedExportFormat,
    setSelectedExportFormat,
    handleRunValidationAndOpenResults,
  };
}
