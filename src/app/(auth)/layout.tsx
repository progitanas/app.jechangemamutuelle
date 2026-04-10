export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 px-4 py-10">
      <div className="absolute -top-24 -left-16 h-80 w-80 rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-sky-200/40 blur-3xl" />
      <div className="relative w-full">{children}</div>
    </div>
  );
}
