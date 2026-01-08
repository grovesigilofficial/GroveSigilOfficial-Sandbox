import { supabase } from "./supabaseClient.js";

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

let counterId = null;
let counterData = null;
let countdownInterval = null;

// --- Load Counter ---
async function loadCounter() {
  const { data, error } = await supabase.from("uberman_counters").select("*").limit(1).maybeSingle();
  if (error) { console.error(error); return; }

  if (!data) {
    const { data: created, error: createError } = await supabase
      .from("uberman_counters")
      .insert({ day:0, current_awake_hours:0, total_sleep_hours:0 })
      .select().single();
    if (createError) { console.error(createError); return; }
    counterId = created.id; counterData = created;
  } else { counterId = data.id; counterData = data; }

  render();
  startCountdown();
}

// --- Render ---
function render() {
  DAY_EL.textContent = `Day ${counterData.day ?? 0}`;
  HOURS_EL.textContent = `Awake: ${counterData.current_awake_hours ?? 0}h / Asleep: ${counterData.total_sleep_hours ?? 0}h`;
  NOTES_EL.textContent = `Compared to average person: ~56h/week, ~240h/month, ~2920h/year, lifespan ~25,900 days.`;
}

// --- Increment ---
async function incrementHour() {
  if (!counterId) return;
  counterData.current_awake_hours = (counterData.current_awake_hours||0) + 1;
  counterData.total_sleep_hours = (counterData.total_sleep_hours||0) + 0; // Adjust sleep if needed
  const { error } = await supabase.from("uberman_counters").update(counterData).eq("id", counterId);
  if (error) { console.error(error); return; }
  render();
}

// --- Save / Reset ---
async function saveCounter() {
  if (!counterId) return;
  const { error } = await supabase.from("uberman_counters").update(counterData).eq("id", counterId);
  if (error) { console.error(error); return; }
  alert("Saved!");
}

async function resetCounter() {
  if (!counterId) return;
  counterData.day = 0; counterData.current_awake_hours = 0; counterData.total_sleep_hours = 0;
  const { error } = await supabase.from("uberman_counters").update(counterData).eq("id", counterId);
  if (error) { console.error(error); return; }
  render();
}

// --- Countdown ---
function startCountdown() {
  let startTime = counterData.start_time ? new Date(counterData.start_time) : new Date();
  clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    const diff = startTime - new Date();
    if (diff <=0) { COUNTDOWN_EL.textContent="Uberman Started!"; clearInterval(countdownInterval); return; }
    const h = String(Math.floor(diff/3600000)).padStart(2,"0");
    const m = String(Math.floor((diff%3600000)/60000)).padStart(2,"0");
    const s = String(Math.floor((diff%60000)/1000)).padStart(2,"0");
    COUNTDOWN_EL.textContent = `Countdown: ${h}:${m}:${s}`;
  },1000);
}

// --- Lock / PIN ---
UNLOCK_BTN.addEventListener("click", ()=>{
  const PIN = process.env.NEXT_PUBLIC_UBERMAN_PIN;
  if(PIN_INPUT.value===PIN){
    LOCK_SECTION.style.display="none";
    CONTROLS.style.display="flex";
    SETTINGS.style.display="flex";
  } else alert("Incorrect PIN");
});

// --- Buttons ---
INCREMENT_BTN.addEventListener("click", incrementHour);
SAVE_BTN.addEventListener("click", saveCounter);
RESET_BTN.addEventListener("click", resetCounter);
BACK_BTN.addEventListener("click", ()=>window.history.back());

AVG_BTN.addEventListener("click", ()=>AVG_MODAL.style.display="block");
CLOSE_AVG.addEventListener("click", ()=>AVG_MODAL.style.display="none");
window.addEventListener("click",(e)=>{if(e.target===AVG_MODAL) AVG_MODAL.style.display="none";});

document.addEventListener("DOMContentLoaded", loadCounter);
