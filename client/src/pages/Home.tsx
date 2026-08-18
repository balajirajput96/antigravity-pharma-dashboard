/**
 * Controlled Lab Ledger: preserve authenticated tRPC workspace actions while presenting them as a compact, owner-reviewed record.
 * The interface never implies that a draft, schedule, or delivery has occurred without the existing guarded server mutation.
 */
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { isFirstImportPending as isFirstImportPendingState, shouldAnnounceFirstImport } from "@shared/importFeedback";
import { toast } from "sonner";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileDown,
  FileText,
  FolderOpen,
  LoaderCircle,
  LockKeyhole,
  MailCheck,
  Play,
  SearchCheck,
  Send,
  ShieldCheck,
  XCircle,
} from "lucide-react";

const safetyRules = [
  "No email, form, or external submission without Confirm & Send.",
  "No Aadhaar, PAN, bank details, password, OTP, or private profile data.",
  "No attachments unless separately reviewed and confirmed.",
  "Only public vacancy/contact evidence and truthful outreach content.",
];

const statusTone: Record<string, string> = {
  Prepared: "border-amber-200/25 bg-amber-200/10 text-amber-100",
  "Verified-Sent": "border-[#b6d74a]/25 bg-[#b6d74a]/10 text-[#d7ee88]",
  "Skipped-Role mismatch": "border-rose-200/20 bg-rose-200/10 text-rose-100",
  "Skipped-Duplicate": "border-white/10 bg-white/[0.04] text-zinc-300",
};

function formatDate(value?: Date | string | null) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(new Date(value));
}

function LedgerStamp({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "signal" | "warning" }) {
  const tones = {
    neutral: "border-white/10 bg-white/[0.035] text-zinc-300",
    signal: "border-[#b6d74a]/35 bg-[#b6d74a]/10 text-[#d7ee88]",
    warning: "border-amber-200/20 bg-amber-200/10 text-amber-100",
  };
  return <span className={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.18em] ${tones[tone]}`}>{children}</span>;
}

function MetricCard({ label, value, note, icon: Icon, position }: { label: string; value: number | string; note: string; icon: typeof SearchCheck; position: number }) {
  const spans = ["sm:col-span-4 xl:col-span-5", "sm:col-span-3 xl:col-span-2", "sm:col-span-3 xl:col-span-3", "sm:col-span-2 xl:col-span-2"];
  return (
    <article className={`ledger-card group relative overflow-hidden p-5 ${spans[position]}`}>
      <span className="signal-notch" />
      <span className="absolute right-4 top-4 font-mono text-[9px] tracking-[0.18em] text-zinc-700">0{position + 1}</span>
      <div className="flex items-start justify-between gap-4">
        <div><p className="ledger-micro text-zinc-500">{label}</p><p className="ledger-metric mt-3 text-4xl text-white">{value}</p></div>
        <Icon className="mt-1 h-4 w-4 text-[#b6d74a] transition-transform duration-200 group-hover:-translate-y-0.5" strokeWidth={1.7} />
      </div>
      <p className="mt-4 text-xs leading-5 text-zinc-500">{note}</p>
    </article>
  );
}

export default function Home() {
  const dashboard = trpc.workspace.dashboard.useQuery(undefined, { retry: false });
  const [awaitingFirstImport, setAwaitingFirstImport] = useState(false);
  const firstObservedRunId = useRef<number | null | undefined>(undefined);
  const firstImportToastRunId = useRef<number | null>(null);
  const [selectedDraft, setSelectedDraft] = useState<any>(null);
  const data: any = dashboard.data;
  const latest = data?.latest;
  const files = data?.files ?? [];
  const drafts = data?.drafts ?? [];
  const leads = data?.recentLeads ?? [];

  const initialize = trpc.workspace.initialize.useMutation({
    onSuccess: () => { toast.success("Daily instructions saved to your private workspace."); dashboard.refetch(); },
  });
  const activateSchedule = trpc.workspace.activateDailySchedule.useMutation({
    onSuccess: result => {
      if (!latest) setAwaitingFirstImport(true);
      toast.success(`Daily 10:00 IST schedule is active. Next run: ${result.nextExecutionAt ? formatDate(result.nextExecutionAt) : "platform pending"}`);
      dashboard.refetch();
    },
    onError: () => {
      setAwaitingFirstImport(false);
      toast.error("The daily schedule could not be activated. Your current workspace data was not changed.");
    },
  });
  const sendDraft = trpc.workspace.confirmAndSend.useMutation({
    onSuccess: result => {
      toast.success(result.deliverySent ? "Email was accepted by the configured delivery provider and recorded as Verified-Sent." : "Confirmation was recorded, but no email provider is configured—nothing was sent.");
      dashboard.refetch();
    },
  });

  const isFirstImportPending = isFirstImportPendingState(Boolean(latest), awaitingFirstImport, activateSchedule.isPending);
  const statusCounts = useMemo(() => leads.reduce((acc: Record<string, number>, lead: any) => ({ ...acc, [lead.status]: (acc[lead.status] ?? 0) + 1 }), {}), [leads]);
  const cards = [
    { label: "Leads audited", value: latest?.totalAudited ?? 0, note: latest ? `Run: ${latest.runDate}` : "Awaiting first verified run", icon: SearchCheck },
    { label: "Drafts ready", value: latest?.preparedCount ?? 0, note: "Owner review required", icon: FileText },
    { label: "Verified sent", value: latest?.sentCount ?? 0, note: "Delivery audit recorded", icon: CheckCircle2 },
    { label: "Skipped safely", value: latest?.skippedCount ?? 0, note: "Mismatch or duplicate", icon: ShieldCheck },
  ];

  useEffect(() => {
    if (dashboard.isLoading || !data) return;
    const currentRunId = latest?.id ?? null;
    if (firstObservedRunId.current === undefined) {
      firstObservedRunId.current = currentRunId;
      if (!currentRunId && data.settings?.scheduleEnabled) setAwaitingFirstImport(true);
      return;
    }
    if (!currentRunId && data.settings?.scheduleEnabled && firstObservedRunId.current === null) {
      setAwaitingFirstImport(true);
      return;
    }
    if (shouldAnnounceFirstImport(firstObservedRunId.current, currentRunId, firstImportToastRunId.current)) {
      firstImportToastRunId.current = currentRunId;
      setAwaitingFirstImport(false);
      toast.success("First verified lead import complete", {
        description: `${latest.totalAudited} leads audited · ${latest.preparedCount} draft${latest.preparedCount === 1 ? "" : "s"} ready · ${latest.skippedCount} safely skipped. Your Hindi report and JSONL audit are available in Workspace files.`,
      });
    }
  }, [dashboard.isLoading, data, latest]);

  useEffect(() => {
    if (!isFirstImportPending) return;
    const refreshInterval = window.setInterval(() => dashboard.refetch(), 15_000);
    return () => window.clearInterval(refreshInterval);
  }, [dashboard.refetch, isFirstImportPending]);

  const beginSchedule = () => {
    if (!latest) setAwaitingFirstImport(true);
    activateSchedule.mutate();
  };

  return (
    <DashboardLayout>
      <div className="app-grain pointer-events-none fixed inset-0 z-0 opacity-25" />
      <div className="relative z-10 mx-auto max-w-[1540px] text-zinc-100">
        <section id="overview" className="content-enter grid gap-5 xl:grid-cols-[minmax(0,1fr)_398px]">
          <div className="ledger-hero relative min-h-[322px] overflow-hidden border border-white/10 p-6 sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_84%_20%,rgba(182,215,74,0.13),transparent_30%),linear-gradient(124deg,rgba(255,255,255,0.04),transparent_30%)]" />
            <div className="absolute inset-y-0 right-[20%] w-px bg-white/[0.06]" />
            <div className="absolute bottom-0 right-0 border-l border-t border-white/10 bg-[#111311]/75 px-3 py-2 backdrop-blur-sm"><p className="ledger-micro text-zinc-500">Private record / A-001</p></div>
            <div className="relative flex h-full min-h-[274px] flex-col justify-between">
              <div className="flex items-start justify-between gap-4"><LedgerStamp tone="signal"><span className="status-dot" /> Owner review active</LedgerStamp><span className="font-mono text-xs text-zinc-500">A-001</span></div>
              <div className="max-w-2xl"><p className="ledger-micro text-zinc-400">Antigravity Pharma / overview</p><h1 className="ledger-title mt-3 text-5xl leading-[0.95] text-white sm:text-6xl lg:text-7xl">Your job-search<br /><em>control room.</em></h1><p className="mt-5 max-w-xl text-sm leading-6 text-zinc-300 sm:text-base">Every lead is verified, every draft stays in review, and every send needs direct approval.</p></div>
            </div>
          </div>

          <aside className="ledger-card flex min-h-[322px] flex-col justify-between overflow-hidden p-6">
            <div><div className="flex items-center justify-between"><p className="ledger-micro text-zinc-500">Daily review window</p><CalendarDays className="h-4 w-4 text-[#b6d74a]" /></div><div className="mt-8 flex items-baseline gap-2"><span className="ledger-metric text-5xl text-white">10:00</span><span className="text-sm font-medium text-zinc-400">AM IST</span></div><p className="mt-3 max-w-[29ch] text-sm leading-6 text-zinc-500">The backend schedule remains safety-gated and only activates through your owner-reviewed workspace.</p></div>
            <div className="mt-7 border-t border-white/10 pt-5"><div className="flex items-center justify-between text-xs"><span className="text-zinc-500">Next status</span><span className={data?.settings?.scheduleEnabled ? "font-semibold text-[#d7ee88]" : "font-semibold text-zinc-300"}>{data?.settings?.scheduleEnabled ? "Schedule active" : "Review required"}</span></div><Button onClick={beginSchedule} disabled={activateSchedule.isPending} variant="outline" className="mt-4 w-full border-white/15 bg-white/[0.035] text-zinc-100 hover:border-[#b6d74a]/50 hover:bg-[#b6d74a]/10 hover:text-[#e5f5a8]"><Play className="mr-2 h-3.5 w-3.5 fill-current" /> {activateSchedule.isPending ? "Activating…" : data?.settings?.scheduleEnabled ? "Refresh schedule" : "Activate 10:00 IST"}</Button></div>
          </aside>
        </section>

        {dashboard.isError && <section className="mt-5 border border-rose-200/20 bg-rose-200/10 p-5 text-sm text-rose-100"><div className="flex gap-3"><AlertTriangle size={18} className="shrink-0" /><div><strong>Private access check</strong><p className="mt-1 text-rose-100/80">This signed-in account is not permitted to access Balaji Rajput’s workspace. Sign out and use the owner account.</p></div></div></section>}

        <section className="mt-5 grid gap-3 sm:grid-cols-12">{cards.map((card, position) => <MetricCard key={card.label} {...card} position={position} />)}</section>

        <section className="mt-5 grid gap-5 2xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.55fr)]">
          <div className="space-y-5">
            <section id="runs" className="ledger-card overflow-hidden">
              <div className="flex flex-col gap-4 border-b border-white/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="ledger-micro text-zinc-500">Latest job-search run</p><h2 className="mt-1 text-lg font-semibold text-zinc-100">{latest ? `Completed ${formatDate(latest.completedAt)}` : "No job-search run recorded"}</h2></div><div className="flex flex-wrap gap-2">{!data?.settings?.agentInstructionFileId && <Button variant="outline" onClick={() => initialize.mutate()} disabled={initialize.isPending} className="border-white/15 bg-white/[0.035] text-zinc-100 hover:bg-white/[0.08]"><Play size={15} /> {initialize.isPending ? "Initializing…" : "Initialize workspace"}</Button>}<Button onClick={beginSchedule} disabled={activateSchedule.isPending} className="bg-[#b6d74a] text-[#141714] hover:bg-[#c9e76e]"><Clock3 size={15} /> {activateSchedule.isPending ? "Activating…" : "Review schedule"}</Button></div></div>
              {isFirstImportPending && <div className="mx-6 mt-6 border border-[#b6d74a]/25 bg-[#b6d74a]/10 p-4" role="status" aria-live="polite" data-testid="first-import-progress"><div className="flex items-start gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center bg-[#b6d74a]/15 text-[#d7ee88]"><LoaderCircle size={18} className="animate-spin" /></div><div className="min-w-0"><p className="text-sm font-semibold text-[#ecf7c4]">First verified lead import is in progress</p><p className="mt-1 text-xs leading-5 text-[#d7ee88]/80">Waiting for verified public-vacancy leads. No outreach, account creation, or document sharing will occur during this step.</p></div><LedgerStamp tone="signal">Safety-gated</LedgerStamp></div><Progress value={62} className="mt-4 bg-[#b6d74a]/15 [&_[data-slot=progress-indicator]]:bg-[#b6d74a]" /></div>}
              <div className="grid gap-3 px-6 py-6 sm:grid-cols-4">{["Prepared", "Verified-Sent", "Skipped-Role mismatch", "Skipped-Duplicate"].map(status => <div key={status} className="border border-white/[0.07] bg-white/[0.025] p-4"><p className="ledger-metric text-2xl text-white">{statusCounts[status] ?? 0}</p><p className="mt-1 text-xs leading-5 text-zinc-500">{status}</p></div>)}</div>
              <div className="border-t border-white/10 px-6 py-5"><div className="space-y-3">{dashboard.isLoading ? <><Skeleton className="h-16 bg-white/10" /><Skeleton className="h-16 bg-white/10" /></> : leads.length ? leads.slice(0, 5).map((lead: any) => <div key={lead.id} className="flex flex-col justify-between gap-3 border border-white/[0.08] bg-black/10 px-4 py-3 sm:flex-row sm:items-center"><div className="min-w-0"><p className="truncate text-sm font-medium text-zinc-100">{lead.employer} <span className="font-normal text-zinc-500">· {lead.roleTitle}</span></p><p className="mt-1 truncate text-xs text-zinc-500">{lead.location || "Location not stated"} · Posted {lead.postingDate || "date to verify"}</p></div><Badge variant="outline" className={`w-fit whitespace-nowrap ${statusTone[lead.status] ?? "border-white/10 bg-white/[0.04] text-zinc-300"}`}>{lead.status}</Badge></div>) : <div className="border border-dashed border-white/15 px-5 py-8 text-center text-sm text-zinc-500">The private workspace is ready. The first verified run will appear here after the production schedule is activated.</div>}</div></div>
            </section>

            <section id="drafts" className="ledger-card overflow-hidden"><div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5"><div><p className="ledger-micro text-zinc-500">Outreach drafts awaiting review</p><h2 className="mt-1 text-lg font-semibold text-zinc-100">Nothing sends without your approval.</h2></div><LedgerStamp tone="warning">{drafts.length} ready</LedgerStamp></div><div className="mx-6 mt-5 flex items-center gap-2 border border-amber-200/20 bg-amber-200/10 px-3 py-2 text-xs text-amber-100"><AlertTriangle size={14} /> {data?.deliveryConfigured ? "A delivery provider is connected. Only Confirm & Send can invoke it." : "Email delivery is not connected. Confirm & Send records approval but cannot send an email."}</div><div className="space-y-3 px-6 py-5">{drafts.length ? drafts.map((item: any) => <article key={item.draft.id} className="border border-white/[0.08] bg-black/10 p-4"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div className="min-w-0"><p className="truncate text-sm font-semibold text-zinc-100">{item.lead.employer}</p><p className="mt-1 text-xs text-zinc-500">{item.lead.roleTitle} · {item.draft.recipientEmail}</p><p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-400">{item.draft.subject}</p></div><Button size="sm" onClick={() => setSelectedDraft(item)} className="bg-[#b6d74a] text-[#141714] hover:bg-[#c9e76e]">Review draft <ArrowUpRight size={14} /></Button></div></article>) : <div className="border border-dashed border-white/15 px-5 py-7 text-sm text-zinc-500">No prepared drafts are waiting for review.</div>}</div></section>
          </div>

          <aside className="space-y-5"><section id="safety" className="ledger-card overflow-hidden border-[#b6d74a]/20 bg-[#b6d74a]/[0.07] p-6"><div className="flex items-center gap-2 text-[#d7ee88]"><ShieldCheck size={19} /><p className="ledger-micro">Hard safety gate</p></div><p className="mt-4 text-sm leading-6 text-zinc-300">Always active. These rules cannot be bypassed by the daily workflow.</p><ul className="mt-5 space-y-3">{safetyRules.map(rule => <li key={rule} className="flex gap-3 text-sm leading-5 text-zinc-300"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#b6d74a]" />{rule}</li>)}</ul><div className="mt-6 flex items-center gap-2 border-t border-[#b6d74a]/20 pt-4 text-xs font-medium text-[#d7ee88]"><LockKeyhole size={14} /> Owner confirmation is mandatory.</div></section>
          <section id="workspace" className="ledger-card overflow-hidden"><div className="flex items-center justify-between border-b border-white/10 px-6 py-5"><div><p className="ledger-micro text-zinc-500">Workspace files</p><p className="mt-1 text-sm font-semibold text-zinc-100">Private reports & audit logs</p></div><FolderOpen size={19} className="text-[#b6d74a]" /></div><div className="space-y-2 px-4 py-4">{files.length ? files.slice(0, 6).map((file: any) => <a key={file.id} href={file.storageUrl} target="_blank" rel="noreferrer" className="group flex items-center gap-3 px-2 py-3 transition hover:bg-white/[0.045]"><div className="grid h-8 w-8 place-items-center border border-white/10 bg-white/[0.03] text-[#b6d74a]"><FileText size={15} /></div><span className="min-w-0 flex-1 truncate text-xs font-medium text-zinc-300">{file.filename}</span><FileDown size={15} className="text-zinc-600 group-hover:text-[#d7ee88]" /></a>) : <p className="px-2 py-3 text-xs leading-5 text-zinc-500">Reports, JSONL audit files, and daily instructions will appear here after initialization.</p>}</div></section></aside>
        </section>
      </div>

      <Dialog open={Boolean(selectedDraft)} onOpenChange={open => !open && setSelectedDraft(null)}><DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-white/10 bg-[#1a1e1a] text-zinc-100"><DialogHeader><DialogTitle className="ledger-title text-3xl text-white">Review outreach draft</DialogTitle><DialogDescription className="text-zinc-400">Confirm only if the content is truthful, the public recipient is correct, and you want to send this exact email.</DialogDescription></DialogHeader>{selectedDraft && <div className="space-y-4 border border-white/10 bg-black/15 p-4 text-sm"><p><span className="font-semibold text-zinc-200">To:</span> <span className="text-zinc-400">{selectedDraft.draft.recipientEmail}</span></p><p><span className="font-semibold text-zinc-200">Subject:</span> <span className="text-zinc-400">{selectedDraft.draft.subject}</span></p><div className="max-h-[38vh] overflow-y-auto border border-white/10 bg-white/[0.025] p-4 whitespace-pre-wrap leading-6 text-zinc-300">{selectedDraft.draft.body}</div></div>}<DialogFooter><Button variant="outline" onClick={() => setSelectedDraft(null)} className="border-white/15 bg-transparent text-zinc-200 hover:bg-white/[0.05]">Cancel</Button><Button onClick={() => { if (selectedDraft) sendDraft.mutate({ draftId: selectedDraft.draft.id }); setSelectedDraft(null); }} disabled={sendDraft.isPending} className="bg-[#b6d74a] text-[#141714] hover:bg-[#c9e76e]"><Send size={15} /> {sendDraft.isPending ? "Recording…" : "Confirm & Send"}</Button></DialogFooter></DialogContent></Dialog>
    </DashboardLayout>
  );
}
