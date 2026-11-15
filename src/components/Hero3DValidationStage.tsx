import React from 'react';
import { CheckCircle2, FileSpreadsheet, ShieldCheck } from 'lucide-react';
import { BrandLogo } from './SharedUI';
import { PUBLIC_HERO_3D_TEXT } from '../content/publicText';
import { useHero3DIX } from '../interactions/usePublicIX';

/**
 * UI Component — Continuous 3D Spreadsheet Validation Stage
 * Pure presentational multi-plane 3D composition driven cleanly by:
 * - Text: PUBLIC_HERO_3D_TEXT (src/content/publicText.ts)
 * - CSS:  .ss-hero-* continuous orbital keyframes (src/styles/public.css)
 * - IX:   useHero3DIX() smooth pointer parallax + inspection navigation (src/interactions/usePublicIX.ts)
 */
export const Hero3DValidationStage: React.FC = () => {
  const {
    pointerTilt,
    pointerTransform,
    handlePointerMove,
    handlePointerLeave,
    handleInspectReport,
  } = useHero3DIX();

  return (
    <div className="ss-hero-stage-shell overflow-x-clip">
      {/* Ambient Blueprint Grid & 3D Orbital Ring Backdrop */}
      <div className="ss-hero-ambient-backdrop" aria-hidden="true">
        <div className="ss-hero-ambient-grid" />
        <div className="ss-hero-orbit-stage">
          <div className="ss-hero-orbit-ring">
            <span className="ss-hero-orbit-dot ss-hero-orbit-dot--blue" />
            <span className="ss-hero-orbit-dot ss-hero-orbit-dot--green" />
          </div>
        </div>
      </div>

      {/* Continuous 3D Perspective Viewport + Smooth Pointer Parallax */}
      <div
        className="ss-hero-3d-viewport"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <div className="ss-hero-pointer-rig" style={{ transform: pointerTransform }}>
          <div className="ss-hero-3d-assembly">
            {/* Floating Top Planes: Schema Prism Node + 3D Rotating Formula Guard Cube */}
            <div className="hidden sm:flex items-center justify-between gap-3 mb-2.5 px-1">
              <div className="ss-hero-float-prism bg-white/95 backdrop-blur-md border border-[#DCE6F3] rounded-[14px] px-3 py-2 shadow-md shadow-slate-900/10 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-[9px] bg-[#EAF2FF] flex items-center justify-center text-[#2563EB]">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div className="leading-tight">
                  <div className="text-[10px] font-bold text-[#10213B]">XLSX / CSV</div>
                  <div className="text-[9.5px] font-mono text-[#667085]">Schema v3 Sync</div>
                </div>
              </div>

              <div className="ss-hero-satellite-top bg-white border border-[#DCE6F3] rounded-[16px] px-3.5 py-2 shadow-lg shadow-slate-900/10 flex items-center gap-3">
                <div className="ss-cube-scene" aria-hidden="true">
                  <div className="ss-cube-rotor">
                    <div className="ss-cube-face ss-cube-face--front">✓</div>
                    <div className="ss-cube-face ss-cube-face--right">XLS</div>
                    <div className="ss-cube-face ss-cube-face--back">CSV</div>
                    <div className="ss-cube-face ss-cube-face--left">SAFE</div>
                    <div className="ss-cube-face ss-cube-face--top" />
                    <div className="ss-cube-face ss-cube-face--bottom" />
                  </div>
                </div>
                <div className="leading-tight">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-[#10213B]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>{PUBLIC_HERO_3D_TEXT.formulaShieldTitle}</span>
                  </div>
                  <div className="text-[10px] font-mono font-semibold text-[#16A36A] mt-0.5">
                    {PUBLIC_HERO_3D_TEXT.formulaShieldSub}
                  </div>
                </div>
              </div>
            </div>

            {/* Stacked Depth Wrapper hugging strictly the Main Workbook Card */}
            <div className="relative" style={{ transformStyle: 'preserve-3d' }}>
              {/* Layer -2: Multi-sheet XLSX Back Slab */}
              <div className="ss-hero-sheet-slab ss-hero-sheet-slab--back" aria-hidden="true" />

              {/* Layer -1: Preflight Structural Slab */}
              <div className="ss-hero-sheet-slab ss-hero-sheet-slab--mid" aria-hidden="true" />

              {/* Layer 0: Elevated SheetSentry Validation Card */}
              <div className="ss-hero-main-plate">
                {/* Interactive Specular Glare + Automated Studio Sheen */}
                <div
                  className="ss-hero-glare"
                  style={{
                    background: `radial-gradient(circle at ${pointerTilt.px}% ${pointerTilt.py}%, rgba(37, 99, 235, 0.1), transparent 58%)`,
                  }}
                />
                <div className="ss-hero-auto-sheen" aria-hidden="true" />

                {/* Preview Header Bar */}
                <div className="relative bg-[#FBFCFE] border-b border-[#E4E9F1] h-[46px] px-5 flex items-center justify-between">
                  <BrandLogo size={24} />
                  <span className="text-[10px] font-semibold text-[#667085] uppercase tracking-wider">
                    {PUBLIC_HERO_3D_TEXT.workspaceLabel}
                  </span>
                </div>

                <div className="relative p-4 sm:p-5 space-y-3.5 bg-white">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h2 className="text-[18px] font-bold text-[#10213B]">
                        {PUBLIC_HERO_3D_TEXT.fileTitle}
                      </h2>
                      <p className="text-[11px] text-[#667085] mt-0.5">
                        {PUBLIC_HERO_3D_TEXT.fileMeta}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAF2FF] text-[#2563EB] text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-pulse" />
                      <span>Deterministic Engine</span>
                    </span>
                  </div>

                  {/* 2 Metric Cards Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-[#F6F9FF] border border-[#E4E9F1] rounded-[14px] p-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase text-[#667085]">
                          {PUBLIC_HERO_3D_TEXT.scoreLabel}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-[#E8F7EF] text-[#16A36A] text-[9.5px] font-bold">
                          {PUBLIC_HERO_3D_TEXT.scoreBadge}
                        </span>
                      </div>
                      <div className="text-[30px] font-bold text-[#10213B] mt-1.5 leading-none">
                        {PUBLIC_HERO_3D_TEXT.scoreValue}
                      </div>
                      <div className="mt-2 h-1.5 w-full rounded-full bg-[#E2EAF7] overflow-hidden">
                        <div className="h-full w-[98.4%] rounded-full bg-gradient-to-r from-[#2563EB] to-[#16A36A]" />
                      </div>
                      <div className="text-[10.5px] text-[#667085] mt-1.5">
                        {PUBLIC_HERO_3D_TEXT.scoreCaption}
                      </div>
                    </div>

                    <div className="bg-white border border-[#E4E9F1] rounded-[14px] p-3.5">
                      <div className="text-[10px] font-bold uppercase text-[#667085]">
                        {PUBLIC_HERO_3D_TEXT.issuesLabel}
                      </div>
                      <div className="flex items-baseline gap-2 mt-1.5">
                        <span className="text-[28px] font-bold text-[#10213B] leading-none">
                          {PUBLIC_HERO_3D_TEXT.issuesCount}
                        </span>
                        <span className="text-[11px] text-[#667085]">
                          {PUBLIC_HERO_3D_TEXT.issuesCaption}
                        </span>
                      </div>
                      <div className="mt-2.5 bg-[#FFF4DE] rounded-[8px] px-2.5 py-1.5 text-[10px] font-bold text-[#D99121]">
                        {PUBLIC_HERO_3D_TEXT.issuesAlert}
                      </div>
                    </div>
                  </div>

                  {/* Column Checks List — Laser Scanner sweeps strictly over validation rows */}
                  <div className="space-y-1.5">
                    <div className="text-[12.5px] font-semibold text-[#10213B] px-1">
                      {PUBLIC_HERO_3D_TEXT.columnChecksTitle}
                    </div>
                    <div className="relative space-y-1 overflow-hidden rounded-[10px]">
                      <div className="ss-hero-scan-beam" aria-hidden="true" />
                      {PUBLIC_HERO_3D_TEXT.columnRows.map((row, idx) => {
                        const toneColor =
                          row.tone === 'success'
                            ? 'text-[#16A36A]'
                            : row.tone === 'warning'
                            ? 'text-[#D99121]'
                            : 'text-[#2563EB]';
                        return (
                          <div
                            key={row.col}
                            style={{ animationDelay: `${idx * 0.7}s` }}
                            className={`ss-hero-row-pulse h-[32px] px-3.5 rounded-[8px] flex items-center justify-between text-[11px] border border-transparent ${
                              idx % 2 === 0 ? 'bg-[#FAFBFD]' : 'bg-white'
                            }`}
                          >
                            <span className="font-medium text-[#18243A] w-2/5">{row.col}</span>
                            <span className="text-[#667085] font-mono text-[10.5px] w-1/3">
                              {row.type}
                            </span>
                            <span className={`font-semibold text-right ${toneColor}`}>{row.status}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action CTA */}
                  <button
                    type="button"
                    onClick={handleInspectReport}
                    className="w-full h-[40px] rounded-[10px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[12px] font-semibold transition flex items-center justify-center gap-2 shadow-xs"
                  >
                    <span>{PUBLIC_HERO_3D_TEXT.ctaLabel}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Floating Live Telemetry Chip */}
            <div className="flex justify-start mt-3 pl-1">
              <div className="ss-hero-satellite-bot inline-flex items-center gap-3 rounded-full bg-[#10213B] text-white px-4 py-2 shadow-xl shadow-slate-900/20 border border-[#273E63] text-[11px]">
                <span className="inline-flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
                  <span>{PUBLIC_HERO_3D_TEXT.telemetryCount}</span>
                </span>
                <span className="w-px h-3.5 bg-[#273E63]" />
                <span className="font-mono text-[10px] text-[#9CC0FF]">
                  {PUBLIC_HERO_3D_TEXT.telemetryLatency}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
