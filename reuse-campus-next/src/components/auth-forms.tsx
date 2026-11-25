"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, registerAction, forgotPasswordAction, resetPasswordAction, type ActionState } from "@/actions/auth";

const initial: ActionState = {};

function useAuthResult(state: ActionState) {
  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) toast.success(state.success);
  }, [state]);
}

export function LoginForm({ fixedRole }: { fixedRole?: "admin" | "student" }) {
  const [state, action, pending] = useActionState(loginAction, initial);
  useAuthResult(state);
  return (
    <form action={action} className="space-y-4">
      {fixedRole ? <input type="hidden" name="role" value={fixedRole} /> : (
        <div><Label htmlFor="role">Sign in as</Label>
          <select id="role" name="role" className="mt-1.5 w-full rounded-xl border bg-background px-3 py-2.5 text-sm" defaultValue="student">
            <option value="student">Student</option><option value="admin">Administrator</option>
          </select>
        </div>
      )}
      <div><Label htmlFor="email">{fixedRole === "admin" ? "Username or email" : "Email or student ID"}</Label><Input id="email" name="email" type="text" required className="mt-1.5" placeholder={fixedRole === "admin" ? "admin" : "you@student.edu or STU-2021-0142"} /></div>
      <div><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" required className="mt-1.5" /></div>
      <div className="flex justify-end text-sm"><Link href="/forgot-password" className="font-medium text-primary hover:underline">Forgot password?</Link></div>
      <Button type="submit" disabled={pending} className="w-full">{pending ? "Signing in..." : "Log in"}</Button>
    </form>
  );
}

export function RegisterForm({
  defaultEmail = "",
  defaultName = "",
}: {
  defaultEmail?: string;
  defaultName?: string;
}) {
  const [state, action, pending] = useActionState(registerAction, initial);
  useAuthResult(state);
  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><Label htmlFor="full_name">Full name</Label><Input id="full_name" name="full_name" required minLength={3} defaultValue={defaultName} className="mt-1.5" /></div>
        <div><Label htmlFor="student_id">Student ID</Label><Input id="student_id" name="student_id" required className="mt-1.5" placeholder="STU-2021-0142" /></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required defaultValue={defaultEmail} className="mt-1.5" /></div>
        <div><Label htmlFor="phone">Phone (optional)</Label><Input id="phone" name="phone" className="mt-1.5" /></div>
      </div>
      <div><Label htmlFor="college">College / Institute</Label><Input id="college" name="college" required className="mt-1.5" /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><Label htmlFor="department">Department</Label><Input id="department" name="department" required className="mt-1.5" /></div>
        <div><Label htmlFor="semester">Semester</Label>
          <select id="semester" name="semester" className="mt-1.5 w-full rounded-xl border bg-background px-3 py-2.5 text-sm">
            <option value="">Select semester</option>{["1st","2nd","3rd","4th","5th","6th","7th","8th"].map((s) => <option key={s} value={`${s} Semester`}>{s} Semester</option>)}
          </select>
        </div>
      </div>
      <div><Label htmlFor="contact_preferences">Contact preference</Label>
        <select id="contact_preferences" name="contact_preferences" defaultValue="email" className="mt-1.5 w-full rounded-xl border bg-background px-3 py-2.5 text-sm">
          <option value="email">Email</option><option value="phone">Phone</option><option value="both">Both</option>
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" required minLength={8} className="mt-1.5" /></div>
        <div><Label htmlFor="confirm_password">Confirm password</Label><Input id="confirm_password" name="confirm_password" type="password" required minLength={8} className="mt-1.5" /></div>
      </div>
      <Button type="submit" disabled={pending} className="w-full">{pending ? "Creating account..." : "Create account"}</Button>
    </form>
  );
}

export function ForgotForm() {
  const [state, action, pending] = useActionState(forgotPasswordAction, initial);
  useAuthResult(state);
  return (
    <form action={action} className="space-y-4">
      <div><Label htmlFor="email">Email address</Label><Input id="email" name="email" type="email" required className="mt-1.5" /></div>
      <Button type="submit" disabled={pending} className="w-full">{pending ? "Generating..." : "Send reset link"}</Button>
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, initial);
  useAuthResult(state);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div><Label htmlFor="password">New password</Label><Input id="password" name="password" type="password" required minLength={8} className="mt-1.5" /></div>
      <div><Label htmlFor="confirm_password">Confirm password</Label><Input id="confirm_password" name="confirm_password" type="password" required minLength={8} className="mt-1.5" /></div>
      <Button type="submit" disabled={pending} className="w-full">{pending ? "Updating..." : "Update password"}</Button>
    </form>
  );
}
