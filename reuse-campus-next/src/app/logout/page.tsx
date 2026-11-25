import Link from "next/link";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/actions/auth";

export const metadata = { title: "Log out" };

export default function LogoutPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 py-16 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
        <LogOut className="size-6" />
      </span>
      <h1 className="mt-5 text-2xl font-bold">Log out?</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        You will need to sign in again to manage your listings and requests.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <form action={logoutAction}>
          <Button type="submit">Yes, log out</Button>
        </form>
        <Button asChild variant="outline">
          <Link href="/">Cancel</Link>
        </Button>
      </div>
    </div>
  );
}
