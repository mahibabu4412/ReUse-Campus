import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-gradient-to-b from-primary/5 to-background px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-6 flex justify-center"><Link href="/" className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg"><img src="/images/logo.svg" alt="ReUse Campus" className="size-7" /></Link></div>
        {children}
        <p className="mt-6 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} ReUse Campus · Student-only platform</p>
      </div>
    </div>
  );
}
