// Deploy as a Supabase Edge Function named "publish-site".
// Required server-side secrets: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, ALLOWED_ADMIN_EMAIL.
// Configure Supabase Google OAuth and verify the user's email here before publishing.
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") ?? "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing authorization" }, 401);
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return json({ error: "Not authenticated" }, 401);
    const allowedEmail = Deno.env.get("ALLOWED_ADMIN_EMAIL")?.toLowerCase();
    if (!allowedEmail || user.email?.toLowerCase() !== allowedEmail) return json({ error: "Not authorized to publish" }, 403);

    const token = Deno.env.get("GITHUB_TOKEN");
    const owner = Deno.env.get("GITHUB_OWNER");
    const repo = Deno.env.get("GITHUB_REPO");
    if (!token || !owner || !repo) return json({ error: "Server publishing secrets are not configured" }, 500);

    const body = await req.json();
    if (!body?.content || typeof body.content !== "object") return json({ error: "Missing content object" }, 400);
    const path = "data/site.json";
    const api = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const headers = { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "Content-Type": "application/json" };
    const existing = await fetch(api, { headers });
    let sha: string | undefined;
    if (existing.ok) { const current = await existing.json(); sha = current.sha; }
    else if (existing.status !== 404) return json({ error: "Could not inspect repository content" }, 502);
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(body.content, null, 2) + "\n")));
    const update = await fetch(api, { method: "PUT", headers, body: JSON.stringify({ message: "Update personal website content", content: encoded, ...(sha ? { sha } : {}), branch: "main" }) });
    if (!update.ok) return json({ error: "GitHub rejected the update", details: await update.text() }, 502);
    return json({ message: "Content saved to GitHub. GitHub Pages will publish the update after its build completes." });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unexpected server error" }, 500);
  }
});