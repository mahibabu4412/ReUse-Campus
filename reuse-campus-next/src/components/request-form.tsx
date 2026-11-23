"use client";

import { useActionState, useEffect } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createRequest, type RequestState } from "@/actions/requests";

const initial: RequestState = {};

export function RequestForm({ listingId, needsReturnDate }: { listingId: number; needsReturnDate: boolean }) {
  const [state, action, pending] = useActionState<RequestState, FormData>(createRequest, initial);
  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) toast.success(state.success);
  }, [state]);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="listing_id" value={listingId} />
      <div><Label htmlFor="message">Message to the owner</Label>
        <Textarea id="message" name="message" required minLength={10} maxLength={1000} className="mt-1.5 min-h-32" placeholder="Introduce yourself and explain why you need this item..." />
        <p className="mt-1 text-xs text-muted-foreground">Be polite and specific — it helps owners respond faster.</p>
      </div>
      {needsReturnDate && (
        <div><Label htmlFor="expected_return_date">Expected return date</Label>
          <input id="expected_return_date" name="expected_return_date" type="date" required min={new Date(Date.now() + 86400000).toISOString().slice(0, 10)} className="mt-1.5 w-full rounded-xl border bg-background px-3 py-2.5 text-sm" />
        </div>
      )}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">Your student ID and private contact details are never shared. Arrange handover details after your request is accepted.</div>
      <Button type="submit" disabled={pending}><Send className="size-4" /> {pending ? "Sending..." : "Send request"}</Button>
    </form>
  );
}
