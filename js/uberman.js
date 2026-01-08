// FILE: js/uberman.js
import { supabase } from "./supabaseClient.js";

// DOM Elements
const DAY_EL = document.getElementById("day");
const HOURS_EL = document.getElementById("hours");
const NOTES_EL = document.getElementById("notes");
const COUNTDOWN_EL = document.getElementById("countdown");

const CONTROLS = document.getElementById("controls");
const SETTINGS = document.getElementById("settings");
const LOCK_SECTION = document.getElementById("lockSection");
const PIN_INPUT = document.getElementById("pinInput");
const UNLOCK_BTN = document.getElementById("unlockBtn");

const INCREMENT_BTN = document.getElementById("incrementBtn");
const SAVE_BTN = document.getElementById("saveBtn");
const RESET_BTN = document.getElementById("resetBtn");
const BACK_BTN = document.getElementById("backBtn");

const AVG_BTN = document.getElementById("avgBtn");
const AVG_MODAL = document.getElementById("avgModal");
const CLOSE_AVG = document.querySelector(".close");
const AVG_TEXT = document.getElementById("avgText");

// Uberman counter state
let counterId = null;
let counterData = null;
let startTime = null;

// --- Load / Init ---
async function loadCounter() {
  const { data, error } = await supabase
    .from("uberman_counters")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Load error:", error);
    return;
  }

  if (!data) {
    const { data: created, error: createError } = await supabase
      .from("uberman_counters")
      .insert({ day: 0, current_awake_hours: 0 })
      .select()
      .single();

    if (createError) { console.error(createError); return; }
    counterId = created.id; counterData = created;
  } else {
    counterId = data.id; counterData = data;
  }

  render();
  startCountdown();
}

// --- Render ---
function render() {
  DAY_EL.textContent = `Day ${counterData.day ?? 0}`;
  HOURS_EL.textContent = `Awake: ${counterData.current_awake_hours ?? 0}h / Asleep: ${counterData.day*8 ?? 0}h`;
  NOTES_EL.textContent = `Compared to average person sleep per week: ~56h, per month: ~240h, per year: ~2920h.`;
}

// --- Increment ---
async function incrementHour() {
  if (!counterId) return;

  const updatedHours = (counterData.current_awake_hours ?? 0) + 1;
  const { error } = await supabase
    .from("uberman_counters")
    .update({ current_awake_hours: updatedHours, last_update: new Date().toISOString() })
    .eq("id", counterId);

  if (error) { console.error(error); return; }
  counterData.current_awake_hours = updatedHours;
  render();
}

// --- Save / Reset ---
async function saveCounter() {
  if (!counterId) return;
  const { error } = await supabase
    .from("uberman_counters")
    .update({ ...counterData })
    .eq("id", counterId);
  if (error) { console.error(error); return; }
  alert("Saved!");
}

async function resetCounter() {
  if (!counterId) return;
  const { error } = await supabase
    .from("uberman_counters")
    .update({ day:0, current_awake_hours:0, last_update:new Date().toISOString() })
    .eq("id", counterId);
  if (error) { console.error(error); return; }
  counterData.day = 0;
  counterData.current_awake_hours = 0;
  render();
}

// --- Countdown ---
function startCountdown() {
  if (!startTime) startTime = new Date(); // default now
  const interval = setInterval(() => {
    const now = new Date();
    const diff = startTime - now;
    if (diff <= 0) { COUNTDOWN_EL.textContent = "Uberman Started!"; clearInterval(interval); return; }
    const h = String(Math.floor(diff / 3600000)).padStart(2,"0");
    const m = String(Math.floor((diff % 3600000)/60000)).padStart(2,"0");
    const s = String(Math.floor((diff % 60000)/1000)).padStart(2,"0");
    COUNTDOWN_EL.textContent = `Countdown: ${h}:${m}:${s}`;
  },1000);
}

// --- Lock ---
UNLOCK_BTN.addEventListener("click", () => {
  const PIN = process.env.NEXT_PUBLIC_UBERMAN_PIN;
  if (PIN_INPUT.value === PIN) {
    LOCK_SECTION.style.display = "none";
    CONTROLS.style.display = "flex";
    SETTINGS.style.display = "flex";
  } else alert("Incorrect PIN");
});

// --- Buttons ---
INCREMENT_BTN.addEventListener("click", incrementHour);
SAVE_BTN.addEventListener("click", saveCounter);
RESET_BTN.addEventListener("click", resetCounter);
BACK_BTN.addEventListener("click", ()=>window.history.back());

AVG_BTN.addEventListener("click", ()=>AVG_MODAL.style.display="block");
CLOSE_AVG.addEventListener("click", ()=>AVG_MODAL.style.display="none");
window.addEventListener("click",(e)=>{if(e.target===AVG_MODAL)AVG_MODAL.style.display="none";});

// Init
document.addEventListener("DOMContentLoaded", loadCounter);
