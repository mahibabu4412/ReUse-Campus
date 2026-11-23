"use client";

import { useActionState, useEffect } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProfile, type ProfileState } from "@/actions/profile";

const initial: ProfileState = {};

export type ProfileValues = {
  full_name: string; student_id?: string; college: string; department: string; semester: string | null;
  phone: string | null; contact_preferences: string; bio: string | null;
};

export function ProfileForm({ student }: { student: ProfileValues }) {
  const [state, action, pending] = useActionState(updateProfile, initial);
  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) toast.success(state.success);
  }, [state]);

  return (
    <form action={action} className="space-y-5">
      <div><Label htmlFor="picture">Profile picture</Label>
        <Input id="picture" name="profile_picture" type="file" accept="image/*" className="mt-1.5" />
        <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, GIF or WEBP · max 5 MB</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><Label htmlFor="full_name">Full name</Label><Input id="full_name" name="full_name" required minLength={3} defaultValue={student.full_name} className="mt-1.5" /></div>
        <div><Label htmlFor="student_id">Student ID</Label><Input id="student_id" value={student.student_id ?? ""} readOnly disabled className="mt-1.5" /></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><Label htmlFor="college">College</Label><Input id="college" name="college" required defaultValue={student.college} className="mt-1.5" /></div>
        <div><Label htmlFor="department">Department</Label><Input id="department" name="department" required defaultValue={student.department} className="mt-1.5" /></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><Label htmlFor="semester">Semester</Label>
          <select id="semester" name="semester" defaultValue={student.semester ?? ""} className="mt-1.5 w-full rounded-xl border bg-background px-3 py-2.5 text-sm">
            <option value="">Select</option>{["1st","2nd","3rd","4th","5th","6th","7th","8th"].map((s) => <option key={s} value={`${s} Semester`}>{s} Semester</option>)}
          </select>
        </div>
        <div><Label htmlFor="phone">Phone</Label><Input id="phone" name="phone" defaultValue={student.phone ?? ""} className="mt-1.5" /></div>
      </div>
      <div><Label htmlFor="contact_preferences">Contact preference</Label>
        <select id="contact_preferences" name="contact_preferences" defaultValue={student.contact_preferences} className="mt-1.5 w-full rounded-xl border bg-background px-3 py-2.5 text-sm">
          <option value="email">Email</option><option value="phone">Phone</option><option value="both">Both</option>
        </select>
      </div>
      <div><Label htmlFor="bio">Short bio</Label><Textarea id="bio" name="bio" maxLength={500} defaultValue={student.bio ?? ""} className="mt-1.5 min-h-24" /></div>
      <Button type="submit" disabled={pending}><Check className="size-4" /> {pending ? "Saving..." : "Save changes"}</Button>
    </form>
  );
}
