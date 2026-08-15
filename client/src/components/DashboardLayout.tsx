import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { startLogin } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import {
  BriefcaseBusiness,
  CalendarClock,
  FileText,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  PanelLeft,
  ShieldCheck,
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { icon: LayoutDashboard, label: "Overview", target: "overview" },
  { icon: BriefcaseBusiness, label: "Outreach drafts", target: "drafts" },
  { icon: FolderOpen, label: "Workspace files", target: "workspace" },
  { icon: ShieldCheck, label: "Safety controls", target: "safety" },
];
const SIDEBAR_WIDTH_KEY = "antigravity-workspace-sidebar-width";
const DEFAULT_WIDTH = 278;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(() => Number(localStorage.getItem(SIDEBAR_WIDTH_KEY)) || DEFAULT_WIDTH);
  const { loading, user } = useAuth();
  useEffect(() => localStorage.setItem(SIDEBAR_WIDTH_KEY, String(sidebarWidth)), [sidebarWidth]);

  if (loading) return <div className="min-h-screen bg-[#07120f]" />;
  if (!user) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#07120f] px-5 text-white">
        <section className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#10221c] p-9 shadow-2xl shadow-black/30">
          <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400 text-[#07120f]"><BriefcaseBusiness size={23} /></div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">Private workspace</p>
          <h1 className="text-3xl font-semibold tracking-tight">Antigravity Pharma</h1>
          <p className="mt-4 leading-7 text-white/65">This workspace is reserved for Balaji Rajput. Sign in to access protected job-search reports, drafts, and safety controls.</p>
          <Button onClick={() => startLogin()} className="mt-8 h-11 w-full bg-emerald-400 font-semibold text-[#07120f] hover:bg-emerald-300">Sign in securely</Button>
        </section>
      </main>
    );
  }
  return <SidebarProvider style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}><DashboardShell setSidebarWidth={setSidebarWidth}>{children}</DashboardShell></SidebarProvider>;
}

function DashboardShell({ children, setSidebarWidth }: { children: React.ReactNode; setSidebarWidth: (value: number) => void }) {
  const { user, logout } = useAuth();
  const { state, toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();
  const [resizing, setResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const move = (event: MouseEvent) => {
      if (!resizing) return;
      const left = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const next = event.clientX - left;
      if (next >= 220 && next <= 360) setSidebarWidth(next);
    };
    const up = () => setResizing(false);
    window.addEventListener("mousemove", move); window.addEventListener("mouseup", up);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
  }, [resizing, setSidebarWidth]);
  const jumpTo = (target: string) => document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar collapsible="icon" className="border-r border-white/5 bg-[#081812] text-white">
          <SidebarHeader className="h-[92px] justify-center border-b border-white/5 px-3">
            <div className="flex items-center gap-3">
              <button onClick={toggleSidebar} aria-label="Toggle navigation" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/5 text-emerald-300 transition hover:bg-white/10"><PanelLeft size={17} /></button>
              {state !== "collapsed" && <div className="min-w-0"><p className="truncate text-sm font-bold tracking-tight">Antigravity</p><p className="truncate text-xs text-emerald-300/70">Pharma workspace</p></div>}
            </div>
          </SidebarHeader>
          <SidebarContent className="px-2 py-5">
            <SidebarMenu>
              {menuItems.map(item => <SidebarMenuItem key={item.target}><SidebarMenuButton onClick={() => jumpTo(item.target)} tooltip={item.label} className="h-11 rounded-xl text-white/65 hover:bg-white/8 hover:text-white"><item.icon size={17} /><span>{item.label}</span></SidebarMenuButton></SidebarMenuItem>)}
            </SidebarMenu>
            {state !== "collapsed" && <div className="mx-2 mt-auto rounded-2xl border border-emerald-300/10 bg-emerald-300/5 p-4"><div className="flex items-center gap-2 text-xs font-semibold text-emerald-200"><CalendarClock size={14} /> Daily schedule</div><p className="mt-2 text-xs leading-5 text-white/55">10:00 AM IST<br />Review required before outreach.</p></div>}
          </SidebarContent>
          <SidebarFooter className="border-t border-white/5 p-3">
            <div className="flex items-center gap-3 rounded-xl px-1 py-2 group-data-[collapsible=icon]:justify-center">
              <Avatar className="h-9 w-9 border border-emerald-300/20"><AvatarFallback className="bg-emerald-300 text-xs font-bold text-[#07120f]">{user?.name?.slice(0, 1).toUpperCase() || "B"}</AvatarFallback></Avatar>
              {state !== "collapsed" && <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{user?.name || "Balaji Rajput"}</p><p className="truncate text-xs text-white/45">Owner-only access</p></div>}
              {state !== "collapsed" && <button onClick={logout} aria-label="Sign out" className="rounded-lg p-2 text-white/45 hover:bg-white/10 hover:text-white"><LogOut size={16} /></button>}
            </div>
          </SidebarFooter>
        </Sidebar>
        {state !== "collapsed" && <button aria-label="Resize sidebar" className="absolute right-0 top-0 z-50 h-full w-1 cursor-col-resize hover:bg-emerald-300/30" onMouseDown={() => setResizing(true)} />}
      </div>
      <SidebarInset className="bg-[#f6f8f5]">
        {isMobile && <header className="sticky top-0 z-30 flex h-16 items-center border-b border-black/5 bg-[#f6f8f5]/90 px-4 backdrop-blur"><SidebarTrigger className="mr-3" /><span className="font-semibold text-[#10221c]">Antigravity Pharma</span></header>}
        <main className="min-h-screen p-4 sm:p-7 lg:p-9">{children}</main>
      </SidebarInset>
    </>
  );
}
