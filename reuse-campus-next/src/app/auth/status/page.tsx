"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AuthStatusPage() {
  const [data, setData] = useState<{
    cookieEnabled: boolean;
    cookies: string;
    session: string;
    embedded: boolean;
  } | null>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((s) =>
        setData({
          cookieEnabled: navigator.cookieEnabled,
          cookies: document.cookie || "(none visible to JS)",
          session: s ? JSON.stringify(s.user ?? null) : "null",
          embedded: window.self !== window.top,
        })
      );
  }, []);

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-6">
      <h1 className="text-2xl font-bold">Session diagnostics</h1>
      <p className="text-sm text-muted-foreground">
        Login-এর পর এই পেইজে আসুন। নিচের তথ্যগুলো আমাকে পাঠালে সমস্যা ঠিক করে দিতে পারব।
      </p>
      <pre className="overflow-x-auto rounded-xl border bg-card p-4 text-xs">
        {data ? JSON.stringify(data, null, 2) : "Checking…"}
      </pre>
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-800 dark:bg-amber-950/30">
        <b>যদি session = null হয়:</b> আপনার ব্রাউজার cookie ব্লক করছে।
        <ol className="mt-2 list-decimal pl-5">
          <li>এড্রেস বারের 🔒 আইকনে ক্লিক করুন → Cookies and site data → Allow。</li>
          <li>Brave: Shield আইকনে ক্লিক করে এই site-এর জন্য Shield বন্ধ করুন。</li>
          <li>Chrome: Settings → Privacy → Third-party cookies → “Block third-party cookies” বন্ধ করুন。</li>
          <li>কোনো cookie-cleaner extension থাকলে বন্ধ করে Incognito-তে চেষ্টা করুন。</li>
        </ol>
      </div>
      <Link href="/login" className="text-sm font-semibold text-primary hover:underline">← Back to login</Link>
    </div>
  );
}
