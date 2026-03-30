#!/usr/bin/env node
"use strict";

const fs = require("fs");

// --- input ---
const input = readJSON(0); // stdin
const model = input.model || {};
const name = `\x1b[95m${String(model.display_name ?? "")}\x1b[0m`.trim();
const ctxWindow = input.context_window || {};
const costData = input.cost || {};

// --- helpers ---
function readJSON(fd) {
  try {
    return JSON.parse(fs.readFileSync(fd, "utf8"));
  } catch {
    return {};
  }
}

// --- context percentage ---
const pctLeft = Number(ctxWindow.remaining_percentage) || 100;
const pctColor = pctLeft > 30 ? "\x1b[32m" : pctLeft > 10 ? "\x1b[33m" : "\x1b[31m";

// --- session cost (from Claude Code) ---
const sessionCost = costData.total_cost_usd ?? 0;
const costStr = sessionCost > 0
  ? ` | 💰 $${sessionCost.toFixed(2)}`
  : "";

// --- rate limits ---
const rl = input.rate_limits || {};
let rlStr = "";
if (rl.five_hour || rl.seven_day) {
  const parts = [];
  if (rl.five_hour?.used_percentage != null) {
    const p = Number(rl.five_hour.used_percentage);
    const c = p >= 80 ? "\x1b[31m" : p >= 50 ? "\x1b[33m" : "\x1b[32m";
    parts.push(`5h ${c}${p.toFixed(0)}%\x1b[0m`);
  }
  if (rl.seven_day?.used_percentage != null) {
    const p = Number(rl.seven_day.used_percentage);
    const c = p >= 80 ? "\x1b[31m" : p >= 50 ? "\x1b[33m" : "\x1b[32m";
    parts.push(`7d ${c}${p.toFixed(0)}%\x1b[0m`);
  }
  rlStr = ` | ⚡ ${parts.join(" ")}`;
}

console.log(`🤖 ${name || "Unknown"} | 🧠 ${pctColor}${pctLeft.toFixed(1)}%\x1b[0m${costStr}${rlStr}`);
