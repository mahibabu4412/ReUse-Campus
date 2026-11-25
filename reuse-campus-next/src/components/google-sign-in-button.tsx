import { googleSignInAction } from "@/actions/auth";

export function GoogleSignInButton({
  label = "Continue with Google",
}: {
  label?: string;
}) {
  return (
    <form action={googleSignInAction}>
      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2.5 rounded-xl border bg-background py-2.5 text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M21.6 12.227c0-.709-.064-1.39-.182-2.045H12v3.868h5.382a4.6 4.6 0 0 1-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.351z"
          />
          <path
            fill="#34A853"
            d="M12 22c2.7 0 4.964-.895 6.618-2.422l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.598-4.124H3.06v2.59A9.996 9.996 0 0 0 12 22z"
          />
          <path
            fill="#FBBC05"
            d="M6.402 13.9A6.01 6.01 0 0 1 6.09 12c0-.66.113-1.302.312-1.9V7.51H3.06A9.996 9.996 0 0 0 2 12c0 1.614.386 3.14 1.06 4.49l3.342-2.59z"
          />
          <path
            fill="#EA4335"
            d="M12 5.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C16.96 2.99 14.695 2 12 2A9.996 9.996 0 0 0 3.06 7.51l3.342 2.59C7.19 7.736 9.395 5.977 12 5.977z"
          />
        </svg>
        {label}
      </button>
    </form>
  );
}
