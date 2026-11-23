"use client";

import { useActionState, useEffect } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sendContact, type FormState } from "@/actions/misc";

const initial: FormState = {};

export function ContactForm({ defaultName = "", defaultEmail = "" }: { defaultName?: string; defaultEmail?: string }) {
  const [state, action, pending] = useActionState(sendContact, initial);
  useEffect(() => {
    if (state.success) toast.success(state.success);
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><Label htmlFor="name">Your name</Label><Input id="name" name="name" required maxLength={120} defaultValue={defaultName} className="mt-1.5" /></div>
        <div><Label htmlFor="email">Email address</Label><Input id="email" name="email" type="email" required maxLength={190} defaultValue={defaultEmail} className="mt-1.5" /></div>
      </div>
      <div><Label htmlFor="subject">Subject</Label>
        <select id="subject" name="subject" required className="mt-1.5 w-full rounded-xl border bg-background px-3 py-2.5 text-sm">
          <option value="">Choose a topic</option><option>General question</option><option>Account help</option>
          <option>Listing issue</option><option>Report a problem</option><option>Partnership</option>
        </select>
      </div>
      <div><Label htmlFor="message">Message</Label><Textarea id="message" name="message" required minLength={10} maxLength={2000} placeholder="Tell us how we can help..." className="mt-1.5 min-h-32" /></div>
      <Button type="submit" disabled={pending}><Send className="size-4" /> {pending ? "Sending..." : "Send message"}</Button>
    </form>
  );
}
