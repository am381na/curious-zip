import fs from "node:fs";
import path from "node:path";
import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";

let App: any = null; // try top-level App
let Root: any = null, Home: any = null, Search: any = null, Results: any = null; // fallback route components

async function loadComponents() {
  try { const mod = await import(path.resolve("src/App.tsx")); App = mod.default || mod.App || null; } catch {}
  try {
    const r = await import(path.resolve("src/routes/Root.tsx"));
    const h = await import(path.resolve("src/routes/Home.tsx"));
    const s = await import(path.resolve("src/routes/Search.tsx"));
    const res = await import(path.resolve("src/routes/Results.tsx"));
    Root = r?.default || null; Home = h?.default || null; Search = s?.default || null; Results = res?.default || null;
  } catch {}
}

function renderForRoute(route: string): string {
  const template = fs.readFileSync(path.resolve("dist/index.html"), "utf8");
  let markup = "";
  if (App) {
    markup = renderToString(<StaticRouter location={route}><App /></StaticRouter>);
  } else if (Root && Home && Search && Results) {
    const RouteComponent = route.startsWith("/results") ? Results : route === "/search" ? Search : Home;
    markup = renderToString(<div><Root /><div id="__ssg-route">{React.createElement(RouteComponent)}</div></div>);
  } else {
    throw new Error("Could not find App or route components to render.");
  }
  return template.replace('<div id="root"></div>', `<div id="root">${markup}</div>`);
}

function outFileForRoute(route: string) {
  if (route === "/") return path.resolve("dist/index.html");
  const clean = route.replace(/^\//, "");            // e.g. results/JFK-LAX/2026-01-10
  const dir = path.resolve("dist", clean);           // dist/results/JFK-LAX/2026-01-10
  fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, "index.html");
}

async function run() {
  await loadComponents();
  const routes = JSON.parse(fs.readFileSync(path.resolve("scripts/routes-to-prerender.json"), "utf8")) as string[];
  for (const route of routes) {
    const html = renderForRoute(route);
    const outfile = outFileForRoute(route);
    fs.writeFileSync(outfile, html, "utf8");
    console.log("✔ prerendered", route, "→", outfile);
  }
}

run().catch(e => { console.error(e); process.exit(1); });
