import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlanTierId } from '../config/productConfig';
import { useAppState } from '../context/AppStateContext';

/**
 * IX Layer — Hero 3D Interactive Spatial Stage Controls
 * Handles smooth pointer-tracked parallax tilt and specular glare coordinates
 * layered seamlessly atop continuous CSS 3D ambient orbital motion.
 */
export function useHero3DIX() {
  const navigate = useNavigate();
  const { authUser } = useAppState();
  const [pointerTilt, setPointerTilt] = useState<{ rx: number; ry: number; px: number; py: number }>({
    rx: 0,
    ry: 0,
    px: 50,
    py: 45,
  });

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    const ry = (nx - 0.5) * 14; // -7deg to +7deg
    const rx = (0.5 - ny) * 10; // -5deg to +5deg
    setPointerTilt({
      rx,
      ry,
      px: Math.round(nx * 100),
      py: Math.round(ny * 100),
    });
  }, []);

  const handlePointerLeave = useCallback(() => {
    setPointerTilt({ rx: 0, ry: 0, px: 50, py: 45 });
  }, []);

  const handleInspectReport = useCallback(() => {
    if (authUser) {
      navigate('/app/results/JOB-2026-8941');
    } else {
      navigate('/register?next=/app/results/JOB-2026-8941');
    }
  }, [authUser, navigate]);

  const pointerTransform = `rotateX(${(pointerTilt.rx * 0.75).toFixed(2)}deg) rotateY(${(
    pointerTilt.ry * 0.75
  ).toFixed(2)}deg)`;

  return {
    pointerTilt,
    pointerTransform,
    handlePointerMove,
    handlePointerLeave,
    handleInspectReport,
  };
}

/**
 * IX Layer — 01 Public Website Interaction Handlers
 * Handles pricing selection, FAQ search/accordion, and auth onboarding states.
 */
export function usePublicIX() {
  const navigate = useNavigate();
  const { authUser, currency, setCurrency, configMode, setConfigMode, setActivePlanId } =
    useAppState();

  const [faqQuery, setFaqQuery] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [showAuthStateDrawer, setShowAuthStateDrawer] = useState(false);

  const handleSelectPlan = (planId: PlanTierId) => {
    setActivePlanId(planId);
    if (authUser) {
      navigate('/app/upload');
    } else {
      navigate(`/register?plan=${planId}&next=/app/upload`);
    }
  };

  const handleOpenPreviewReport = () => {
    if (authUser) {
      navigate('/app/results/JOB-2026-8941');
    } else {
      navigate('/register?next=/app/results/JOB-2026-8941');
    }
  };

  const handleToggleFaqItem = (idx: number) => {
    setOpenFaqIndex((prev) => (prev === idx ? null : idx));
  };

  return {
    navigate,
    currency,
    setCurrency,
    configMode,
    setConfigMode,
    faqQuery,
    setFaqQuery,
    openFaqIndex,
    handleToggleFaqItem,
    showAuthStateDrawer,
    setShowAuthStateDrawer,
    handleSelectPlan,
    handleOpenPreviewReport,
  };
}
