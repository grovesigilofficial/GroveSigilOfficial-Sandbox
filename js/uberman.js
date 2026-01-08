// FILE: js/uberman.js
import { supabase } from "./supabaseClient.js";

const countdownEl = document.getElementById("countdown");
const dayEl = document.getElementById("day");
const hoursAwakeEl = document.getElementById("hours-awake");
const hoursSleepEl = document.getElementById("hours-sleep");
const comparisonEl = document.getElementById("comparison");
const startInput = document.getElementById("startTime");
const setStartBtn = document.getElementById("setStartBtn");
const toggleAwakeBtn = document.getElementById("toggleAwakeBtn");

let counterId = null;
let awake = true;

// --- Utility ---
function formatHMS(ms) {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${h}h ${m}m ${s}s`;
}

// --- Load or Create Counter ---
async function loadCounter() {
  const { data, error } = await supabase
    .from("uberman_counters")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) { console.error("Load error:", error); return; }

  if (!data) {
    const { data: created, error: createError } = await supabase
      .from("uberman_counters")
      .insert({ day:0, current_awake_hours:0, last_update: new Date().toISOString() })
      .select()
      .single();
    if (createError) { console.error("Create error:", createError); return; }
    counterId = created.id;
    render(created);
  } else {
    counterId = data.id;
    render(data);
  }

  startTicker();
}

// --- Set / Restart Start Time ---
async function setStartTime() {
  if (!startInput.value) return alert("Pick a start time!");
  const startDate = new Date(startInput.value);
  const { error } = await supabase
    .from("uberman_counters")
    .update({ start_time: startDate.toISOString(), last_update: new Date().toISOString(), day:0, current_awake_hours:0, current_sleep_hours:0 })
    .eq("id", counterId);
  if (error) { console.error(error); return; }
  render({ day:0, current_awake_hours:0, current_sleep_hours:0 });
}

// --- Toggle Awake / Sleep ---
async function toggleAwake() {
  awake = !awake;
  toggleAwakeBtn.textContent = awake ? "Switch to Sleep" : "Switch to Awake";
}

// --- Ticker for hours / countdown ---
function startTicker() {
  setInterval(async () => {
    if (!counterId) return;

    const now = new Date();
    const { data, error } = await supabase
      .from("uberman_counters")
      .select("*")
      .eq("id", counterId)
      .single();
    if (error) { console.error(error); return; }

    const startTime = data.start_time ? new Date(data.start_time) : now;
    const elapsed = now - startTime;

    // Countdown until start
    const countdownMs = startTime - now;
    countdownEl.textContent = countdownMs > 0 ? formatHMS(countdownMs) : "Started";

    // Only count after start
    if (elapsed > 0) {
      const lastUpdate = data.last_update ? new Date(data.last_update) : startTime;
      const deltaHrs = (now - lastUpdate) / 1000 / 3600;

      const updated = {};
      if (awake) {
        updated.current_awake_hours = (data.current_awake_hours || 0) + deltaHrs;
      } else {
        updated.current_sleep_hours = (data.current_sleep_hours || 0) + deltaHrs;
      }
      updated.last_update = now.toISOString();
      updated.day = Math.floor(elapsed / (24*3600*1000));

      await supabase.from("uberman_counters").update(updated).eq("id", counterId);
      render({ ...data, ...updated });
    }
  }, 1000);
}

// --- Render ---
function render(row) {
  dayEl.textContent = row.day ?? 0;
  hoursAwakeEl.textContent = `${(row.current_awake_hours ?? 0).toFixed(2)} hours awake`;
  hoursSleepEl.textContent = `${(row.current_sleep_hours ?? 0).toFixed(2)} hours asleep`;
  comparisonEl.textContent = `Your schedule is ${(row.current_awake_hours ?? 0) > 16 ? "more extreme" : "lighter"} than an average person’s awake/sleep hours.`;
}

// --- Init ---
setStartBtn.onclick = setStartTime;
toggleAwakeBtn.onclick = toggleAwake;
document.addEventListener("DOMContentLoaded", loadCounter);
