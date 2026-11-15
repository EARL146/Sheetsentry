import React, { useState } from 'react';
import {
  Lock,
  RefreshCw,
  Search,
  Unlock,
} from 'lucide-react';
import {
  CurrencyCode,
  FX_REFERENCE_RATE_USD_TO_PHP,
  WORKER_RESOURCE_SPEC,
} from '../../config/productConfig';
import { useAppState } from '../../context/AppStateContext';
import { ADMIN_PAYMENTS_TEXT, ADMIN_SECTIONS_TEXT } from '../../content/adminText';
import { TicketGateModal } from '../../components/SharedUI';

/**
 * 1. Admin Platform Overview (Figma Node 4:430)
 */
export const AdminOverviewPage: React.FC = () => {
  const weeks = [
    { label: 'W1', h: 58, active: false },
    { label: 'W2', h: 72, active: false },
    { label: 'W3', h: 86, active: false },
    { label: 'W4', h: 98, active: false },
    { label: 'W5', h: 112, active: true },
    { label: 'W6', h: 124, active: true },
    { label: 'W7', h: 136, active: true },
    { label: 'W8', h: 148, active: true },
  ];

  return (
    <div className="space-y-6">
      {/* Header Row (Nodes 4:473 - 4:476) */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-[#10213B]">Platform overview</h1>
          <p className="text-[12px] text-[#667085] mt-1">
            Monitor users, validation activity, subscriptions and system health.
          </p>
        </div>

        <span className="px-4 py-1.5 rounded-full bg-[#FFF4DE] text-[#D99121] text-[10px] font-bold uppercase tracking-wider">
          DEMO DATA
        </span>
      </div>

      {/* 4 KPI Cards (Nodes 4:477 - 4:500) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            dot: 'bg-[#2563EB]',
            label: 'Total users',
            value: '12,480',
            sub: '+410 this month',
            subColor: 'text-[#2563EB]',
          },
          {
            dot: 'bg-[#16A36A]',
            label: 'Active subscribers',
            value: '1,280',
            sub: '10.3% conversion',
            subColor: 'text-[#16A36A]',
          },
          {
            dot: 'bg-[#7658D6]',
            label: 'Validation jobs',
            value: '8,420',
            sub: '98.6% completed',
            subColor: 'text-[#7658D6]',
          },
          {
            dot: 'bg-[#D99121]',
            label: 'Storage used',
            value: '420 GB',
            sub: '64% of capacity',
            subColor: 'text-[#D99121]',
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white border border-[#E4E9F1] rounded-[14px] p-5 shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <span className={`w-[6px] h-[6px] rounded-[3px] ${kpi.dot}`} />
              <span className="text-[11px] font-medium text-[#667085]">{kpi.label}</span>
            </div>
            <div className="text-[26px] font-bold text-[#10213B] mt-2 leading-none">
              {kpi.value}
            </div>
            <div className={`text-[10px] font-semibold mt-3 ${kpi.subColor}`}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Middle Row: User Growth 8-Week Chart + Processing Health (Nodes 4:501 & 4:521) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: User Growth Card (Node 4:501) */}
        <div className="lg:col-span-8 bg-white border border-[#E4E9F1] rounded-[16px] p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[15px] font-bold text-[#10213B]">User growth</h2>
              <p className="text-[10.5px] text-[#667085] mt-0.5">
                New accounts over the last 8 weeks
              </p>
            </div>
            <span className="px-3.5 py-1 rounded-full bg-[#EAF2FF] text-[#2563EB] text-[10px] font-bold">
              +8.2%
            </span>
          </div>

          <div className="mt-8 pt-4 border-b border-[#E4E9F1] flex items-end justify-between gap-4 h-[165px] px-4">
            {weeks.map((w) => (
              <div key={w.label} className="flex-1 flex flex-col items-center justify-end h-full">
                <div
                  style={{ height: `${w.h}px` }}
                  className={`w-full max-w-[44px] rounded-[8px] ${
                    w.active ? 'bg-[#2563EB]' : 'bg-[#8CB5FF]'
                  }`}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#667085] pt-2.5 px-4">
            {weeks.map((w) => (
              <span key={w.label} className="flex-1 text-center">
                {w.label}
              </span>
            ))}
          </div>
        </div>

        {/* Right 4 Cols: Processing Health Card (Node 4:521) */}
        <div className="lg:col-span-4 bg-white border border-[#E4E9F1] rounded-[16px] p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-[15px] font-bold text-[#10213B]">Processing health</h2>
            <p className="text-[10.5px] text-[#667085] mt-0.5">Current validation workload</p>
          </div>

          <div className="space-y-3">
            {[
              {
                label: 'Completed',
                count: '7,980',
                pill: 'bg-[#E8F7EF] text-[#16A36A]',
              },
              {
                label: 'Processing',
                count: '280',
                pill: 'bg-[#EAF2FF] text-[#2563EB]',
              },
              {
                label: 'Queued',
                count: '145',
                pill: 'bg-[#FFF4DE] text-[#D99121]',
              },
              {
                label: 'Failed',
                count: '15',
                pill: 'bg-[#FDECEC] text-[#D84A4A]',
              },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-[#FAFBFD] border border-[#E4E9F1] rounded-[10px] px-4 py-3 flex items-center justify-between"
              >
                <span className="text-[12px] font-medium text-[#10213B]">{item.label}</span>
                <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold ${item.pill}`}>
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Platform Activity (Node 4:539) */}
      <div className="bg-white border border-[#E4E9F1] rounded-[16px] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-[#10213B]">Recent platform activity</h2>
          <span className="text-[11px] font-semibold text-[#2563EB]">View audit log →</span>
        </div>

        <div className="divide-y divide-[#E4E9F1]">
          {[
            {
              dot: 'bg-[#2563EB]',
              title: 'New customer registered',
              meta: 'olivia.lee@example.com · Free plan · 4m ago',
            },
            {
              dot: 'bg-[#16A36A]',
              title: 'Subscription renewed',
              meta: 'Starter plan · Monthly billing · 18m ago',
            },
            {
              dot: 'bg-[#7658D6]',
              title: 'Validation completed',
              meta: 'sales_nov.csv · 1,250 rows · 22m ago',
            },
            {
              dot: 'bg-[#D99121]',
              title: 'Storage threshold warning',
              meta: '75% bucket threshold check · 1h ago',
            },
          ].map((ev) => (
            <div key={ev.title} className="py-3.5 flex items-start gap-3.5">
              <span className={`w-[8px] h-[8px] rounded-full ${ev.dot} mt-1.5 shrink-0`} />
              <div>
                <div className="text-[12px] font-semibold text-[#10213B]">{ev.title}</div>
                <div className="text-[10.5px] text-[#667085] mt-0.5">{ev.meta}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * 2. Admin User Management + Support-Ticket-Gated Cell Unmasking (Figma Nodes 4:570 & 121:357)
 */
export const AdminUsersPage: React.FC = () => {
  const { adminTicketGrants, grantTicketAccess } = useAppState();
  const [modalTarget, setModalTarget] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const users = [
    {
      id: 'USR-OLIVIA-01',
      name: 'Olivia Lee',
      email: 'olivia.lee@example.com',
      plan: 'Starter',
      planPill: 'bg-[#EAF2FF] text-[#2563EB]',
      status: 'Active',
      statusPill: 'bg-[#E8F7EF] text-[#16A36A]',
      joined: 'Nov 02, 2026',
      lastActive: 'Today',
      sampleCell: 'Row 8: customer_email="" (Missing required email)',
    },
    {
      id: 'USR-MARCUS-02',
      name: 'Marcus Chen',
      email: 'marcus.chen@example.com',
      plan: 'Pro',
      planPill: 'bg-[#F0ECFF] text-[#7658D6]',
      status: 'Active',
      statusPill: 'bg-[#E8F7EF] text-[#16A36A]',
      joined: 'Oct 28, 2026',
      lastActive: 'Today',
      sampleCell: "Row 3: gross_pay_usd=\"=CMD|' /C calc.exe'!A0\" (Formula neutralized)",
    },
    {
      id: 'USR-AVA-03',
      name: 'Ava Santos',
      email: 'ava.santos@example.com',
      plan: 'Free',
      planPill: 'bg-[#F2F4F7] text-[#667085]',
      status: 'Active',
      statusPill: 'bg-[#E8F7EF] text-[#16A36A]',
      joined: 'Oct 22, 2026',
      lastActive: 'Nov 06',
      sampleCell: 'Row 14: vendor_tin="004-812-991" | net="₱148,500.00"',
    },
    {
      id: 'USR-NOAH-04',
      name: 'Noah Patel',
      email: 'noah.patel@example.com',
      plan: 'Starter',
      planPill: 'bg-[#EAF2FF] text-[#2563EB]',
      status: 'Past due',
      statusPill: 'bg-[#FFF4DE] text-[#D99121]',
      joined: 'Oct 19, 2026',
      lastActive: 'Nov 04',
      sampleCell: 'Row 21: order_date="2026/99/99" (Invalid ISO-8601 date)',
    },
    {
      id: 'USR-MIA-05',
      name: 'Mia Garcia',
      email: 'mia.garcia@example.com',
      plan: 'Pro',
      planPill: 'bg-[#F0ECFF] text-[#7658D6]',
      status: 'Suspended',
      statusPill: 'bg-[#FDECEC] text-[#D84A4A]',
      joined: 'Oct 15, 2026',
      lastActive: 'Nov 01',
      sampleCell: 'Row 2: duplicate_key="ORD-10442"',
    },
    {
      id: 'USR-ETHAN-06',
      name: 'Ethan Kim',
      email: 'ethan.kim@example.com',
      plan: 'Free',
      planPill: 'bg-[#F2F4F7] text-[#667085]',
      status: 'Active',
      statusPill: 'bg-[#E8F7EF] text-[#16A36A]',
      joined: 'Oct 11, 2026',
      lastActive: 'Oct 31',
      sampleCell: 'Row 9: sku_code="SKU-8821"',
    },
    {
      id: 'USR-SOFIA-07',
      name: 'Sofia Reyes',
      email: 'sofia.reyes@example.com',
      plan: 'Starter',
      planPill: 'bg-[#EAF2FF] text-[#2563EB]',
      status: 'Active',
      statusPill: 'bg-[#E8F7EF] text-[#16A36A]',
      joined: 'Oct 08, 2026',
      lastActive: 'Oct 30',
      sampleCell: 'Row 4: amount="1250.00"',
    },
    {
      id: 'USR-LIAM-08',
      name: 'Liam Wong',
      email: 'liam.wong@example.com',
      plan: 'Pro',
      planPill: 'bg-[#F0ECFF] text-[#7658D6]',
      status: 'Active',
      statusPill: 'bg-[#E8F7EF] text-[#16A36A]',
      joined: 'Oct 03, 2026',
      lastActive: 'Oct 29',
      sampleCell: 'Row 19: tax_id="991-204-118"',
    },
  ];

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Row (Nodes 4:613 - 4:616) */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-[#10213B]">User management</h1>
          <p className="text-[12px] text-[#667085] mt-1">
            Review accounts, plans and access status.
          </p>
        </div>

        <button
          type="button"
          className="h-[40px] px-5 rounded-[10px] bg-white border border-[#E4E9F1] hover:border-[#2563EB] text-[12px] font-semibold text-[#10213B] transition"
        >
          Export user list
        </button>
      </div>

      {/* 4 Metric Cards (Nodes 4:617 - 4:636) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            dot: 'bg-[#2563EB]',
            label: 'Total accounts',
            value: '12,480',
            sub: 'All registered users',
            subColor: 'text-[#2563EB]',
          },
          {
            dot: 'bg-[#16A36A]',
            label: 'Verified accounts',
            value: '11,920',
            sub: '95.5% verified',
            subColor: 'text-[#16A36A]',
          },
          {
            dot: 'bg-[#7658D6]',
            label: 'On paid plans',
            value: '1,280',
            sub: 'Starter and Pro',
            subColor: 'text-[#7658D6]',
          },
          {
            dot: 'bg-[#D84A4A]',
            label: 'Suspended',
            value: '18',
            sub: 'Requires review',
            subColor: 'text-[#D84A4A]',
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white border border-[#E4E9F1] rounded-[14px] p-5 shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <span className={`w-[6px] h-[6px] rounded-[3px] ${kpi.dot}`} />
              <span className="text-[11px] font-medium text-[#667085]">{kpi.label}</span>
            </div>
            <div className="text-[26px] font-bold text-[#10213B] mt-2 leading-none">
              {kpi.value}
            </div>
            <div className={`text-[10px] font-semibold mt-3 ${kpi.subColor}`}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Users Table Card (Node 4:637) */}
      <div className="bg-white border border-[#E4E9F1] rounded-[16px] p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-[15px] font-bold text-[#10213B]">All users</h2>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-[#F5F7FB] h-[36px] px-3.5 rounded-[8px] w-full sm:w-[220px]">
              <Search className="w-3.5 h-3.5 text-[#667085]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name or email..."
                className="bg-transparent text-xs text-[#10213B] placeholder-[#667085] focus:outline-none w-full"
              />
            </div>

            <span className="px-3.5 py-1 rounded-full bg-[#EAF2FF] text-[#2563EB] text-[10px] font-bold">
              12,480 USERS
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F7F9FC] text-[#667085] text-[9.5px] font-bold uppercase">
                <th className="py-3 px-4 rounded-l-[8px]">USER</th>
                <th className="py-3 px-4">PLAN</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4">JOINED</th>
                <th className="py-3 px-4">LAST ACTIVE</th>
                <th className="py-3 px-4">CELL PAYLOAD</th>
                <th className="py-3 px-4 text-right rounded-r-[8px]">TICKET GATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E9F1]">
              {filteredUsers.map((u) => {
                const grant = adminTicketGrants[u.id];
                return (
                  <tr key={u.id} className="hover:bg-[#FBFCFE]">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#10213B]">{u.name}</div>
                      <div className="text-[10.5px] text-[#667085]">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-3 py-0.5 rounded-full text-[10px] font-bold ${u.planPill}`}
                      >
                        {u.plan}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-3 py-0.5 rounded-full text-[10px] font-bold ${u.statusPill}`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#667085]">{u.joined}</td>
                    <td className="py-3.5 px-4 text-[#667085]">{u.lastActive}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      {grant ? (
                        <span className="text-[#16A36A] bg-[#E8F7EF] px-2.5 py-1 rounded-[6px] font-semibold">
                          {u.sampleCell}
                        </span>
                      ) : (
                        <span className="text-[#667085] bg-[#F5F7FB] px-2.5 py-1 rounded-[6px]">
                          •••••••••••• (Masked)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {grant ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#16A36A]">
                          <Unlock className="w-3.5 h-3.5" /> {grant.ticketId}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setModalTarget(u.id)}
                          className="px-3 py-1 rounded-[8px] bg-[#FFF4DE] hover:bg-[#FDE68A] text-[#D99121] text-[10.5px] font-bold inline-flex items-center gap-1 transition"
                        >
                          <Lock className="w-3 h-3" />
                          <span>Unmask</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="pt-2 text-[11px] text-[#667085]">Showing 1–8 of 12,480 users</div>
      </div>

      {modalTarget && (
        <TicketGateModal
          entityKey={modalTarget}
          onClose={() => setModalTarget(null)}
          onGrant={(ticketId, justification) =>
            grantTicketAccess(modalTarget, ticketId, justification)
          }
        />
      )}
    </div>
  );
};

/**
 * 3. Admin Upload Monitoring & DLQ Pipeline (Figma Nodes 4:731 & 121:491)
 */
export const AdminUploadsPipelinePage: React.FC = () => {
  const { jobs, appendAuditLog } = useAppState();
  const [dlqReplayed, setDlqReplayed] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-[#10213B]">Upload monitoring</h1>
          <p className="text-[12px] text-[#667085] mt-1">
            {ADMIN_SECTIONS_TEXT.uploadsSubtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setDlqReplayed(true);
            appendAuditLog({
              actor: 'ops.admin@sheetsentry.io',
              actorRole: 'PLATFORM_OPS',
              actionType: 'DLQ_JOB_REPLAY_TRIGGERED',
              targetEntity: 'DLQ-2026-019',
              severity: 'INFO',
              details:
                'Re-queued transient worker timeout job DLQ-2026-019 with fresh 300s ceiling.',
            });
          }}
          className="h-[40px] px-4 rounded-[10px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{dlqReplayed ? 'DLQ Replay Dispatched' : 'Replay Transient DLQ Job'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E4E9F1] rounded-[14px] p-5 shadow-sm">
          <div className="text-[11px] font-medium text-[#667085]">
            Worker Memory Ceiling
          </div>
          <div className="text-[22px] font-bold text-[#10213B] mt-2 font-mono">
            218 MB / {WORKER_RESOURCE_SPEC.containerMemoryCeilingMb} MB
          </div>
          <div className="text-[10.5px] font-semibold text-[#16A36A] mt-2">
            Backpressure pause watermark: {WORKER_RESOURCE_SPEC.backpressurePauseThresholdMb} MB
          </div>
        </div>

        <div className="bg-white border border-[#E4E9F1] rounded-[14px] p-5 shadow-sm">
          <div className="text-[11px] font-medium text-[#667085]">
            Streaming Batch &amp; Checkpoint
          </div>
          <div className="text-[22px] font-bold text-[#10213B] mt-2 font-mono">
            {WORKER_RESOURCE_SPEC.streamingChunkRows.toLocaleString()} rows / chunk
          </div>
          <div className="text-[10.5px] font-semibold text-[#2563EB] mt-2">
            Heap checkpoint every{' '}
            {WORKER_RESOURCE_SPEC.memoryCheckpointIntervalRows.toLocaleString()} rows
          </div>
        </div>

        <div className="bg-white border border-[#E4E9F1] rounded-[14px] p-5 shadow-sm">
          <div className="text-[11px] font-medium text-[#667085]">Retry Backoff Schedule</div>
          <div className="text-[22px] font-bold text-[#10213B] mt-2 font-mono">
            5s → 15s → 45s
          </div>
          <div className="text-[10.5px] font-semibold text-[#7658D6] mt-2">
            Max 3 retries before DLQ quarantine
          </div>
        </div>
      </div>

      {/* Uploads Table */}
      <div className="bg-white border border-[#E4E9F1] rounded-[16px] p-6 shadow-sm space-y-4">
        <h2 className="text-[15px] font-bold text-[#10213B]">Recent upload jobs &amp; DLQ state</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F7F9FC] text-[#667085] text-[9.5px] font-bold uppercase">
                <th className="py-3 px-4 rounded-l-[8px]">JOB ID</th>
                <th className="py-3 px-4">FILE NAME</th>
                <th className="py-3 px-4">PROFILE</th>
                <th className="py-3 px-4">WORKER NODE</th>
                <th className="py-3 px-4">STATE</th>
                <th className="py-3 px-4 rounded-r-[8px]">ELIGIBILITY REASON</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E9F1]">
              {jobs.map((j) => (
                <tr key={j.id} className="hover:bg-[#FBFCFE]">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#2563EB]">{j.id}</td>
                  <td className="py-3.5 px-4 font-semibold text-[#10213B]">{j.fileName}</td>
                  <td className="py-3.5 px-4 text-[#667085]">{j.profileName}</td>
                  <td className="py-3.5 px-4 font-mono text-[#667085]">{j.workerNode}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-3 py-0.5 rounded-full text-[10px] font-bold ${
                        j.state === 'QUARANTINED'
                          ? 'bg-[#FDECEC] text-[#D84A4A]'
                          : 'bg-[#E8F7EF] text-[#16A36A]'
                      }`}
                    >
                      {j.state}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#667085]">{j.summary.eligibilityReason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/**
 * 4. Admin Subscriptions Page (Figma Node 12:2)
 */
export const AdminSubscriptionsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] font-bold text-[#10213B]">Subscriptions</h1>
        <p className="text-[12px] text-[#667085] mt-1">
          {ADMIN_SECTIONS_TEXT.subscriptionsSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            dot: 'bg-[#667085]',
            tier: 'Free Plan ($0 / ₱0)',
            tenants: '11,200 workspaces',
            limits: '1 profile · 5 MB max upload · 3 checks/mo · 7d retention',
          },
          {
            dot: 'bg-[#2563EB]',
            tier: 'Starter Plan ($5 / ₱280)',
            tenants: '860 workspaces',
            limits: '5 profiles · 50 MB (100k rows) · 50 checks/mo · 30d retention',
          },
          {
            dot: 'bg-[#7658D6]',
            tier: 'Pro Plan ($12 / ₱670)',
            tenants: '420 workspaces',
            limits: '20 profiles · 250 MB (1M rows) · Unlimited / 300 checks · 90d retention',
          },
        ].map((card) => (
          <div
            key={card.tier}
            className="bg-white border border-[#E4E9F1] rounded-[16px] p-6 shadow-sm space-y-2.5"
          >
            <div className="flex items-center gap-2">
              <span className={`w-[6px] h-[6px] rounded-[3px] ${card.dot}`} />
              <span className="text-[13px] font-bold text-[#10213B]">{card.tier}</span>
            </div>
            <div className="text-[24px] font-bold text-[#2563EB]">{card.tenants}</div>
            <p className="text-xs text-[#667085] leading-relaxed">{card.limits}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * 5. Admin Multi-Currency USD & PHP Ledger Fixed (Figma Nodes 114:209 & 136:1265)
 */
export const AdminPaymentsLedgerPage: React.FC = () => {
  const { refundRequests, approveRefundSecondAdmin, initiateRefundRequest } = useAppState();
  const [currencyFilter, setCurrencyFilter] = useState<'ALL' | CurrencyCode>('ALL');
  const [newRefundAmount, setNewRefundAmount] = useState('650');
  const [newRefundCurrency, setNewRefundCurrency] = useState<CurrencyCode>('USD');
  const [newRefundReason, setNewRefundReason] = useState(
    'Enterprise annual seat adjustment requested by controller.'
  );

  // Exact Settled Customer Transactions from Node 114:209
  const settledTransactions = [
    {
      id: 'pay_99201_usd',
      customer: 'Olivia Vance (Acme Corp)',
      plan: 'Pro Monthly',
      currency: 'USD' as CurrencyCode,
      currBadge: 'bg-[#EAF2FF] text-[#2563EB]',
      gross: '$12.00 USD',
      status: 'Settled',
      statusPill: 'bg-[#E8F7EF] text-[#16A36A]',
      date: '2026-04-06 14:22 UTC',
    },
    {
      id: 'pay_99202_php',
      customer: 'Marco Reyes (Manila Logistics)',
      plan: 'Pro Monthly',
      currency: 'PHP' as CurrencyCode,
      currBadge: 'bg-[#F0ECFF] text-[#7658D6]',
      gross: '₱670.00 PHP',
      status: 'Settled',
      statusPill: 'bg-[#E8F7EF] text-[#16A36A]',
      date: '2026-04-06 13:50 UTC',
    },
    {
      id: 'pay_99203_usd',
      customer: 'Hannah Lin (Vertex Labs)',
      plan: 'Starter Monthly',
      currency: 'USD' as CurrencyCode,
      currBadge: 'bg-[#EAF2FF] text-[#2563EB]',
      gross: '$5.00 USD',
      status: 'Settled',
      statusPill: 'bg-[#E8F7EF] text-[#16A36A]',
      date: '2026-04-06 11:18 UTC',
    },
    {
      id: 'pay_99204_php',
      customer: 'Clarisse Santos (BGC Retail)',
      plan: 'Starter Monthly',
      currency: 'PHP' as CurrencyCode,
      currBadge: 'bg-[#F0ECFF] text-[#7658D6]',
      gross: '₱280.00 PHP',
      status: 'Settled',
      statusPill: 'bg-[#E8F7EF] text-[#16A36A]',
      date: '2026-04-06 09:04 UTC',
    },
    {
      id: 'pay_99205_php',
      customer: 'David Tan (Cebu Exports)',
      plan: 'Pro Monthly',
      currency: 'PHP' as CurrencyCode,
      currBadge: 'bg-[#F0ECFF] text-[#7658D6]',
      gross: '₱670.00 PHP',
      status: 'Refunded',
      statusPill: 'bg-[#FFF4DE] text-[#D99121]',
      date: '2026-04-05 19:41 UTC',
    },
  ];

  const filteredTxns = settledTransactions.filter(
    (t) => currencyFilter === 'ALL' || t.currency === currencyFilter
  );

  const handleCreateRefund = (e: React.FormEvent) => {
    e.preventDefault();
    const numeric = Number(newRefundAmount);
    if (Number.isNaN(numeric) || numeric <= 0) return;
    initiateRefundRequest({
      transactionId: newRefundCurrency === 'USD' ? 'pay_99299_usd' : 'pay_99299_php',
      tenantName: 'Enterprise Tenant Adjustment',
      currency: newRefundCurrency,
      amount: numeric,
      reason: newRefundReason,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-[#10213B]">
            {ADMIN_PAYMENTS_TEXT.title}
          </h1>
          <p className="text-[12px] text-[#667085] mt-1">
            {ADMIN_PAYMENTS_TEXT.subtitle}
          </p>
        </div>

        <span className="px-3.5 py-1.5 rounded-full bg-[#E8F7EF] text-[#16A36A] text-[10.5px] font-bold">
          {ADMIN_PAYMENTS_TEXT.isolationBadge}
        </span>
      </div>

      <div className="rounded-[12px] bg-[#FFF4DE] border border-[#F59E0B] px-4 py-3 text-xs text-[#92400E] font-semibold">
        {ADMIN_PAYMENTS_TEXT.noticeTitle} {ADMIN_PAYMENTS_TEXT.noticeBody} Reference rate: 1.00 USD ={' '}
        {FX_REFERENCE_RATE_USD_TO_PHP.toFixed(2)} PHP.
      </div>

      {/* 4 KPI Cards (Nodes 114:237 - 114:260) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E4E9F1] rounded-[14px] p-5 shadow-sm">
          <div className="text-[10px] font-bold uppercase text-[#667085]">GROSS VOLUME (USD)</div>
          <div className="text-[22px] font-bold text-[#10213B] mt-2">$14,820.00 USD</div>
          <div className="text-[11px] font-semibold text-[#16A36A] mt-2">
            1,412 settled USD charges
          </div>
        </div>

        <div className="bg-white border border-[#E4E9F1] rounded-[14px] p-5 shadow-sm">
          <div className="text-[10px] font-bold uppercase text-[#667085]">GROSS VOLUME (PHP)</div>
          <div className="text-[22px] font-bold text-[#10213B] mt-2">₱815,100.00 PHP</div>
          <div className="text-[11px] font-semibold text-[#16A36A] mt-2">
            1,890 settled PHP charges
          </div>
        </div>

        <div className="bg-white border border-[#E4E9F1] rounded-[14px] p-5 shadow-sm">
          <div className="text-[10px] font-bold uppercase text-[#667085]">TOTAL REFUNDS ISSUED</div>
          <div className="text-[16px] font-bold text-[#10213B] mt-2">
            $120.00 USD / ₱3,300.00 PHP
          </div>
          <div className="text-[11px] font-semibold text-[#D99121] mt-3">
            0.8% refund rate (within SLA)
          </div>
        </div>

        <div className="bg-white border border-[#E4E9F1] rounded-[14px] p-5 shadow-sm">
          <div className="text-[10px] font-bold uppercase text-[#667085]">
            CONVERTED NET ESTIMATE
          </div>
          <div className="text-[22px] font-bold text-[#10213B] mt-2">~$29,520.00 USD</div>
          <div className="text-[11px] font-semibold text-[#2563EB] mt-2">
            Reference FX @ ₱55.00 / $1 USD
          </div>
        </div>
      </div>

      {/* Settled Customer Transactions Table Card (Node 114:261) */}
      <div className="bg-white border border-[#E4E9F1] rounded-[16px] p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-[15px] font-bold text-[#10213B]">Settled Customer Transactions</h2>

          <div className="flex items-center gap-2">
            {(
              [
                { id: 'ALL', label: 'All Currencies' },
                { id: 'USD', label: 'USD ($)' },
                { id: 'PHP', label: 'PHP (₱)' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCurrencyFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-[8px] text-[11px] font-bold transition ${
                  currencyFilter === tab.id
                    ? 'bg-[#EAF2FF] text-[#2563EB]'
                    : 'bg-[#F5F7FB] text-[#667085] hover:text-[#10213B]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F7F9FC] text-[#667085] text-[9.5px] font-bold uppercase">
                <th className="py-3 px-4 rounded-l-[8px]">TRANSACTION ID</th>
                <th className="py-3 px-4">CUSTOMER / WORKSPACE</th>
                <th className="py-3 px-4">PLAN</th>
                <th className="py-3 px-4">CURRENCY</th>
                <th className="py-3 px-4">GROSS AMOUNT</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 rounded-r-[8px]">SETTLED AT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E9F1]">
              {filteredTxns.map((t) => (
                <tr key={t.id} className="hover:bg-[#FBFCFE]">
                  <td className="py-3.5 px-4 font-mono text-[#10213B]">{t.id}</td>
                  <td className="py-3.5 px-4 font-semibold text-[#10213B]">{t.customer}</td>
                  <td className="py-3.5 px-4 text-[#667085]">{t.plan}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${t.currBadge}`}>
                      {t.currency}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#10213B]">{t.gross}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-3 py-0.5 rounded-full text-[10px] font-bold ${t.statusPill}`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#667085]">{t.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dual-Admin Refund Governance (> $500 USD / > ₱27,500 PHP — Node 136:1265) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-[#E4E9F1] rounded-[16px] p-6 shadow-sm space-y-4">
          <h3 className="text-[15px] font-bold text-[#10213B]">
            Dual-Admin Refund Queue (&gt; $500 USD / ₱27,500 PHP Gate)
          </h3>
          <div className="space-y-3 text-xs">
            {refundRequests.map((ref) => (
              <div
                key={ref.id}
                className="rounded-[12px] bg-[#FAFBFD] border border-[#E4E9F1] p-4 space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-mono font-bold text-[#10213B]">
                    {ref.id} · {ref.currency === 'USD' ? '$' : '₱'}
                    {ref.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}{' '}
                    {ref.currency}
                  </div>
                  <span
                    className={`px-3 py-0.5 rounded-full text-[10px] font-bold ${
                      ref.status === 'PENDING_SECOND_APPROVAL'
                        ? 'bg-[#FFF4DE] text-[#D99121]'
                        : 'bg-[#E8F7EF] text-[#16A36A]'
                    }`}
                  >
                    {ref.status}
                  </span>
                </div>
                <p className="text-[#667085]">{ref.reason}</p>
                <div className="text-[11px] text-[#667085] font-mono">
                  Initiated by: {ref.initiatedBy}
                  {ref.approvedBy && ` · Approved by: ${ref.approvedBy}`}
                </div>

                {ref.status === 'PENDING_SECOND_APPROVAL' && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        approveRefundSecondAdmin(
                          ref.id,
                          'marcus.chen@sheetsentry.io (Super Admin #2)'
                        )
                      }
                      className="h-[36px] px-4 rounded-[8px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold transition"
                    >
                      Approve as Second Admin (Dual Control Sign-Off)
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <form
          onSubmit={handleCreateRefund}
          className="lg:col-span-5 bg-white border border-[#E4E9F1] rounded-[16px] p-6 shadow-sm space-y-4 text-xs"
        >
          <h3 className="text-[15px] font-bold text-[#10213B]">
            Simulate Refund Request (Dual-Approval Gate)
          </h3>
          <p className="text-[#667085]">
            Refunds over $500 USD (or ₱27,500 PHP) automatically enter{' '}
            <code className="font-mono text-[#D99121] font-bold">PENDING_SECOND_APPROVAL</code>.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#10213B] mb-1">Currency</label>
              <select
                value={newRefundCurrency}
                onChange={(e) => setNewRefundCurrency(e.target.value as CurrencyCode)}
                className="w-full h-[38px] rounded-[8px] bg-[#F9FAFC] border border-[#E4E9F1] px-3 font-semibold text-[#10213B]"
              >
                <option value="USD">USD ($)</option>
                <option value="PHP">PHP (₱)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[#10213B] mb-1">Amount</label>
              <input
                type="number"
                value={newRefundAmount}
                onChange={(e) => setNewRefundAmount(e.target.value)}
                className="w-full h-[38px] rounded-[8px] bg-[#F9FAFC] border border-[#E4E9F1] px-3 font-mono text-[#10213B]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#10213B] mb-1">Audit Reason</label>
            <input
              type="text"
              value={newRefundReason}
              onChange={(e) => setNewRefundReason(e.target.value)}
              className="w-full h-[38px] rounded-[8px] bg-[#F9FAFC] border border-[#E4E9F1] px-3 text-[#10213B]"
            />
          </div>

          <button
            type="submit"
            className="w-full h-[40px] rounded-[10px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold transition"
          >
            Initiate Refund Request
          </button>
        </form>
      </div>
    </div>
  );
};

/**
 * 6. Admin Storage Monitoring & Lifecycle (Figma Nodes 12:297 & 118:2)
 */
export const AdminStoragePage: React.FC = () => {
  const [legalHoldEnabled, setLegalHoldEnabled] = useState(true);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] font-bold text-[#10213B]">Storage</h1>
        <p className="text-[12px] text-[#667085] mt-1">
          {ADMIN_SECTIONS_TEXT.storageSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {[
          {
            bucket: 'sheetsentry-quarantine-ingress',
            desc: 'Unverified uploads held during Magic-Byte, Zip-Bomb, and ClamAV inspection.',
            policy: 'Auto-purge after 24 hours if unverified',
          },
          {
            bucket: 'sheetsentry-active-workspaces',
            desc: 'Validated spreadsheets and sanitized CSV/JSON artifacts.',
            policy: 'Tiered TTL: Free 7d · Starter 30d · Pro 90d',
          },
          {
            bucket: 'sheetsentry-immutable-audit',
            desc: 'Hash-chained security logs and ticket-gated access records.',
            policy: 'WORM Object Lock (365-day compliance retention)',
          },
        ].map((b) => (
          <div
            key={b.bucket}
            className="bg-white border border-[#E4E9F1] rounded-[16px] p-6 shadow-sm space-y-2"
          >
            <div className="font-mono font-bold text-[#2563EB]">{b.bucket}</div>
            <p className="text-[#667085] leading-relaxed">{b.desc}</p>
            <div className="text-[11px] font-semibold text-[#16A36A] pt-1">{b.policy}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#E4E9F1] rounded-[16px] p-6 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
        <div>
          <h3 className="text-[15px] font-bold text-[#10213B]">
            Compliance Legal Hold Override (Suspends Automated TTL Purge)
          </h3>
          <p className="text-[#667085] mt-1">
            When enabled on a workspace or file (`uploaded_files.legal_hold = 1`), the automated
            7/30/90-day lifecycle janitor skips purging.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setLegalHoldEnabled(!legalHoldEnabled)}
          className={`h-[40px] px-5 rounded-[10px] font-semibold transition ${
            legalHoldEnabled
              ? 'bg-[#FFF4DE] text-[#D99121] border border-[#F59E0B]/40'
              : 'bg-[#F5F7FB] text-[#667085] border border-[#E4E9F1]'
          }`}
        >
          {legalHoldEnabled ? 'Legal Hold Active on TENANT-NORTHSTAR-03' : 'Enable Legal Hold'}
        </button>
      </div>
    </div>
  );
};

/**
 * 7. Admin Security Center & Audit Logs (Figma Nodes 12:446 & 12:578)
 */
export const AdminSecurityAuditPage: React.FC = () => {
  const { auditLogs } = useAppState();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] font-bold text-[#10213B]">Security center &amp; audit logs</h1>
        <p className="text-[12px] text-[#667085] mt-1">
          {ADMIN_SECTIONS_TEXT.securitySubtitle}
        </p>
      </div>

      <div className="bg-white border border-[#E4E9F1] rounded-[16px] p-6 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#F7F9FC] text-[#667085] text-[9.5px] font-bold uppercase">
              <th className="py-3 px-4 rounded-l-[8px]">AUDIT ID &amp; TIMESTAMP</th>
              <th className="py-3 px-4">ACTOR &amp; ROLE</th>
              <th className="py-3 px-4">ACTION &amp; TICKET</th>
              <th className="py-3 px-4">DETAILS</th>
              <th className="py-3 px-4 rounded-r-[8px]">SHA-256 CHAIN HASH</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4E9F1]">
            {auditLogs.map((log) => (
              <tr key={log.id} className="hover:bg-[#FBFCFE]">
                <td className="py-3.5 px-4 font-mono">
                  <div className="font-bold text-[#10213B]">{log.id}</div>
                  <div className="text-[10.5px] text-[#667085]">{log.timestamp}</div>
                </td>
                <td className="py-3.5 px-4">
                  <div className="font-semibold text-[#10213B]">{log.actor}</div>
                  <div className="font-mono text-[10.5px] text-[#2563EB]">{log.actorRole}</div>
                </td>
                <td className="py-3.5 px-4 font-mono">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#EAF2FF] text-[#2563EB] text-[10px] font-bold">
                    {log.actionType}
                  </span>
                  {log.supportTicketId && (
                    <div className="text-[#D99121] text-[10.5px] font-bold mt-1">
                      Ticket: {log.supportTicketId}
                    </div>
                  )}
                </td>
                <td className="py-3.5 px-4 text-[#667085]">{log.details}</td>
                <td className="py-3.5 px-4 font-mono text-[11px] text-[#16A36A]">
                  {log.entryHash.slice(0, 18)}...
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * 8. Admin Roles & RBAC Matrix (Figma Nodes 118:74 & 118:194)
 */
export const AdminRolesPermissionsPage: React.FC = () => {
  const roles = [
    'Super Admin',
    'Platform Ops',
    'SecOps Auditor',
    'Billing Admin',
    'Support Tier 2',
    'Support Read-Only',
  ];

  const matrix = [
    {
      perm: 'View Platform Telemetry & Queue Health',
      grants: [true, true, true, false, true, true],
    },
    {
      perm: 'Replay Dead-Letter Queue (DLQ) & Worker Pools',
      grants: [true, true, false, false, false, false],
    },
    {
      perm: 'Ticket-Gated Customer Cell Unmasking (SUP-XXXX)',
      grants: [true, false, true, false, true, false],
    },
    {
      perm: 'Initiate Refund <= $500 USD / ₱27,500 PHP',
      grants: [true, false, false, true, false, false],
    },
    {
      perm: 'Approve Dual-Control Refund > $500 USD',
      grants: [true, false, false, true, false, false],
    },
    {
      perm: 'Modify RBAC Matrix & Global Worker Ceilings',
      grants: [true, false, false, false, false, false],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] font-bold text-[#10213B]">Roles &amp; RBAC matrix</h1>
        <p className="text-[12px] text-[#667085] mt-1">
          {ADMIN_SECTIONS_TEXT.rbacSubtitle}
        </p>
      </div>

      <div className="bg-white border border-[#E4E9F1] rounded-[16px] p-6 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#F7F9FC] text-[#667085] text-[9.5px] font-bold uppercase">
              <th className="py-3.5 px-4 rounded-l-[8px]">CAPABILITY / SECURITY SCOPE</th>
              {roles.map((r) => (
                <th key={r} className="py-3.5 px-3 text-center">
                  {r}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4E9F1]">
            {matrix.map((row) => (
              <tr key={row.perm} className="hover:bg-[#FBFCFE]">
                <td className="py-3.5 px-4 font-semibold text-[#10213B]">{row.perm}</td>
                {row.grants.map((g, idx) => (
                  <td key={idx} className="py-3.5 px-3 text-center">
                    {g ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#E8F7EF] text-[#16A36A] text-[10px] font-bold">
                        Granted
                      </span>
                    ) : (
                      <span className="text-[#667085]">—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * 9. Admin System Settings (Figma Node 12:718 & 138:2 Section 7)
 */
export const AdminSystemSettingsPage: React.FC = () => {
  const [memoryCeiling, setMemoryCeiling] = useState(
    WORKER_RESOURCE_SPEC.containerMemoryCeilingMb
  );
  const [pauseWatermark, setPauseWatermark] = useState(
    WORKER_RESOURCE_SPEC.backpressurePauseThresholdMb
  );
  const [chunkSize, setChunkSize] = useState(WORKER_RESOURCE_SPEC.streamingChunkRows);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] font-bold text-[#10213B]">System settings</h1>
        <p className="text-[12px] text-[#667085] mt-1">
          {ADMIN_SECTIONS_TEXT.settingsSubtitle}
        </p>
      </div>

      <div className="bg-white border border-[#E4E9F1] rounded-[16px] p-6 shadow-sm space-y-4 max-w-3xl text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-[#10213B] mb-1.5">
              Container Hard Ceiling (MB)
            </label>
            <input
              type="number"
              value={memoryCeiling}
              onChange={(e) => setMemoryCeiling(Number(e.target.value))}
              className="w-full h-[40px] rounded-[10px] bg-[#F9FAFC] border border-[#E4E9F1] px-3.5 font-mono text-[#10213B]"
            />
          </div>
          <div>
            <label className="block font-semibold text-[#10213B] mb-1.5">
              Backpressure Pause Watermark (MB)
            </label>
            <input
              type="number"
              value={pauseWatermark}
              onChange={(e) => setPauseWatermark(Number(e.target.value))}
              className="w-full h-[40px] rounded-[10px] bg-[#F9FAFC] border border-[#E4E9F1] px-3.5 font-mono text-[#10213B]"
            />
          </div>
          <div>
            <label className="block font-semibold text-[#10213B] mb-1.5">
              Streaming Batch Chunk (Rows)
            </label>
            <input
              type="number"
              value={chunkSize}
              onChange={(e) => setChunkSize(Number(e.target.value))}
              className="w-full h-[40px] rounded-[10px] bg-[#F9FAFC] border border-[#E4E9F1] px-3.5 font-mono text-[#10213B]"
            />
          </div>
        </div>
        <p className="text-[#667085]">
          {ADMIN_SECTIONS_TEXT.settingsWorkerResolution} Active worker thresholds:{' '}
          <strong className="text-[#10213B]">
            {memoryCeiling} MB ceiling · {pauseWatermark} MB pause/flush · {chunkSize} rows per batch
          </strong>
          .
        </p>
      </div>
    </div>
  );
};

/**
 * 10. Admin Connections Page (Figma Node 21:905 — Admin — Connections / Desktop 1440)
 */
export const AdminOperationsConnectionsPage: React.FC = () => {
  const [activeSettingsNav, setActiveSettingsNav] = useState('Integrations');

  const settingsNavItems = [
    { name: 'General', sub: 'Brand and defaults' },
    { name: 'Plans & limits', sub: 'Plan quotas and limits' },
    { name: 'Uploads', sub: 'File intake and retention' },
    { name: 'Security', sub: 'Identity and protection' },
    { name: 'Notifications', sub: 'Email and in-app alerts' },
    { name: 'Integrations', sub: 'External services' },
    { name: 'Maintenance', sub: 'Maintenance and releases' },
  ];

  const serviceConnections = [
    {
      name: 'Azure MySQL Flexible Server (MySQL 8 / phpMyAdmin)',
      type: 'Database',
      status: 'Not configured',
      pill: 'bg-[#F2F4F7] text-[#667085]',
      desc: 'Stores structured product data',
    },
    {
      name: 'Azure Blob Storage',
      type: 'File storage',
      status: 'Not configured',
      pill: 'bg-[#F2F4F7] text-[#667085]',
      desc: 'Private uploads and generated reports',
    },
    {
      name: 'Azure Managed Redis',
      type: 'Cache',
      status: 'Optional / not configured',
      pill: 'bg-[#F2F4F7] text-[#667085]',
      desc: 'Distributed rate limits and cache',
    },
    {
      name: 'Azure Service Bus',
      type: 'Queue',
      status: 'Not configured',
      pill: 'bg-[#F2F4F7] text-[#667085]',
      desc: 'Background validation jobs',
    },
    {
      name: 'Email delivery provider',
      type: 'Messaging',
      status: 'Not configured',
      pill: 'bg-[#F2F4F7] text-[#667085]',
      desc: 'Verification and account emails',
    },
    {
      name: 'Payment provider',
      type: 'Billing',
      status: 'Sandbox design only',
      pill: 'bg-[#FFF4DE] text-[#D99121]',
      desc: 'Hosted checkout and signed webhooks',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Row (Nodes 21:956 - 21:959) */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-[#10213B]">Connections</h1>
          <p className="text-[12px] text-[#667085] mt-1">
            View the health and configuration state of connected platform services.
          </p>
        </div>

        <span className="px-4 py-1.5 rounded-full bg-[#FFF4DE] text-[#D99121] text-[10px] font-bold uppercase tracking-wider">
          DESIGN PREVIEW
        </span>
      </div>

      {/* Main Two-Column Connections Layout (Nodes 21:960 - 21:1005) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 3 Cols: Settings Section Navigation (Node 21:960) */}
        <div className="lg:col-span-3 bg-white border border-[#E4E9F1] rounded-[13px] p-4 shadow-sm space-y-2">
          <div className="text-[9px] font-bold uppercase tracking-wider text-[#667085] px-2 pb-1">
            SETTINGS
          </div>
          {settingsNavItems.map((item) => {
            const isActive = activeSettingsNav === item.name;
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => setActiveSettingsNav(item.name)}
                className={`w-full text-left rounded-[10px] px-3 py-2.5 transition ${
                  isActive ? 'bg-[#F0F5FF]' : 'hover:bg-[#FBFCFE]'
                }`}
              >
                <div
                  className={`text-[11.5px] font-semibold ${
                    isActive ? 'text-[#2563EB]' : 'text-[#10213B]'
                  }`}
                >
                  {item.name}
                </div>
                <div className="text-[10px] text-[#667085] mt-0.5">{item.sub}</div>
              </button>
            );
          })}
        </div>

        {/* Right 9 Cols: Metrics + How connections work + Service connections table */}
        <div className="lg:col-span-9 space-y-5">
          {/* 4 Metric Cards (Nodes 21:976 - 21:991) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#E4E9F1] rounded-[12px] p-4 shadow-sm">
              <div className="text-[10px] text-[#667085]">Connected services</div>
              <div className="text-[22px] font-bold text-[#10213B] mt-1">0</div>
              <div className="text-[10px] text-[#D99121] mt-2 font-medium">
                No live config in preview
              </div>
            </div>

            <div className="bg-white border border-[#E4E9F1] rounded-[12px] p-4 shadow-sm">
              <div className="text-[10px] text-[#667085]">Sandbox services</div>
              <div className="text-[22px] font-bold text-[#10213B] mt-1">1</div>
              <div className="text-[10px] text-[#2563EB] mt-2 font-medium">
                Payment sandbox example
              </div>
            </div>

            <div className="bg-white border border-[#E4E9F1] rounded-[12px] p-4 shadow-sm">
              <div className="text-[10px] text-[#667085]">Optional services</div>
              <div className="text-[22px] font-bold text-[#10213B] mt-1">1</div>
              <div className="text-[10px] text-[#7658D6] mt-2 font-medium">
                Redis until scale phase
              </div>
            </div>

            <div className="bg-white border border-[#E4E9F1] rounded-[12px] p-4 shadow-sm">
              <div className="text-[10px] text-[#667085]">Last health check</div>
              <div className="text-[22px] font-bold text-[#10213B] mt-1">Not run</div>
              <div className="text-[10px] text-[#D84A4A] mt-2 font-medium">Configure first</div>
            </div>
          </div>

          {/* How connections work Card (Node 21:992) */}
          <div className="bg-white border border-[#E4E9F1] rounded-[13px] p-5 shadow-sm space-y-3">
            <h2 className="text-[13px] font-bold text-[#10213B]">How connections work</h2>
            <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
              <div className="md:col-span-3 bg-[#FAFBFD] border border-[#E4E9F1] rounded-[9px] p-3.5">
                <div className="text-[11px] font-semibold text-[#10213B]">Admin configures</div>
                <div className="text-[10px] text-[#667085] mt-1">Key Vault / settings</div>
              </div>
              <div className="hidden md:flex md:col-span-1 justify-center text-[#2563EB] font-bold">
                →
              </div>
              <div className="md:col-span-3 bg-[#F0F5FF] border border-[#E4E9F1] rounded-[9px] p-3.5">
                <div className="text-[11px] font-semibold text-[#10213B]">Backend verifies</div>
                <div className="text-[10px] text-[#667085] mt-1">Secrets + health probe</div>
              </div>
              <div className="hidden md:flex md:col-span-1 justify-center text-[#2563EB] font-bold">
                →
              </div>
              <div className="md:col-span-3 bg-[#FAFBFD] border border-[#E4E9F1] rounded-[9px] p-3.5">
                <div className="text-[11px] font-semibold text-[#10213B]">Service reports</div>
                <div className="text-[10px] text-[#667085] mt-1">Ready / degraded / failed</div>
              </div>
            </div>
          </div>

          {/* Service connections Table Card (Node 21:1005) */}
          <div className="bg-white border border-[#E4E9F1] rounded-[13px] p-5 shadow-sm space-y-3">
            <div>
              <h2 className="text-[14px] font-bold text-[#10213B]">Service connections</h2>
              <p className="text-[11px] text-[#667085] mt-0.5">
                All states below are placeholders for the prototype, not verified live connections.
              </p>
            </div>

            <div className="divide-y divide-[#E4E9F1]">
              {serviceConnections.map((svc) => (
                <div
                  key={svc.name}
                  className="py-3.5 flex flex-wrap items-center justify-between gap-4 text-xs"
                >
                  <div className="w-full sm:w-2/5 font-semibold text-[#10213B]">{svc.name}</div>
                  <div className="text-[#667085] text-[11px] w-24">{svc.type}</div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${svc.pill}`}>
                      {svc.status}
                    </span>
                  </div>
                  <div className="text-[#667085] text-[11px] flex-1 text-right">{svc.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
