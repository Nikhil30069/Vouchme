import { createRoot } from "react-dom/client";
import "./index.css";

const rootEl = document.getElementById("root")!;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl?.trim() || !supabaseAnon?.trim()) {
  rootEl.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:system-ui,-apple-system,sans-serif;padding:2rem;text-align:center;background:#0f172a;color:#e2e8f0;">
      <div style="max-width:520px;line-height:1.5;">
        <h1 style="font-size:1.35rem;margin:0 0 1rem;font-weight:600;">Supabase env vars missing</h1>
        <p style="margin:0 0 1rem;color:#94a3b8;">
          This app is built with Vite: <code style="background:#1e293b;padding:2px 8px;border-radius:6px;font-size:0.9em;">VITE_SUPABASE_URL</code> and
          <code style="background:#1e293b;padding:2px 8px;border-radius:6px;font-size:0.9em;">VITE_SUPABASE_ANON_KEY</code> must be set
          <strong> before the build</strong> (e.g. Vercel → Project → Settings → Environment Variables → Production), then redeploy.
        </p>
        <p style="margin:0;color:#64748b;font-size:0.9rem;">After deploying, add this site URL under Supabase → Authentication → URL configuration → Redirect URLs.</p>
      </div>
    </div>`;
} else {
  void import("./App.tsx").then(({ default: App }) => {
    createRoot(rootEl).render(<App />);
  });
}
