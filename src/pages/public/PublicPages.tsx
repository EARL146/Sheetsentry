import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { AuthSessionUser, requestPasswordReset } from '../../services/apiClient';
import { BrandLogo, ProvisionalConfigSwitcher } from '../../components/SharedUI';
import { Hero3DValidationStage } from '../../components/Hero3DValidationStage';
import { PUBLIC_PRICING_TEXT } from '../../content/publicText';
import { usePublicIX } from '../../interactions/usePublicIX';
import { formatPlanPrice, getPlansByMode } from '../../config/productConfig';

/**
 * 1. Public Landing Page
 */
export const LandingPage: React.FC = () => {
  const { configMode, currency, authUser } = useAppState();
  const plans = getPlansByMode(configMode);

  return (
    <div className="bg-[#F6F8FC] text-[#10213B]">
      {/* Hero Section — White Background */}
      <section className="ss-public-hero">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[100px] py-7 sm:py-9 lg:py-11 grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-12 items-center">
          {/* Left Hero Copy */}
          <div className="lg:col-span-6 space-y-5 sm:space-y-6">
            <div className="ss-public-eyebrow">
              THE SMARTER WAY TO CHECK DATA
            </div>

            <h1 className="text-[32px] sm:text-[46px] lg:text-[52px] font-bold text-[#10213B] leading-[1.1] lg:leading-[1.08] tracking-tight">
              Know what&apos;s wrong with your data.
              <br />
              Before it breaks your workflow.
            </h1>

            <p className="text-[14px] sm:text-[15px] text-[#667085] leading-[1.6] max-w-[540px]">
              SheetSentry checks your recurring CSV and Excel files against saved rules — then
              shows you exactly which rows need attention.
            </p>

            <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-3 sm:gap-4 pt-1">
              <Link
                to={authUser ? '/app/upload' : '/register?next=/app/upload'}
                className="h-[48px] sm:h-[54px] px-6 sm:px-8 rounded-[12px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-[13px] inline-flex items-center justify-center shadow-sm transition w-full sm:w-auto"
              >
                Try it free
              </Link>
              <Link
                to="/features"
                className="h-[48px] sm:h-[54px] px-6 sm:px-7 rounded-[12px] bg-white border border-[#E4E9F1] hover:border-[#2563EB] text-[#10213B] font-semibold text-[13px] inline-flex items-center justify-center transition w-full sm:w-auto"
              >
                Explore the product
              </Link>
            </div>

            <div className="space-y-2 pt-2">
              <p className="text-[12px] font-medium text-[#667085]">
                No setup scripts. No spreadsheet detective work.
              </p>
              <p className="text-[9.5px] font-bold uppercase tracking-[0.06em] text-[#667085]">
                MADE FOR PEOPLE WHO WORK WITH DATA EVERY WEEK
              </p>
            </div>
          </div>

          {/* Right Hero 3D Interactive Spatial Stage */}
          <div className="lg:col-span-6">
            <Hero3DValidationStage />
          </div>
        </div>
      </section>

      {/* Trust Strip (Node 3:143) */}
      <section className="bg-[#F6F8FC] border-b border-[#E4E9F1] py-6">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-[100px] flex flex-wrap items-center justify-between gap-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085]">
            BUILT FOR REPEATABLE WORK
          </span>
          <div className="flex flex-wrap items-center gap-3">
            {['CSV + XLSX', 'Reusable rules', 'Row-level issues', 'Export-ready reports'].map(
              (item) => (
                <div
                  key={item}
                  className="bg-white border border-[#E4E9F1] rounded-[12px] h-[40px] px-5 inline-flex items-center justify-center text-[12px] font-semibold text-[#10213B]"
                >
                  {item}
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Features Section — Catch the problems before they travel (Node 3:153) */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-[100px] py-20">
        <div className="max-w-2xl">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB]">
            A CLEARER WAY TO CHECK FILES
          </div>
          <h2 className="text-[32px] sm:text-[36px] font-bold text-[#10213B] mt-2 leading-tight">
            Catch the problems before they travel.
          </h2>
          <p className="text-[14px] text-[#667085] mt-2.5 leading-relaxed">
            Designed for recurring spreadsheets where one bad column or missing value can slow
            everyone down.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          {[
            {
              num: '01',
              title: 'Reusable validation profiles',
              desc: 'Save your expected columns, required fields, formats, and uniqueness checks once — then run them on every new file.',
            },
            {
              num: '02',
              title: 'Row-level explanations',
              desc: 'See the exact row, column, and reason each check failed so you can fix the source file without hunting through thousands of cells.',
            },
            {
              num: '03',
              title: 'Clean reports, ready to share',
              desc: 'Download a structured summary or filtered error rows to share with your team, client, or data provider.',
            },
          ].map((card) => (
            <div
              key={card.num}
              className="bg-white border border-[#E4E9F1] rounded-[18px] p-7 flex flex-col justify-between hover:border-[#2563EB]/50 transition"
            >
              <div>
                <div className="w-[40px] h-[40px] rounded-[11px] bg-[#EAF2FF] text-[#2563EB] font-bold text-[12px] flex items-center justify-center">
                  {card.num}
                </div>
                <h3 className="text-[18px] font-bold text-[#10213B] mt-5">{card.title}</h3>
                <p className="text-[13px] text-[#667085] mt-2.5 leading-relaxed">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Band — Repaired Spacing (Nodes 3:171 & 113:2) */}
      <section className="bg-[#F0F5FF] border-y border-[#E4E9F1] py-20">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-[100px]">
          {/* Node 113:2 Fix: Guaranteed vertical separation between eyebrow and heading */}
          <div className="mb-10">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB] mb-3">
              A SIMPLE, REPEATABLE FLOW
            </div>
            <h2 className="text-[32px] sm:text-[36px] font-bold text-[#10213B] leading-tight">
              From upload to clear answers.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                num: '01',
                title: 'Upload a file',
                desc: 'Drop in a CSV or Excel workbook and choose a validation profile.',
              },
              {
                num: '02',
                title: 'Run the checks',
                desc: 'SheetSentry inspects structure, required columns, formats, and duplicates.',
              },
              {
                num: '03',
                title: 'Fix with confidence',
                desc: 'Review the highlighted issues or export a clean report for your workflow.',
              },
            ].map((step) => (
              <div
                key={step.num}
                className="bg-white border border-[#E4E9F1] rounded-[18px] p-7 shadow-sm"
              >
                <div className="w-[36px] h-[36px] rounded-full bg-[#2563EB] text-white font-bold text-[11px] flex items-center justify-center">
                  {step.num}
                </div>
                <h3 className="text-[18px] font-bold text-[#10213B] mt-5">{step.title}</h3>
                <p className="text-[13px] text-[#667085] mt-2 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Actionable Result Section (Node 3:189) */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-[100px] py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 space-y-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB]">
              A RESULT YOU CAN ACT ON
            </div>
            <h2 className="text-[32px] sm:text-[34px] font-bold text-[#10213B] leading-tight">
              Know what failed — and where to fix it.
            </h2>
            <p className="text-[14px] text-[#667085] leading-relaxed">
              Instead of vague import errors, SheetSentry groups issues clearly and points to the
              exact rows affected.
            </p>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-white border border-[#E4E9F1] rounded-[18px] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[16px] font-bold text-[#10213B]">Validation report</h3>
                <span className="px-3 py-1 rounded-full bg-[#EAF2FF] text-[#2563EB] text-[10px] font-bold">
                  20 issues
                </span>
              </div>

              <div className="space-y-3">
                {[
                  {
                    issue: 'Missing customer email',
                    rows: '8 rows',
                    sev: 'High',
                    pill: 'bg-[#FDECEC] text-[#D84A4A]',
                  },
                  {
                    issue: 'Duplicate order ID',
                    rows: '7 rows',
                    sev: 'Medium',
                    pill: 'bg-[#FFF4DE] text-[#D99121]',
                  },
                  {
                    issue: 'Invalid date value',
                    rows: '5 rows',
                    sev: 'Medium',
                    pill: 'bg-[#FFF4DE] text-[#D99121]',
                  },
                ].map((item) => (
                  <div
                    key={item.issue}
                    className="bg-[#F7F9FC] rounded-[10px] px-4 py-3 flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-[#10213B]">{item.issue}</span>
                    <div className="flex items-center gap-6">
                      <span className="text-[#667085]">{item.rows}</span>
                      <span
                        className={`px-3 py-0.5 rounded-full text-[10px] font-bold ${item.pill}`}
                      >
                        {item.sev}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Monthly Plans Section (Node 3:193 - 3:216) */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-[100px] py-20 pb-28">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB]">
              SIMPLE MONTHLY PLANS
            </div>
            <h2 className="text-[32px] sm:text-[34px] font-bold text-[#10213B] mt-2 leading-tight">
              Start free. Upgrade when it helps.
            </h2>
            <p className="text-[14px] text-[#667085] mt-1.5">
              Choose a plan that fits how often you check files.
            </p>
          </div>

          <Link
            to="/pricing"
            className="h-[42px] px-5 rounded-[11px] bg-white border border-[#E4E9F1] hover:border-[#2563EB] text-[#10213B] text-[12px] font-semibold inline-flex items-center gap-1.5 transition"
          >
            <span>View full plan comparison</span>
            <span>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(['free', 'starter', 'pro'] as const).map((planId) => {
            const p = plans[planId];
            const isPro = planId === 'pro';
            const isStarter = planId === 'starter';
            const checksLabel =
              p.monthlyValidations === 'UNLIMITED'
                ? 'Unlimited checks / month'
                : `${p.monthlyValidations} checks / month`;
            return (
              <div
                key={planId}
                className={`rounded-[18px] p-8 border transition flex flex-col justify-between ${
                  isPro
                    ? 'bg-[#F3F7FF] border-[#2563EB] shadow-sm'
                    : 'bg-white border-[#E4E9F1]'
                }`}
              >
                <div>
                  <div className="text-[17px] font-bold text-[#10213B]">{p.name}</div>
                  <div className="text-[32px] font-bold text-[#10213B] mt-2.5">
                    {formatPlanPrice(p, currency)}
                    <span className="text-[13px] font-normal text-[#667085]"> / month</span>
                  </div>
                  <div className="text-[13px] text-[#667085] mt-2">
                    {isPro
                      ? 'For heavier weekly workflows'
                      : isStarter
                      ? 'For recurring file checks'
                      : 'Try the core workflow'}
                  </div>
                  <div className="text-[12px] font-medium text-[#18243A] mt-3">
                    {p.maxProfiles} {p.maxProfiles === 1 ? 'profile' : 'profiles'} · {checksLabel}
                  </div>
                </div>

                <Link
                  to={isPro ? '/pricing' : authUser ? '/app/upload' : '/register?next=/app/upload'}
                  className={`mt-8 h-[48px] rounded-[12px] text-[14px] font-semibold inline-flex items-center justify-center transition ${
                    isPro || isStarter
                      ? 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-xs'
                      : 'bg-white border border-[#E4E9F1] hover:border-[#2563EB] text-[#10213B]'
                  }`}
                >
                  {isPro ? 'Choose Pro' : 'Get started'}
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

/**
 * 2. Public Features Page (Figma Node 22:375)
 */
export const FeaturesPage: React.FC = () => {
  const { authUser } = useAppState();
  return (
    <div className="bg-[#F5F7FB] text-[#10213B] py-14 lg:py-20">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-[100px] space-y-20">
        {/* Top Split Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center px-3.5 h-[24px] rounded-[12px] bg-[#EAF2FF] text-[#2563EB] text-[10px] font-bold uppercase tracking-wider">
              PRODUCT FEATURES
            </div>
            <h1 className="text-[36px] sm:text-[42px] font-bold text-[#10213B] leading-[1.12]">
              Everything you need to trust your spreadsheet data.
            </h1>
            <p className="text-[15px] text-[#667085] leading-relaxed max-w-[650px]">
              A focused toolkit for recurring CSV and Excel files—without building a data pipeline.
            </p>
            <div className="pt-2">
              <Link
                to={authUser ? '/app/upload' : '/register?next=/app/upload'}
                className="h-[44px] px-7 rounded-[12px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-semibold inline-flex items-center justify-center shadow-xs transition"
              >
                Start for free
              </Link>
            </div>
          </div>

          {/* Right Validation Overview Card (Node 22:399) */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-[#E4E9F1] rounded-[18px] p-6 shadow-sm">
              <h2 className="text-[14px] font-bold text-[#10213B] mb-4">Validation overview</h2>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#F7F9FC] rounded-[12px] p-3.5">
                  <div className="text-[10px] text-[#667085]">Rows checked</div>
                  <div className="text-[20px] font-bold text-[#10213B] mt-1">1,250</div>
                </div>
                <div className="bg-[#F7F9FC] rounded-[12px] p-3.5">
                  <div className="text-[10px] text-[#667085]">Valid rows</div>
                  <div className="text-[20px] font-bold text-[#10213B] mt-1">1,230</div>
                </div>
                <div className="bg-[#F7F9FC] rounded-[12px] p-3.5">
                  <div className="text-[10px] text-[#667085]">Issues found</div>
                  <div className="text-[20px] font-bold text-[#10213B] mt-1">20</div>
                </div>
              </div>
              <p className="text-[12px] text-[#667085] mt-4 leading-relaxed">
                Review missing values, duplicates, invalid dates and unexpected schema changes.
              </p>
            </div>
          </div>
        </div>

        {/* Section Heading & 6 Core Feature Cards (Nodes 22:411 - 22:442) */}
        <div className="space-y-8">
          <div>
            <h2 className="text-[28px] sm:text-[32px] font-bold text-[#10213B]">
              A practical workflow, not another complicated platform.
            </h2>
            <p className="text-[15px] text-[#667085] mt-1.5">
              Save your checks once, then reuse them on each new file.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                num: '01',
                title: 'Reusable profiles',
                desc: 'Keep column requirements, accepted formats and duplicate rules together.',
              },
              {
                num: '02',
                title: 'Schema change detection',
                desc: 'Notice when new files add, remove or rename columns.',
              },
              {
                num: '03',
                title: 'Row-level error detail',
                desc: 'Locate the row, column, value and validation rule that failed.',
              },
              {
                num: '04',
                title: 'Downloadable error rows',
                desc: 'Share a clean file containing only the records that need review.',
              },
              {
                num: '05',
                title: 'Run history',
                desc: 'Compare past checks and see recurring data-quality problems.',
              },
              {
                num: '06',
                title: 'Private file handling',
                desc: 'Keep uploads private with clear retention and deletion controls.',
              },
            ].map((feat) => (
              <div
                key={feat.num}
                className="bg-white border border-[#E4E9F1] rounded-[16px] p-6 hover:border-[#2563EB]/50 transition shadow-xs"
              >
                <span className="inline-flex items-center justify-center px-3 h-[24px] rounded-[12px] bg-[#EAF2FF] text-[#2563EB] text-[10px] font-bold">
                  {feat.num}
                </span>
                <h3 className="text-[17px] font-bold text-[#10213B] mt-5">{feat.title}</h3>
                <p className="text-[13px] text-[#667085] mt-2 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Dark CTA Band (Nodes 22:443 - 22:447) */}
        <div className="bg-[#111F37] rounded-[20px] p-8 sm:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
          <div>
            <h2 className="text-[24px] sm:text-[26px] font-bold text-white">
              Spend less time finding spreadsheet errors.
            </h2>
            <p className="text-[13px] text-[#C6D4E9] mt-2">
              Create a reusable profile and turn every new file into a clear review.
            </p>
          </div>
          <Link
            to={authUser ? '/app/upload' : '/register?next=/app/upload'}
            className="h-[44px] px-7 rounded-[10px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-semibold inline-flex items-center justify-center shrink-0 transition"
          >
            Try SheetSentry
          </Link>
        </div>

        {/* Designed for Repeat Work (Nodes 22:448 - 22:457) */}
        <div className="space-y-6">
          <div>
            <h2 className="text-[28px] font-bold text-[#10213B]">Designed for repeat work</h2>
            <p className="text-[14px] text-[#667085] mt-1">
              The product gets more useful as your saved profiles and run history grow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                num: '01',
                title: 'Save your rules',
                desc: 'Create a validation profile for each recurring file type.',
              },
              {
                num: '02',
                title: 'Review with clarity',
                desc: 'Filter issues by severity, column or rule in one view.',
              },
              {
                num: '03',
                title: 'Export and move on',
                desc: 'Download the report or error rows and continue your workflow.',
              },
            ].map((step) => (
              <div
                key={step.num}
                className="bg-white border border-[#E4E9F1] rounded-[16px] p-6"
              >
                <span className="inline-flex items-center justify-center px-3 h-[24px] rounded-[12px] bg-[#EAF2FF] text-[#2563EB] text-[10px] font-bold">
                  {step.num}
                </span>
                <h3 className="text-[16px] font-bold text-[#10213B] mt-4">{step.title}</h3>
                <p className="text-[13px] text-[#667085] mt-1.5">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 3. Public How It Works Page (Figma Node 22:476)
 */
export const HowItWorksPage: React.FC = () => {
  const { authUser } = useAppState();
  return (
    <div className="bg-[#F5F7FB] text-[#10213B]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-[100px] py-14 lg:py-20 space-y-20">
        {/* Hero */}
        <div className="space-y-4">
          <div className="inline-flex items-center px-4 h-[24px] rounded-[12px] bg-[#EAF2FF] text-[#2563EB] text-[10px] font-bold uppercase tracking-wider">
            HOW SHEETSENTRY WORKS
          </div>
          <h1 className="text-[36px] sm:text-[42px] font-bold text-[#10213B] leading-tight">
            From file upload to actionable answers.
          </h1>
          <p className="text-[15px] text-[#667085] max-w-[820px]">
            A repeatable process that helps you check data before you import, share or report it.
          </p>
        </div>

        {/* 3 Horizontal Workflow Cards with Arrows (Nodes 22:498 - 22:514) */}
        <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-center">
          <div className="lg:col-span-3 bg-white border border-[#E4E9F1] rounded-[16px] p-6 h-full">
            <span className="inline-flex items-center justify-center px-3 h-[24px] rounded-[12px] bg-[#EAF2FF] text-[#2563EB] text-[10px] font-bold">
              01
            </span>
            <h3 className="text-[16px] font-bold text-[#10213B] mt-4">Upload your spreadsheet</h3>
            <p className="text-[12px] text-[#667085] mt-2">
              Choose a CSV or Excel file from your device.
            </p>
          </div>

          <div className="hidden lg:flex lg:col-span-1 justify-center text-[#2563EB] font-bold text-2xl">
            →
          </div>

          <div className="lg:col-span-3 bg-white border border-[#E4E9F1] rounded-[16px] p-6 h-full">
            <span className="inline-flex items-center justify-center px-3 h-[24px] rounded-[12px] bg-[#EAF2FF] text-[#2563EB] text-[10px] font-bold">
              02
            </span>
            <h3 className="text-[16px] font-bold text-[#10213B] mt-4">Choose saved rules</h3>
            <p className="text-[12px] text-[#667085] mt-2">
              Select a profile or define required columns.
            </p>
          </div>

          <div className="hidden lg:flex lg:col-span-1 justify-center text-[#2563EB] font-bold text-2xl">
            →
          </div>

          <div className="lg:col-span-3 bg-white border border-[#E4E9F1] rounded-[16px] p-6 h-full">
            <span className="inline-flex items-center justify-center px-3 h-[24px] rounded-[12px] bg-[#EAF2FF] text-[#2563EB] text-[10px] font-bold">
              03
            </span>
            <h3 className="text-[16px] font-bold text-[#10213B] mt-4">Review validation</h3>
            <p className="text-[12px] text-[#667085] mt-2">
              See passed rows, issues and exact locations.
            </p>
          </div>
        </div>

        {/* What happens during validation (Nodes 22:515 - 22:539) */}
        <div className="space-y-6">
          <div>
            <h2 className="text-[28px] sm:text-[30px] font-bold text-[#10213B]">
              What happens during validation
            </h2>
            <p className="text-[14px] text-[#667085] mt-1">
              Your original file stays unchanged while SheetSentry checks a protected copy.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                num: '01',
                title: 'File inspection',
                desc: 'Check file type, size, encoding, headers and workbook structure.',
              },
              {
                num: '02',
                title: 'Rule evaluation',
                desc: 'Check required fields, duplicates, data types, date formats and schema.',
              },
              {
                num: '03',
                title: 'Issue summary',
                desc: 'Group failures by issue type and affected row.',
              },
              {
                num: '04',
                title: 'Export and history',
                desc: 'Generate a report, save the run summary and allow an export.',
              },
            ].map((detail, idx) => (
              <React.Fragment key={detail.num}>
                <div className="bg-white border border-[#E4E9F1] rounded-[14px] px-6 py-7 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-5 md:w-2/5">
                    <span className="inline-flex items-center justify-center px-3.5 h-[24px] rounded-[12px] bg-[#EAF2FF] text-[#2563EB] text-[10px] font-bold shrink-0">
                      {detail.num}
                    </span>
                    <h3 className="text-[15px] font-bold text-[#10213B]">{detail.title}</h3>
                  </div>
                  <p className="text-[13px] text-[#667085] md:w-3/5">{detail.desc}</p>
                </div>
                {idx < 3 && (
                  <div className="text-center text-[#2563EB] font-bold text-xl leading-none">
                    ↓
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Dark CTA Band (Node 22:540) */}
      <div className="bg-[#111F37] py-12 border-b border-[#1B2D4B]">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-[100px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <h2 className="text-[26px] sm:text-[28px] font-bold text-white">
            Ready to check your next file?
          </h2>
          <Link
            to={authUser ? '/app/dashboard' : '/register?next=/app/upload'}
            className="h-[44px] px-8 rounded-[10px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-semibold inline-flex items-center justify-center transition"
          >
            Create a free account
          </Link>
        </div>
      </div>
    </div>
  );
};

/**
 * 4. Public Pricing Page (Figma Node 22:555 + SSOT 138:2 Toggle)
 */
export const PricingPage: React.FC = () => {
  const {
    currency,
    setCurrency,
    configMode,
    setConfigMode,
    handleSelectPlan,
  } = usePublicIX();
  const plans = getPlansByMode(configMode);

  return (
    <div className="bg-[#F5F7FB] text-[#10213B] py-14 lg:py-20">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-[100px] space-y-12">
        <div className="space-y-4">
          <div className="inline-flex items-center px-3.5 h-[24px] rounded-[12px] bg-[#EAF2FF] text-[#2563EB] text-[10px] font-bold uppercase tracking-wider">
            {PUBLIC_PRICING_TEXT.eyebrow}
          </div>
          <h1 className="text-[36px] sm:text-[42px] font-bold text-[#10213B] leading-tight">
            {PUBLIC_PRICING_TEXT.heading}
          </h1>
          <p className="text-[15px] text-[#667085] max-w-[850px]">
            {PUBLIC_PRICING_TEXT.subheading}
          </p>
        </div>

        <ProvisionalConfigSwitcher
          configMode={configMode}
          onChangeMode={setConfigMode}
          currency={currency}
          onChangeCurrency={setCurrency}
        />

        {/* 3 Pricing Cards (Nodes 22:577 - 22:614) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free Plan (Node 22:577) */}
          <div className="bg-white border border-[#E4E9F1] rounded-[18px] p-8 flex flex-col justify-between shadow-xs">
            <div>
              <h3 className="text-[18px] font-bold text-[#10213B]">Free</h3>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-[36px] font-bold text-[#10213B]">
                  {formatPlanPrice(plans.free, currency)}
                </span>
                <span className="text-[11px] text-[#667085]">per month</span>
              </div>
              <p className="text-[12px] text-[#667085] mt-1.5">For trying the workflow</p>

              <div className="my-6 h-px bg-[#E4E9F1]" />

              <ul className="space-y-3.5 text-[12px] text-[#10213B]">
                <li className="flex items-center gap-2.5">
                  <span className="text-[#2563EB] font-bold">✓</span>
                  <span>{plans.free.maxProfiles} validation profile</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-[#2563EB] font-bold">✓</span>
                  <span>{plans.free.monthlyValidations} checks per month</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-[#2563EB] font-bold">✓</span>
                  <span>100 MB storage</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-[#2563EB] font-bold">✓</span>
                  <span>{plans.free.retentionDays}-day report retention</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => handleSelectPlan('free')}
              className="mt-8 w-full h-[44px] rounded-[10px] bg-white border border-[#E4E9F1] hover:border-[#2563EB] text-[#10213B] text-[13px] font-semibold transition"
            >
              Get started
            </button>
          </div>

          {/* Starter Plan (Node 22:589) */}
          <div className="bg-white border border-[#E4E9F1] rounded-[18px] p-8 flex flex-col justify-between shadow-xs">
            <div>
              <h3 className="text-[18px] font-bold text-[#10213B]">Starter</h3>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-[36px] font-bold text-[#10213B]">
                  {formatPlanPrice(plans.starter, currency)}
                </span>
                <span className="text-[11px] text-[#667085]">per month</span>
              </div>
              <p className="text-[12px] text-[#667085] mt-1.5">For recurring individual work</p>

              <div className="my-6 h-px bg-[#E4E9F1]" />

              <ul className="space-y-3.5 text-[12px] text-[#10213B]">
                <li className="flex items-center gap-2.5">
                  <span className="text-[#2563EB] font-bold">✓</span>
                  <span>{plans.starter.maxProfiles} validation profiles</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-[#2563EB] font-bold">✓</span>
                  <span>{plans.starter.monthlyValidations} checks per month</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-[#2563EB] font-bold">✓</span>
                  <span>2 GB storage</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-[#2563EB] font-bold">✓</span>
                  <span>{plans.starter.retentionDays}-day report retention</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => handleSelectPlan('starter')}
              className="mt-8 w-full h-[44px] rounded-[10px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-semibold transition shadow-xs"
            >
              Get started
            </button>
          </div>

          {/* Pro Plan (Node 22:601 — POPULAR Pill & #F0F5FF Card) */}
          <div className="bg-[#F0F5FF] border border-[#2563EB] rounded-[18px] p-8 flex flex-col justify-between shadow-sm relative">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-[18px] font-bold text-[#10213B]">Pro</h3>
                <span className="px-3 h-[24px] rounded-[12px] bg-[#2563EB] text-white text-[10px] font-bold inline-flex items-center">
                  POPULAR
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-[36px] font-bold text-[#10213B]">
                  {formatPlanPrice(plans.pro, currency)}
                </span>
                <span className="text-[11px] text-[#667085]">per month</span>
              </div>
              <p className="text-[12px] text-[#667085] mt-1.5">For heavier weekly workflows</p>

              <div className="my-6 h-px bg-[#D5E3FC]" />

              <ul className="space-y-3.5 text-[12px] text-[#10213B]">
                <li className="flex items-center gap-2.5">
                  <span className="text-[#2563EB] font-bold">✓</span>
                  <span>{plans.pro.maxProfiles} validation profiles</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-[#2563EB] font-bold">✓</span>
                  <span>
                    {plans.pro.monthlyValidations === 'UNLIMITED'
                      ? 'Unlimited checks per month'
                      : `${plans.pro.monthlyValidations} checks per month`}
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-[#2563EB] font-bold">✓</span>
                  <span>10 GB storage</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-[#2563EB] font-bold">✓</span>
                  <span>{plans.pro.retentionDays}-day report retention</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => handleSelectPlan('pro')}
              className="mt-8 w-full h-[44px] rounded-[10px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-semibold transition shadow-xs"
            >
              Choose Pro
            </button>
          </div>
        </div>

        {/* Plan Comparison Table (Nodes 22:615 - 22:647) */}
        <div className="space-y-4 pt-4">
          <div>
            <h2 className="text-[28px] font-bold text-[#10213B]">Compare what is included</h2>
            <p className="text-[14px] text-[#667085] mt-1">
              All plans use the same validation experience. Limits determine how much you can run.
            </p>
          </div>

          <div className="bg-white border border-[#E4E9F1] rounded-[16px] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E4E9F1] text-[10px] font-bold uppercase tracking-wider text-[#667085] bg-[#FBFCFE]">
                    <th className="py-4 px-6">FEATURE</th>
                    <th className="py-4 px-6">FREE</th>
                    <th className="py-4 px-6">STARTER</th>
                    <th className="py-4 px-6 text-[#2563EB]">PRO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E9F1] text-[#667085]">
                  <tr>
                    <td className="py-4 px-6 font-semibold text-[#10213B]">Checks / month</td>
                    <td className="py-4 px-6">3</td>
                    <td className="py-4 px-6">50</td>
                    <td className="py-4 px-6 font-semibold text-[#10213B]">300</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-semibold text-[#10213B]">Profiles</td>
                    <td className="py-4 px-6">1</td>
                    <td className="py-4 px-6">5</td>
                    <td className="py-4 px-6 font-semibold text-[#10213B]">20</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-semibold text-[#10213B]">Max file size</td>
                    <td className="py-4 px-6">10 MB</td>
                    <td className="py-4 px-6">50 MB</td>
                    <td className="py-4 px-6 font-semibold text-[#10213B]">250 MB</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-semibold text-[#10213B]">Storage</td>
                    <td className="py-4 px-6">100 MB</td>
                    <td className="py-4 px-6">2 GB</td>
                    <td className="py-4 px-6 font-semibold text-[#10213B]">10 GB</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-semibold text-[#10213B]">Report retention</td>
                    <td className="py-4 px-6">7 days</td>
                    <td className="py-4 px-6">30 days</td>
                    <td className="py-4 px-6 font-semibold text-[#10213B]">90 days</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Frequently Asked Questions (Nodes 22:647 - 22:656) */}
        <div className="space-y-4 pt-4">
          <h2 className="text-[28px] font-bold text-[#10213B]">Frequently asked questions</h2>
          <div className="space-y-2.5 max-w-full">
            {[
              {
                q: 'Can I cancel at any time?',
                a: 'Yes. You can cancel or change your plan at any time from your workspace billing settings. If you cancel, your plan remains active until the end of your current billing cycle.',
              },
              {
                q: 'What happens when I reach my monthly limit?',
                a: 'When your checks reach the monthly tier limit, file execution is paused until your next monthly billing cycle resets or until you upgrade to a higher tier.',
              },
              {
                q: 'Are original files stored forever?',
                a: 'No. SheetSentry does not store spreadsheets permanently. Files are held in private encrypted storage and automatically purged after your plan retention SLA (7 days on Free, 30 days on Starter, 90 days on Pro).',
              },
            ].map((item, idx) => (
              <details
                key={item.q}
                className="group bg-white border border-[#E4E9F1] rounded-[9px] overflow-hidden transition"
              >
                <summary className="h-[44px] px-5 flex items-center justify-between cursor-pointer list-none select-none text-[12px] font-semibold text-[#10213B] hover:text-[#2563EB]">
                  <span>{item.q}</span>
                  <span className="text-[#2563EB] text-[16px] font-bold transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="px-5 pb-4 text-[12px] text-[#667085] leading-relaxed border-t border-[#F0F4FA] pt-3">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 5. Public FAQ Page (Figma Node 22:668)
 */
export const FaqPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openKey, setOpenKey] = useState<string | null>('0-0');

  const faqSections = [
    {
      title: 'Getting started',
      items: [
        {
          key: '0-0',
          q: 'What is SheetSentry?',
          a: 'SheetSentry is a spreadsheet validation and data quality platform that checks recurring CSV and Excel files against saved validation rules before they enter your database or workflow.',
        },
        {
          key: '0-1',
          q: 'Who is SheetSentry designed for?',
          a: 'Operations, finance, analytics, and engineering teams that handle weekly or monthly spreadsheet imports and want row-level visibility without writing custom scripts.',
        },
        {
          key: '0-2',
          q: 'How do I create my first validation profile?',
          a: 'Upload a sample CSV or XLSX file, map its headers in the Column Mapping screen, toggle your required fields and format rules in the Rule Builder, and click Save Profile.',
        },
      ],
    },
    {
      title: 'Files and validation',
      items: [
        {
          key: '1-0',
          q: 'Which file formats can I upload?',
          a: 'SheetSentry supports .csv and .xlsx workbooks in Phase 1–5, verified via magic-byte inspection and decompression ratio safety checks.',
        },
        {
          key: '1-1',
          q: 'Does SheetSentry change my original file?',
          a: 'No. Your original file stays untouched while SheetSentry evaluates a protected read-only copy and generates separate downloadable reports.',
        },
        {
          key: '1-2',
          q: 'Which validation rules are available?',
          a: 'Required fields, data type checks (Number, Email, Date, Currency, Boolean), uniqueness/duplicate detection, allowed enum lists, numeric ranges, and regex patterns.',
        },
        {
          key: '1-3',
          q: 'What happens when a column changes?',
          a: 'Schema change detection highlights missing required headers or newly added unmapped columns during pre-flight inspection before row rules run.',
        },
      ],
    },
    {
      title: 'Privacy and security',
      items: [
        {
          key: '2-0',
          q: 'Who can access my uploaded files?',
          a: 'Uploaded files are strictly isolated to your workspace. Platform administrators see masked metadata by default and cannot view cell values without a verified customer support ticket.',
        },
        {
          key: '2-1',
          q: 'How long are files retained?',
          a: 'Retention depends on your active plan: 7 days on Free, 30 days on Starter, and 90 days on Pro.',
        },
        {
          key: '2-2',
          q: 'Can I permanently delete an upload?',
          a: 'Yes. Workspace owners can purge any uploaded file and its associated validation reports immediately from Run History or Settings.',
        },
      ],
    },
    {
      title: 'Plans and billing',
      items: [
        {
          key: '3-0',
          q: 'What happens when I reach my plan limit?',
          a: 'Your existing reports remain accessible, and you can either wait for your monthly quota reset or upgrade to Starter or Pro immediately.',
        },
        {
          key: '3-1',
          q: 'Can I change or cancel my plan?',
          a: 'Yes. You can upgrade, downgrade, or cancel your subscription at any time from Account → Billing & plans.',
        },
        {
          key: '3-2',
          q: 'Where can I find my invoices?',
          a: 'All settled USD and PHP invoices and downloadable receipts are listed in Account → Billing & plans.',
        },
      ],
    },
  ];

  return (
    <div className="bg-[#F5F7FB] text-[#10213B] py-14 lg:py-20">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-[100px] space-y-10">
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center px-3.5 h-[24px] rounded-[12px] bg-[#EAF2FF] text-[#2563EB] text-[10px] font-bold uppercase tracking-wider">
            HELP &amp; FAQ
          </div>
          <h1 className="text-[36px] sm:text-[40px] font-bold text-[#10213B]">
            Answers before you upload.
          </h1>
          <p className="text-[14px] text-[#667085]">
            Learn how SheetSentry handles files, validation, reports, privacy and plans.
          </p>
        </div>

        {/* Search Input (Node 22:690) */}
        <div className="bg-white border border-[#E4E9F1] rounded-[12px] h-[54px] px-5 flex items-center gap-3">
          <Search className="w-4 h-4 text-[#667085]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search a question or topic..."
            className="w-full bg-transparent text-[13px] text-[#10213B] placeholder-[#667085] focus:outline-none"
          />
        </div>

        {/* 4 FAQ Sections */}
        <div className="space-y-8">
          {faqSections.map((sec) => {
            const filtered = sec.items.filter(
              (item) =>
                item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.a.toLowerCase().includes(searchQuery.toLowerCase())
            );
            if (filtered.length === 0) return null;
            return (
              <div key={sec.title} className="space-y-3">
                <h2 className="text-[16px] font-bold text-[#10213B]">{sec.title}</h2>
                <div className="space-y-2.5">
                  {filtered.map((item) => {
                    const isOpen = openKey === item.key;
                    return (
                      <div
                        key={item.key}
                        className="bg-white border border-[#E4E9F1] rounded-[10px] overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => setOpenKey(isOpen ? null : item.key)}
                          className="w-full min-h-[50px] px-5 py-3 flex items-center justify-between text-left hover:bg-[#FBFCFE] transition"
                        >
                          <span className="text-[13px] font-medium text-[#10213B]">{item.q}</span>
                          <span className="text-[#2563EB] font-bold text-[18px] leading-none">
                            {isOpen ? '−' : '+'}
                          </span>
                        </button>
                        {isOpen && (
                          <div className="px-5 pb-4 pt-1 text-[12px] text-[#667085] border-t border-[#E4E9F1]/60 leading-relaxed">
                            {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/**
 * 6. Public Auth Pages — Login, Register, Reset Password + 13-State Machine (Nodes 22:746, 22:803, 22:862, 119:248)
 */
export const AuthPage: React.FC<{ mode: 'login' | 'register' | 'reset' }> = ({ mode }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, register, loginWithGoogle, authUser, logout } = useAppState();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [authStateId, setAuthStateId] = useState<string>('IDLE');
  const [showStateDrawer, setShowStateDrawer] = useState(false);

  const nextParam = searchParams.get('next');
  const planParam = searchParams.get('plan');

  useEffect(() => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setAuthStateId('IDLE');
  }, [mode]);

  const resolveDestinationForUser = (user: AuthSessionUser): string => {
    if (user.appRole === 'ADMIN') {
      if (nextParam && (nextParam.startsWith('/admin') || nextParam.startsWith('/app'))) {
        return nextParam;
      }
      return '/admin/overview';
    }
    if (nextParam && nextParam.startsWith('/app/')) {
      return nextParam;
    }
    return '/app/dashboard';
  };

  const authStates = [
    { id: 'IDLE', label: 'Default Sign-In View' },
    { id: '1.1', label: '1.1 Check Inbox Verification' },
    { id: '1.2', label: '1.2 Email Verified Success' },
    { id: '1.3', label: '1.3 Expired Verification Link' },
    { id: '1.4', label: '1.4 Workspace Onboarding' },
    { id: '2.1', label: '2.1 Invalid Credentials' },
    { id: '2.2', label: '2.2 Rate Limit Lockout (429)' },
    { id: '2.3', label: '2.3 Suspended Account' },
    { id: '2.4', label: '2.4 Session Expired' },
    { id: '3.1', label: '3.1 Reset Email Sent' },
    { id: '3.2', label: '3.2 Set New Password' },
    { id: '3.3', label: '3.3 Password Updated' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !/^[^@]+@[^@]+\.[^@]+$/.test(normalizedEmail)) {
      setErrorMessage('Please enter a valid work email address.');
      return;
    }

    if (mode === 'register') {
      if (fullName.trim().length < 2) {
        setErrorMessage('Full name must be at least 2 characters.');
        return;
      }
      if (password.length < 8) {
        setErrorMessage('Password must be at least 8 characters long.');
        return;
      }
    } else if (mode === 'login' && !password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'reset') {
        const res = await requestPasswordReset(normalizedEmail);
        setSuccessMessage(res.message);
        setAuthStateId('3.1');
        return;
      }

      const user =
        mode === 'register'
          ? await register(fullName.trim(), normalizedEmail, password)
          : await login(normalizedEmail, password);

      navigate(resolveDestinationForUser(user), { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Authentication failed. Please try again.';
      setErrorMessage(msg);
      if (msg.toLowerCase().includes('locked')) {
        setAuthStateId('2.2');
      } else if (msg.toLowerCase().includes('suspended')) {
        setAuthStateId('2.3');
      } else if (mode === 'login') {
        setAuthStateId('2.1');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleContinue = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setSubmitting(true);
    try {
      const user = await loginWithGoogle(
        email.trim() ? email.trim().toLowerCase() : undefined,
        fullName.trim() || undefined
      );
      navigate(resolveDestinationForUser(user), { replace: true });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Google sign-in failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoCustomerCredentials = () => {
    setEmail('olivia@sheetsentry.io');
    setPassword('password123');
    setErrorMessage(null);
  };

  const querySuffix = nextParam
    ? `?next=${encodeURIComponent(nextParam)}${planParam ? `&plan=${encodeURIComponent(planParam)}` : ''}`
    : planParam
    ? `?plan=${encodeURIComponent(planParam)}`
    : '';

  return (
    <div className="bg-[#F5F7FB] text-[#10213B] py-6 sm:py-10 lg:py-14">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[100px] space-y-5 lg:space-y-6">
        {/* Phone-Only Compact Brand Header Banner (Form stays first on phones) */}
        <div className="lg:hidden rounded-[16px] bg-[#111F37] p-4 text-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <BrandLogo dark size={30} />
          </div>
          <span className="shrink-0 px-2.5 py-1 rounded-full bg-[#1B2D4B] text-[#9CC0FF] text-[10px] font-bold uppercase tracking-wider">
            98.4% Engine Ready
          </span>
        </div>

        {/* Two-Column Figma Auth Card Layout (Node 22:746) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* Desktop Left Dark Navy Brand Panel (Node 22:762) */}
          <div className="hidden lg:flex lg:order-1 lg:col-span-6 bg-[#111F37] rounded-[20px] p-12 text-white flex-col justify-between min-h-[540px]">
            <div className="space-y-6">
              <BrandLogo dark size={36} />

              <div className="inline-flex items-center px-3.5 h-[24px] rounded-[12px] bg-[#1B2D4B] text-[#9CC0FF] text-[10px] font-bold uppercase tracking-wider">
                SPREADSHEET QUALITY
              </div>

              <h1 className="text-[36px] font-bold text-white leading-[1.15]">
                Your next spreadsheet,
                <br />
                clearly checked.
              </h1>

              <p className="text-[14px] text-[#C6D4E9] leading-relaxed max-w-[440px]">
                Sign in to review validation runs, manage profiles and keep recurring data clean.
              </p>
            </div>

            {/* Inner Preview Card (Node 22:774) */}
            <div className="bg-[#192B48] border border-[#273E63] rounded-[14px] p-6 mt-8">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[15px] font-bold text-white">Monthly sales export</span>
                <span className="px-3 py-1 rounded-full bg-[#23436E] text-[#8CC0FF] text-[10px] font-bold">
                  98.4% HEALTHY
                </span>
              </div>
              <p className="text-[12px] text-[#C6D4E9] mt-3">
                1,230 valid rows · 20 rows to review
              </p>
            </div>
          </div>

          {/* White Auth Form Card (First on Phone, Right Column on Desktop) */}
          <div className="order-1 lg:order-2 lg:col-span-6 bg-white border border-[#E4E9F1] rounded-[20px] p-6 sm:p-8 lg:p-12 flex flex-col justify-between">
            <div>
              <h2 className="text-[28px] font-bold text-[#10213B]">
                {mode === 'login'
                  ? 'Welcome back'
                  : mode === 'register'
                  ? 'Create your account'
                  : 'Reset your password'}
              </h2>
              <p className="text-[13px] text-[#667085] mt-1">
                {mode === 'login'
                  ? 'Sign in to your SheetSentry workspace.'
                  : mode === 'register'
                  ? 'Start checking your recurring CSV and Excel files for free.'
                  : 'Enter your work email and we will send a password reset link.'}
              </p>

              {/* Already Signed-In Session Banner */}
              {authUser && (
                <div className="mt-4 rounded-[12px] border border-[#16A36A]/30 bg-[#E8F7EF] p-3.5 text-xs text-[#10213B] flex flex-wrap items-center justify-between gap-2">
                  <div>
                    Signed in as <strong>{authUser.fullName}</strong> ({authUser.email})
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={authUser.appRole === 'ADMIN' ? '/admin/overview' : '/app/dashboard'}
                      className="px-2.5 py-1 rounded-[7px] bg-[#16A36A] text-white font-semibold"
                    >
                      Continue to Dashboard →
                    </Link>
                    <button
                      type="button"
                      onClick={() => void logout()}
                      className="px-2.5 py-1 rounded-[7px] bg-white border border-[#E4E9F1] text-[#D84A4A] font-semibold"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}

              {/* Live Error or Success Banner */}
              {errorMessage && (
                <div
                  role="alert"
                  className="mt-4 rounded-[12px] border border-[#D84A4A]/30 bg-[#FEECEC] p-3.5 text-xs text-[#991B1B] flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#D84A4A]" />
                  <span>{errorMessage}</span>
                </div>
              )}
              {successMessage && (
                <div
                  role="status"
                  className="mt-4 rounded-[12px] border border-[#16A36A]/30 bg-[#E8F7EF] p-3.5 text-xs text-[#166534] flex items-start gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#16A36A]" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* State Machine Banner if non-IDLE state selected */}
              {authStateId !== 'IDLE' && (
                <div className="mt-4 rounded-[12px] border border-[#2563EB]/30 bg-[#EAF2FF]/60 p-3.5 text-xs text-[#10213B] flex items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-[#2563EB]">
                      Active Flow State ({authStateId}):{' '}
                    </span>
                    <span>{authStates.find((s) => s.id === authStateId)?.label}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAuthStateId('IDLE')}
                    className="text-[11px] font-semibold text-[#2563EB] hover:underline"
                  >
                    Reset
                  </button>
                </div>
              )}

              {mode !== 'reset' && (
                <>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => void handleGoogleContinue()}
                    className="mt-6 w-full h-[44px] rounded-[10px] bg-[#F7F9FC] hover:bg-[#EAF2FF]/50 disabled:opacity-60 border border-[#E4E9F1] text-[#10213B] text-[12px] font-semibold transition flex items-center justify-center gap-2"
                  >
                    <span>{submitting ? 'Connecting Google...' : 'Continue with Google'}</span>
                  </button>

                  <div className="my-5 flex items-center gap-3">
                    <div className="h-px bg-[#E4E9F1] flex-1" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#667085]">
                      OR EMAIL
                    </span>
                    <div className="h-px bg-[#E4E9F1] flex-1" />
                  </div>
                </>
              )}

              <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 mt-4">
                {mode === 'register' && (
                  <div>
                    <label
                      htmlFor="auth-full-name"
                      className="block text-[11px] font-semibold text-[#10213B] mb-1.5"
                    >
                      Full name
                    </label>
                    <input
                      id="auth-full-name"
                      type="text"
                      required
                      placeholder="Your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full h-[42px] rounded-[10px] bg-[#F9FAFC] border border-[#E4E9F1] px-3.5 text-[12px] text-[#10213B] focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>
                )}

                <div>
                  <label
                    htmlFor="auth-email"
                    className="block text-[11px] font-semibold text-[#10213B] mb-1.5"
                  >
                    Email address
                  </label>
                  <input
                    id="auth-email"
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-[42px] rounded-[10px] bg-[#F9FAFC] border border-[#E4E9F1] px-3.5 text-[12px] text-[#10213B] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                {mode !== 'reset' && (
                  <div>
                    <label
                      htmlFor="auth-password"
                      className="block text-[11px] font-semibold text-[#10213B] mb-1.5"
                    >
                      Password
                    </label>
                    <input
                      id="auth-password"
                      type="password"
                      required
                      placeholder={mode === 'register' ? 'At least 8 characters' : 'Enter password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-[42px] rounded-[10px] bg-[#F9FAFC] border border-[#E4E9F1] px-3.5 text-[12px] text-[#10213B] focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>
                )}

                {mode === 'login' && (
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pt-1">
                    <label className="inline-flex items-center gap-2 text-[#667085] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-[#E4E9F1] text-[#2563EB]"
                      />
                      <span>Remember me</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={fillDemoCustomerCredentials}
                        className="font-semibold text-[#16A36A] hover:underline"
                      >
                        Fill Demo Customer
                      </button>
                      <Link
                        to="/reset-password"
                        className="font-semibold text-[#2563EB] hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-[44px] rounded-[10px] bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 text-white text-[13px] font-semibold shadow-sm transition mt-2"
                >
                  {submitting
                    ? 'Authenticating...'
                    : mode === 'login'
                    ? 'Sign in'
                    : mode === 'register'
                    ? 'Create free account'
                    : 'Send reset link'}
                </button>
              </form>
            </div>

            <div className="pt-6 mt-6 border-t border-[#E4E9F1] flex flex-wrap items-center justify-between gap-2 text-[12px] text-[#667085]">
              {mode === 'login' ? (
                <span>
                  New to SheetSentry?{' '}
                  <Link
                    to={`/register${querySuffix}`}
                    className="font-semibold text-[#2563EB] hover:underline"
                  >
                    Create an account
                  </Link>
                </span>
              ) : (
                <span>
                  Already have an account?{' '}
                  <Link
                    to={`/login${querySuffix}`}
                    className="font-semibold text-[#2563EB] hover:underline"
                  >
                    Sign in
                  </Link>
                </span>
              )}

              <button
                type="button"
                onClick={() => setShowStateDrawer(!showStateDrawer)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2563EB] hover:underline"
              >
                <span>Preview Auth States</span>
                {showStateDrawer ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {showStateDrawer && (
          <div className="bg-white border border-[#E4E9F1] rounded-[16px] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
                <span className="text-xs font-bold text-[#10213B]">
                  Authentication &amp; Onboarding State Flows
                </span>
              </div>
              <span className="text-[11px] text-[#667085]">
                Click any state below to preview its UI banner
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {authStates.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setAuthStateId(st.id)}
                  className={`px-3 py-1.5 rounded-[8px] text-[11px] font-semibold border transition ${
                    authStateId === st.id
                      ? 'bg-[#2563EB] text-white border-[#2563EB]'
                      : 'bg-[#F5F7FB] text-[#10213B] border-[#E4E9F1] hover:border-[#2563EB]'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
