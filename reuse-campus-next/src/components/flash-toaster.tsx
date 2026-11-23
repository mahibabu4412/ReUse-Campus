"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

/** Shows success/error messages passed via query string after a redirect. */
export function FlashToaster() {
  const pathname = usePathname();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");
    const error = params.get("error");
    if (success) toast.success(success);
    if (error) toast.error(error);
    if (success || error) {
      params.delete("success");
      params.delete("error");
      const query = params.toString();
      window.history.replaceState(null, "", query ? `${pathname}?${query}` : pathname);
    }
  }, [pathname]);
  return null;
}
