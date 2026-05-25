export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside className="w-64 bg-slate-900 text-white p-6 font-semibold">Radar PropTech</aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
