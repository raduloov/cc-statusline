#!/usr/bin/env bash
set -euo pipefail

input=$(cat)
j() { echo "$input" | jq -r "$1 // empty" 2>/dev/null; }

name=$(j '.model.display_name')
pct=$(j '.context_window.remaining_percentage')
cost=$(j '.cost.total_cost_usd')
rl_5h=$(j '.rate_limits.five_hour.used_percentage')
rl_7d=$(j '.rate_limits.seven_day.used_percentage')

RST=$'\033[0m' GREEN=$'\033[32m' YELLOW=$'\033[33m' RED=$'\033[31m' MAG=$'\033[95m'

ctx_color() {
  local p=${1%.*}
  if (( p > 30 )); then echo "$GREEN"
  elif (( p > 10 )); then echo "$YELLOW"
  else echo "$RED"; fi
}

rl_color() {
  local p=${1%.*}
  if (( p >= 80 )); then echo "$RED"
  elif (( p >= 50 )); then echo "$YELLOW"
  else echo "$GREEN"; fi
}

out="🤖 ${MAG}${name:-Unknown}${RST} | 🧠 $(ctx_color "${pct:-100}")${pct:-100}%${RST}"

if [[ -n "$cost" ]] && (( $(echo "$cost > 0" | bc -l) )); then
  out+=" | 💰 \$$(printf '%.2f' "$cost")"
fi

rl_parts=""
if [[ -n "$rl_5h" ]]; then
  rl_parts+="5h $(rl_color "$rl_5h")${rl_5h%.*}%${RST}"
fi
if [[ -n "$rl_7d" ]]; then
  [[ -n "$rl_parts" ]] && rl_parts+=" "
  rl_parts+="7d $(rl_color "$rl_7d")${rl_7d%.*}%${RST}"
fi
[[ -n "$rl_parts" ]] && out+=" | ⚡ ${rl_parts}"

echo -e "$out"
