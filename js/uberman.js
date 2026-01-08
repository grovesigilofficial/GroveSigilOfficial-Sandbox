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
const showAvgBtn = document.getElementById("showAvgBtn");
const avgModal = document.getElementById("avgModal");
const avgContent = document.getElementById("avgContent");
const closeModal = document.querySelector(".close");

let counterId = null;
let awake = true;

// --- Constants ---
const AVG_SLEEP_HOURS = 8; // avg hours per night
const AVG_AWAKE_HOURS = 16; // per day
const DAYS_IN_YEAR = 365;

// --- Utility ---
function formatHMS(ms) {
  const totalSec = Math.floor(ms/1000);
  const h = Math.floor(totalSec/3600);
  const m = Math.floor((totalSec%3600)/60);
  const s = totalSec%60;
  return `${h}h ${m}m ${s}s`;
}

// --- Load / Create Counter ---
async function loadCounter() {
  const { data, error } = await supabase
    .from("uberman_counters")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) { console.error(error); return; }

  if (!data) {
    const { data: created, error: createError } = await supabase
      .from("uberman_counters")
      .insert({ day:0, current_awake_hours:0, current_sleep_hours:0, last_update:new Date().toISOString() })
      .select().single();
    if (createError) { console.error(createError); return; }
    counterId = created.id;
    render(created);
  } else {
    counterId = data.id;
    render(data);
  }

  startTicker();
}

// --- Save / Reset Start ---
async function setStartTime() {
  if (!startInput.value) return alert("Pick a start time!");
  const startDate = new Date(startInput.value);
  const { error } = await supabase
    .from("uberman_counters")
    .update({ start_time:startDate.toISOString(), last_update:new Date().toISOString(), day:0, current_awake_hours:0, current_sleep_hours:0 })
    .eq("id", counterId);
  if (error) { console.error(error); alert("Failed to save."); return; }
  alert("Start time saved! Counter reset.");
}

// --- Toggle Awake/Sleep ---
async function toggleAwake() {
  awake = !awake;
  toggleAwakeBtn.textContent = awake ? "Switch to Sleep" : "Switch to Awake";
}

// --- Ticker ---
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

    // Countdown
    const countdownMs = startTime - now;
    countdownEl.textContent = countdownMs>0 ? formatHMS(countdownMs) : "Started";

    if (elapsed>0) {
      const lastUpdate = data.last_update ? new Date(data.last_update) : startTime;
      const deltaHrs = (now - lastUpdate)/1000/3600;

      const updated = {};
      if (awake) updated.current_awake_hours = (data.current_awake_hours||0)+deltaHrs;
      else updated.current_sleep_hours = (data.current_sleep_hours||0)+deltaHrs;
      updated.last_update = now.toISOString();
      updated.day = Math.floor(elapsed/(24*3600*1000));

      await supabase.from("uberman_counters").update(updated).eq("id", counterId);
      render({...data, ...updated});
    }
  }, 1000);
}

// --- Render ---
function render(row) {
  dayEl.textContent = row.day ?? 0;
  hoursAwakeEl.textContent = `${(row.current_awake_hours ?? 0).toFixed(2)} hours awake`;
  hoursSleepEl.textContent = `${(row.current_sleep_hours ?? 0).toFixed(2)} hours asleep`;
  comparisonEl.textContent = `Your schedule is ${(row.current_awake_hours ?? 0) > AVG_AWAKE_HOURS ? "more extreme" : "lighter"} than an average person's ${AVG_AWAKE_HOURS}h/day awake.`;
}

// --- Show Average Sleep Stats Modal ---
function showAverageStats() {
  const weeklyAwake = AVG_AWAKE_HOURS*7;
  const weeklySleep = AVG_SLEEP_HOURS*7;
  const monthlyAwake = AVG_AWAKE_HOURS*30;
  const monthlySleep = AVG_SLEEP_HOURS*30;
  const yearlyAwake = AVG_AWAKE_HOURS*DAYS_IN_YEAR;
  const yearlySleep = AVG_SLEEP_HOURS*DAYS_IN_YEAR;
  const lifespanAwake = yearlyAwake*80/24;
  const lifespanSleep = yearlySleep*80/24;

  avgContent.innerHTML = `
    <h2>Average Person Sleep Stats</h2>
    <p>Per Week: ${weeklyAwake}h awake / ${weeklySleep}h sleep</p>
    <p>Per Month: ${monthlyAwake}h awake / ${monthlySleep}h sleep</p>
    <p>Per Year: ${yearlyAwake}h awake / ${yearlySleep}h sleep</p>
    <p>Lifespan (~80 years): ${lifespanAwake.toFixed(0)}h awake / ${lifespanSleep.toFixed(0)}h sleep</p>
    <p>Compared to Uberman schedule, your awake hours may exceed these significantly.</p>
  `;
  avgModal.style.display="block";
}

// --- Modal Close ---
closeModal.onclick = ()=>avgModal.style.display="none";
window.onclick = (e)=>{if(e.target===avgModal) avgModal.style.display="none";}

// --- Init ---
setStartBtn.onclick = setStartTime;
toggleAwakeBtn.onclick = toggleAwake;
showAvgBtn.onclick = showAverageStats;
document.addEventListener("DOMContentLoaded", loadCounter);
