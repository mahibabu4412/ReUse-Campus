import Link from "next/link";
import { BadgeCheck, Mail, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileForm } from "@/components/profile-form";
import { resendVerification } from "@/actions/profile";
import { requireStudent } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { imageUrl, initials } from "@/lib/format";

export const metadata = { title: "Profile settings" };

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ verified?: string; verify?: string }> }) {
  const student = await requireStudent();
  const params = await searchParams;
  const counts = await prisma.listings.count({ where: { user_id: student.id } });
  const exchanges = await prisma.exchange_history.count({ where: { OR: [{ requester_id: student.id }, { owner_id: student.id }] } });
  const needsProfile = student.student_id.startsWith("GOOGLE-") || !student.college || !student.department;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border bg-card p-6 shadow-sm">
        <Avatar className="size-20 rounded-2xl"><AvatarImage src={imageUrl(student.profile_picture)} alt="" /><AvatarFallback className="text-xl">{initials(student.full_name)}</AvatarFallback></Avatar>
        <div><h1 className="text-xl font-semibold">{student.full_name}</h1><p className="text-sm text-muted-foreground">{student.department} · {student.semester || "Semester not set"}</p>
          <div className="mt-2 flex flex-wrap gap-2">{student.email_verified ? <Badge className="bg-emerald-100 text-emerald-700"><BadgeCheck className="mr-1 size-3" /> Email verified</Badge> : <Badge className="bg-amber-100 text-amber-700">Email not verified</Badge>}<Badge className="bg-emerald-100 text-emerald-700">Active student</Badge></div>
        </div>
      </div>

      {params.verified === "1" && <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">Your email has been verified.</p>}
      {params.verify === "1" && <p className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm text-primary">A new verification link was generated. Check the server log in demo mode.</p>}
      {needsProfile && <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Complete your student profile below — add your real student ID, college and department.</p>}

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="mb-5 text-base font-semibold">Personal information</h2>
          <ProfileForm student={{ ...student, student_id: student.student_id, college: student.college ?? "", department: student.department ?? "", contact_preferences: student.contact_preferences ?? "email" }} />
        </div>
        <div className="space-y-5">
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold"><ShieldCheck className="size-4 text-primary" /> Privacy &amp; security</h2>
            <p className="mb-4 text-xs leading-5 text-muted-foreground">Your student ID, email, phone and profile details are never shown on public listing pages. Other students only see your display name.</p>
            {!student.email_verified && <form action={resendVerification}><button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl border py-2 text-xs font-medium hover:bg-accent"><Mail className="size-3.5" /> Generate verification link</button></form>}
            <Link href="/forgot-password" className="mt-2 block rounded-xl border py-2 text-center text-xs font-medium hover:bg-accent">Change password</Link>
          </div>
          <div className="rounded-2xl border bg-card p-5 text-sm shadow-sm">
            <h2 className="mb-3 text-sm font-semibold">Account activity</h2>
            <p className="py-1 text-muted-foreground">Member since: <b className="text-foreground">{student.created_at.toLocaleDateString()}</b></p>
            <p className="py-1 text-muted-foreground">Total listings: <b className="text-foreground">{counts}</b></p>
            <p className="py-1 text-muted-foreground">Completed exchanges: <b className="text-foreground">{exchanges}</b></p>
          </div>
        </div>
      </div>
    </div>
  );
}
