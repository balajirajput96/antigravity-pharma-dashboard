import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import { AlertTriangle, ArrowUpRight, CheckCircle2, Clock3, FileDown, FileText, FolderOpen, LockKeyhole, MailCheck, Play, ShieldCheck, Sparkles, XCircle } from "lucide-react";

const safetyRules = [
  "No email, form, or external submission without Confirm & Send.",
  "No Aadhaar, PAN, bank details, password, OTP, or private profile data.",
  "No attachments unless separately reviewed and confirmed.",
  "Only public vacancy/contact evidence and truthful outreach content.",
];

const statusTone: Record<string, string> = {
  "Prepared": "bg-amber-50 text-amber-700 border-amber-200",
  "Verified-Sent": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Skipped-Role mismatch": "bg-rose-50 text-rose-700 border-rose-200",
  "Skipped-Duplicate": "bg-slate-100 text-slate-600 border-slate-200",
};

function formatDate(value?: Date | string | null) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(new Date(value));
}

export default function Home() {
  const dashboard = trpc.workspace.dashboard.useQuery(undefined, { retry: false });
  const initialize = trpc.workspace.initialize.useMutation({ onSuccess: () => { toast.success("Daily instructions saved to your private workspace."); dashboard.refetch(); } });
  const activateSchedule = trpc.workspace.activateDailySchedule.useMutation({ onSuccess: result => { toast.success(`Daily 10:00 IST schedule is active. Next run: ${result.nextExecutionAt ? formatDate(result.nextExecutionAt) : "platform pending"}`); dashboard.refetch(); } });
  const sendDraft = trpc.workspace.confirmAndSend.useMutation({ onSuccess: result => { toast.success(result.deliverySent ? "Email was accepted by the configured delivery provider and recorded as Verified-Sent." : "Confirmation was recorded, but no email provider is configured—nothing was sent."); dashboard.refetch(); } });
  const [selectedDraft, setSelectedDraft] = useState<any>(null);
  const data: any = dashboard.data;
  const latest = data?.latest;
  const files = data?.files ?? [];
  const drafts = data?.drafts ?? [];
  const leads = data?.recentLeads ?? [];
  const statusCounts = useMemo(() => leads.reduce((acc: Record<string, number>, lead: any) => ({ ...acc, [lead.status]: (acc[lead.status] ?? 0) + 1 }), {}), [leads]);
  const cards = [
    { label: "Leads audited", value: latest?.totalAudited ?? 0, note: latest ? `Run: ${latest.runDate}` : "Awaiting first run", icon: Sparkles, tone: "bg-[#e8f8ed] text-[#1d7a44]" },
    { label: "Drafts ready", value: latest?.preparedCount ?? 0, note: "Confirmation required", icon: MailCheck, tone: "bg-[#fff5dc] text-[#a66a00]" },
    { label: "Verified sent", value: latest?.sentCount ?? 0, note: "Delivery audit recorded", icon: CheckCircle2, tone: "bg-[#e7f1ff] text-[#2763aa]" },
    { label: "Skipped safely", value: latest?.skippedCount ?? 0, note: "Mismatch or duplicate", icon: XCircle, tone: "bg-[#fbecef] text-[#b54a59]" },
  ];

  return <DashboardLayout>
    <div className="mx-auto max-w-[1480px] space-y-7 text-[#18251f]">
      <section id="overview" className="overflow-hidden rounded-[2rem] bg-[#10221c] p-6 text-white shadow-[0_18px_50px_rgba(16,34,28,0.16)] sm:p-8">
        <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <div className="max-w-2xl"><div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-white/5 px-3 py-1 text-xs font-medium text-emerald-200"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> PRIVATE • BALAJI RAJPUT</div><h1 className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">Your job-search control room.</h1><p className="mt-3 max-w-xl text-base leading-7 text-white/65">A safety-first workspace for daily pharmaceutical QA, IPQA, QMS and OSD opportunities. Every lead is verified, every draft stays in review, and every send needs your direct approval.</p></div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4"><p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/45">Next scheduled run</p><p className="mt-1 flex items-center gap-2 text-lg font-semibold"><Clock3 size={17} className="text-emerald-300" /> Daily · 10:00 AM IST</p><p className="mt-1 text-xs text-white/45">{data?.settings?.scheduleEnabled ? "Production schedule active" : "Activate after the site is published"}</p></div>
        </div>
      </section>

      {dashboard.isError && <section className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800"><div className="flex gap-3"><AlertTriangle size={18} className="shrink-0" /><div><strong>Private access check</strong><p className="mt-1">This signed-in account is not permitted to access Balaji Rajput’s workspace. Sign out and use the owner account.</p></div></div></section>}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{cards.map(card => <article key={card.label} className="rounded-[1.5rem] border border-black/[0.05] bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><div className={`grid h-10 w-10 place-items-center rounded-xl ${card.tone}`}><card.icon size={19} /></div><span className="text-2xl font-semibold tracking-tight">{dashboard.isLoading ? "—" : card.value}</span></div><p className="mt-6 text-sm font-medium">{card.label}</p><p className="mt-1 text-xs text-[#64736b]">{card.note}</p></article>)}</section>

      <section className="grid gap-7 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-7">
          <section className="rounded-[1.65rem] border border-black/[0.05] bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-semibold">Latest job-search run</p><p className="mt-1 text-sm text-[#718078]">{latest ? `Completed ${formatDate(latest.completedAt)}` : "No job-search run has been recorded yet."}</p></div><div className="flex flex-wrap gap-2">{!data?.settings?.agentInstructionFileId && <Button variant="outline" onClick={() => initialize.mutate()} disabled={initialize.isPending}><Play size={15} /> Initialize workspace</Button>}<Button onClick={() => activateSchedule.mutate()} disabled={activateSchedule.isPending} className="bg-[#10221c] hover:bg-[#1b382d]"><Clock3 size={15} /> {activateSchedule.isPending ? "Activating…" : data?.settings?.scheduleEnabled ? "Refresh schedule" : "Activate 10:00 IST"}</Button></div></div>
            <div className="mt-7 grid gap-3 sm:grid-cols-4">{["Prepared", "Verified-Sent", "Skipped-Role mismatch", "Skipped-Duplicate"].map(status => <div key={status} className="rounded-2xl bg-[#f7f9f7] p-4"><p className="text-xl font-semibold">{statusCounts[status] ?? 0}</p><p className="mt-1 text-xs leading-5 text-[#68776e]">{status}</p></div>)}</div>
            <div className="mt-7 h-px bg-black/[0.06]" />
            <div className="mt-5 space-y-3">{dashboard.isLoading ? <><Skeleton className="h-16" /><Skeleton className="h-16" /></> : leads.length ? leads.slice(0, 5).map((lead: any) => <div key={lead.id} className="flex flex-col justify-between gap-3 rounded-2xl border border-black/[0.05] px-4 py-3 sm:flex-row sm:items-center"><div className="min-w-0"><p className="truncate text-sm font-medium">{lead.employer} <span className="font-normal text-[#75837b]">· {lead.roleTitle}</span></p><p className="mt-1 truncate text-xs text-[#75837b]">{lead.location || "Location not stated"} · Posted {lead.postingDate || "date to verify"}</p></div><Badge variant="outline" className={`w-fit whitespace-nowrap ${statusTone[lead.status] ?? "bg-slate-50"}`}>{lead.status}</Badge></div>) : <div className="rounded-2xl border border-dashed border-black/10 px-5 py-8 text-center text-sm text-[#718078]">The private workspace is ready. The first verified run will appear here after the production schedule is activated.</div>}</div>
          </section>

          <section id="drafts" className="rounded-[1.65rem] border border-black/[0.05] bg-white p-5 shadow-sm sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold">Outreach drafts awaiting review</p><p className="mt-1 text-sm text-[#718078]">Only you can approve a send. No background delivery is allowed.</p></div><Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">{drafts.length} ready</Badge></div>
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800"><AlertTriangle size={14} /> {data?.deliveryConfigured ? "A delivery provider is connected. Only Confirm & Send can invoke it." : "Email delivery is not connected. Confirm & Send will record your approval but cannot send anything."}</div><div className="mt-4 space-y-3">{drafts.length ? drafts.map((item: any) => <article key={item.draft.id} className="rounded-2xl border border-black/[0.06] p-4"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div className="min-w-0"><p className="truncate text-sm font-semibold">{item.lead.employer}</p><p className="mt-1 text-xs text-[#718078]">{item.lead.roleTitle} · {item.draft.recipientEmail}</p><p className="mt-3 line-clamp-2 text-sm leading-6 text-[#516058]">{item.draft.subject}</p></div><Button size="sm" onClick={() => setSelectedDraft(item)} className="bg-[#10221c] hover:bg-[#1b382d]">Review draft <ArrowUpRight size={14} /></Button></div></article>) : <div className="rounded-2xl bg-[#fafbf9] p-6 text-sm text-[#718078]">No prepared drafts are waiting for review.</div>}</div>
          </section>
        </div>

        <aside className="space-y-7">
          <section id="safety" className="rounded-[1.65rem] border border-emerald-900/10 bg-[#dff4e5] p-6"><div className="flex items-center gap-2 text-[#126539]"><ShieldCheck size={19} /><p className="text-sm font-semibold">Hard safety gate</p></div><p className="mt-3 text-sm leading-6 text-[#2b5b40]">Always active. These rules cannot be bypassed by the daily workflow.</p><ul className="mt-5 space-y-3">{safetyRules.map(rule => <li key={rule} className="flex gap-3 text-sm leading-5 text-[#29563c]"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#167243]" />{rule}</li>)}</ul><div className="mt-6 flex items-center gap-2 rounded-xl bg-white/65 px-3 py-3 text-xs font-medium text-[#26543a]"><LockKeyhole size={14} /> Owner confirmation is mandatory.</div></section>
          <section id="workspace" className="rounded-[1.65rem] border border-black/[0.05] bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-sm font-semibold">Workspace files</p><p className="mt-1 text-xs text-[#718078]">Private reports & audit logs</p></div><FolderOpen size={19} className="text-[#517260]" /></div><div className="mt-5 space-y-2">{files.length ? files.slice(0, 6).map((file: any) => <a key={file.id} href={file.storageUrl} target="_blank" rel="noreferrer" className="group flex items-center gap-3 rounded-xl px-2 py-3 transition hover:bg-[#f4f7f4]"><div className="grid h-8 w-8 place-items-center rounded-lg bg-[#eef4ef] text-[#2c6b45]"><FileText size={15} /></div><span className="min-w-0 flex-1 truncate text-xs font-medium">{file.filename}</span><FileDown size={15} className="text-[#829087] group-hover:text-[#10221c]" /></a>) : <p className="rounded-xl bg-[#f8faf8] p-4 text-xs leading-5 text-[#718078]">Reports, JSONL audit files, and daily instructions will appear here after initialization.</p>}</div></section>
        </aside>
      </section>
    </div>
    <Dialog open={Boolean(selectedDraft)} onOpenChange={open => !open && setSelectedDraft(null)}><DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto"><DialogHeader><DialogTitle>Review outreach draft</DialogTitle><DialogDescription>Confirm only if the content is truthful, the public recipient is correct, and you want to send this exact email.</DialogDescription></DialogHeader>{selectedDraft && <div className="space-y-4 rounded-2xl bg-[#f7f9f7] p-4 text-sm"><p><span className="font-semibold">To:</span> {selectedDraft.draft.recipientEmail}</p><p><span className="font-semibold">Subject:</span> {selectedDraft.draft.subject}</p><div className="rounded-xl border border-black/[0.06] bg-white p-4 whitespace-pre-wrap leading-6">{selectedDraft.draft.body}</div></div>}<DialogFooter><Button variant="outline" onClick={() => setSelectedDraft(null)}>Cancel</Button><Button disabled={sendDraft.isPending} onClick={() => { sendDraft.mutate({ draftId: selectedDraft.draft.id }); setSelectedDraft(null); }} className="bg-emerald-700 hover:bg-emerald-800">{sendDraft.isPending ? "Confirming…" : "Confirm & Send"}</Button></DialogFooter></DialogContent></Dialog>
  </DashboardLayout>;
}
