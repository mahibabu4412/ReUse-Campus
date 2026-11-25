"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Info } from "lucide-react";
import { usePathname } from "next/navigation";

/**
 * The OpenCode Review pane renders the site inside an iframe. Browsers block
 * third-party cookies there, so Auth.js cannot persist the session. Detect that
 * case, tell the user, and make internal links open in a top-level tab where
 * cookies work normally.
 */
export function IframeNotice() {
  const [embedded, setEmbedded] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setEmbedded(window.self !== window.top);
  }, []);

  useEffect(() => {
    if (!embedded) return;
    const patch = () => {
      document.querySelectorAll<HTMLAnchorElement>('a[href^="/"]').forEach((a) => {
        if (!a.target) a.target = "_blank";
      });
    };
    patch();
    const observer = new MutationObserver(patch);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [embedded, pathname]);

  if (!embedded) return null;

  return (
    <div className="sticky top-0 z-[100] flex flex-wrap items-center justify-center gap-3 border-b border-amber-300 bg-amber-100 px-4 py-2 text-center text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
      <Info className="size-4" />
      <span>Preview pane-এ cookie ব্লক থাকে — login session থাকবে না। নতুন ট্যাব-এ খুললে সবকিছু কাজ করবে।</span>
      <button
        type="button"
        onClick={() => window.open(window.location.href, "_blank", "noopener,noreferrer")}
        className="inline-flex items-center gap-1 rounded-md bg-amber-900 px-2.5 py-1 font-semibold text-white hover:bg-amber-800 dark:bg-amber-700"
      >
        <ExternalLink className="size-3.5" /> Open in new tab
      </button>
    </div>
  );
}
