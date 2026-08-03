import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

const chooser = readFileSync(
  "src/components/videos/watch-access-chooser.tsx",
  "utf8",
);
const gated = readFileSync("src/components/videos/gated-lock.tsx", "utf8");
const pub = readFileSync(
  "src/components/videos/public-watch-next-steps.tsx",
  "utf8",
);

for (const [name, t] of [
  ["chooser", chooser],
  ["gated", gated],
  ["public", pub],
]) {
  const i = t.indexOf("איך");
  const j = t.indexOf("להמשיך");
  const bad = t.indexOf("משיח");
  console.log(name, {
    hasEikh: i >= 0,
    hasLehamshikh: j >= 0,
    hasMessiahTypo: bad >= 0,
    snippet: i >= 0 ? JSON.stringify(t.slice(i, i + 20)) : null,
  });
}

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const { data, error } = await sb
  .from("site_banners")
  .select("id, title, is_active")
  .eq("slot", "watch_gate");
console.log("db", error?.message || data);
