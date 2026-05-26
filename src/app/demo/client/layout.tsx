import DemoClientSidebar from "./DemoClientSidebar";

export default function DemoClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-brand-50 overflow-hidden">
      <DemoClientSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-brand-100 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <p className="text-sm font-semibold text-brand-600">Acme Corp</p>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-brand-900">Jean Dupont</p>
              <p className="text-xs text-brand-400">Client</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-semibold">
              JD
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
