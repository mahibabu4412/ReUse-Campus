import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/pagination";
import { setUserStatus } from "@/actions/admin";
import { prisma } from "@/lib/prisma";
import { statusTone, STATUS_LABELS } from "@/lib/format";
import type { Prisma } from "@prisma/client";

export const metadata = { title: "Student management" };

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string }> }) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const status = sp.status === "active" || sp.status === "suspended" ? sp.status : "all";
  const page = Number(sp.page) || 1;
  const per = 15;
  const where: Prisma.usersWhereInput = {
    ...(q ? { OR: [{ full_name: { contains: q } }, { email: { contains: q } }, { student_id: { contains: q } }] } : {}),
    ...(status !== "all" ? { status } : {}),
  };
  const [total, rows] = await Promise.all([
    prisma.users.count({ where }),
    prisma.users.findMany({ where, orderBy: { created_at: "desc" }, skip: (page - 1) * per, take: per }),
  ]);

  return (
    <div className="rounded-2xl border bg-card shadow-sm">
      <div className="border-b px-5 py-4"><h1 className="text-lg font-semibold">Students <span className="text-sm font-normal text-muted-foreground">({total})</span></h1><p className="text-xs text-muted-foreground">Manage registered student accounts.</p></div>
      <form action="/admin/users" method="get" className="flex flex-wrap gap-3 border-b p-4">
        <div className="relative min-w-56 flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input name="q" defaultValue={q} placeholder="Search name, email or student ID..." className="w-full rounded-xl border bg-background py-2 pl-9 pr-3 text-sm" /></div>
        <select name="status" defaultValue={status} className="rounded-xl border bg-background px-3 py-2 text-sm"><option value="all">All statuses</option><option value="active">Active</option><option value="suspended">Suspended</option></select>
        <Button type="submit" size="sm">Search</Button>
      </form>
      <div className="overflow-x-auto p-5">
        <table className="w-full text-sm">
          <thead className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="pb-3">Student</th><th className="pb-3">ID</th><th className="pb-3">College / Department</th><th className="pb-3">Verified</th><th className="pb-3">Status</th><th className="pb-3">Joined</th><th className="pb-3">Action</th></tr></thead>
          <tbody className="divide-y">
            {rows.map((u) => (
              <tr key={u.id} className="hover:bg-muted/40">
                <td className="py-3"><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">{u.full_name.charAt(0)}</span><div><p className="font-medium">{u.full_name}</p><p className="text-[11px] text-muted-foreground">{u.email}</p></div></div></td>
                <td className="text-xs text-muted-foreground">{u.student_id}</td>
                <td><p className="text-xs">{u.college}</p><p className="text-[11px] text-muted-foreground">{u.department}</p></td>
                <td>{u.email_verified ? <Badge className="bg-emerald-100 text-emerald-700">Verified</Badge> : <Badge className="bg-amber-100 text-amber-700">Pending</Badge>}</td>
                <td><Badge className={statusTone(u.status)}>{STATUS_LABELS[u.status]}</Badge></td>
                <td className="text-xs text-muted-foreground">{u.created_at.toLocaleDateString()}</td>
                <td><form action={setUserStatus}><input type="hidden" name="id" value={u.id} /><Button type="submit" name="action" value={u.status === "active" ? "suspend_user" : "activate_user"} size="sm" variant={u.status === "active" ? "destructive" : "outline"}>{u.status === "active" ? "Suspend" : "Activate"}</Button></form></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-5 pb-5"><Pagination page={page} pages={Math.max(1, Math.ceil(total / per))} hrefFor={(p) => `/admin/users?page=${p}&q=${encodeURIComponent(q)}&status=${status}`} /></div>
    </div>
  );
}
