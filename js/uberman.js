// js/uberman.js
import { supabase } from "./supabaseClient.js";

const DAY_EL = document.getElementById("day");
const HOURS_AWAKE_EL = document.getElementById("hours-awake");
const HOURS_SLEEP_EL = document.getElementById("hours-sleep");
const COUNTDOWN_EL = document.getElementById("countdown");

const avgModal = document.getElementById("avgModal");
const avgNotes = document.getElementById("avgNotes");
avgModal.querySelector(".close")?.addEventListener("click",()=>avgModal.style.display="none");

let counterId = null;
let startTime = null;

// Constants for averages
const AVG_AWAKE_HOURS_PER_DAY = 16;
const AVG_SLEEP_HOURS_PER_DAY = 8;

// Load or create counter
async function loadCounter() {
  const { data, error } = await supabase
    .from("uberman_counters")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) return console.error("Load error:", error);

  if (!data) {
    const { data: created, error: createError } = await supabase
      .from("uberman_counters")
      .insert({ day: 0, current_awake_hours: 0, total_sleep_hours:0, start_time: new Date().toISOString() })
      .select()
      .single();
    if (createError) return console.error("Create error:", createError);
    counterId = created.id;
    startTime = new Date(created.start_time);
    render(created);
  } else {
    counterId = data.id;
    startTime = new Date(data.start_time);
    render(data);
  }

  startCountdown();
}

// Increment awake hour
export async function incrementHour() {
  if (!counterId) return;
  const { data, error } = await supabase
    .from("uberman_counters")
    .select("*")
    .eq("id", counterId)
    .single();
  if (error) return console.error(error);

  const newAwake = Number(data.current_awake_hours || 0)+1;

  await supabase
    .from("uberman_counters")
    .update({ current_awake_hours: newAwake, last_update: new Date().toISOString() })
    .eq("id", counterId);

  render({ ...data, current_awake_hours: newAwake });
}

// Log sleep hour
export async function logSleep() {
  if (!counterId) return;
  const { data, error } = await supabase
    .from("uberman_counters")
    .select("*")
    .eq("id", counterId)
    .single();
  if (error) return console.error(error);

  const newSleep = Number(data.total_sleep_hours || 0)+1;

  await supabase
    .from("uberman_counters")
    .update({ total_sleep_hours: newSleep, last_update: new Date().toISOString() })
    .eq("id", counterId);

  render({ ...data, total_sleep_hours: newSleep });
}

// Reset counter
export async function resetCounter() {
  if (!counterId) return;
  const { error } = await supabase
    .from("uberman_counters")
    .update({ day:0, current_awake_hours:0, total_sleep_hours:0, start_time: new Date().toISOString() })
    .eq("id", counterId);
  if (error) return console.error(error);
  render({ day:0, current_awake_hours:0, total_sleep_hours:0, start_time:new Date() });
  alert("Counter reset and saved!");
}

// Render UI
function render(row) {
  if (DAY_EL) DAY_EL.textContent = `Day ${row.day ?? 0}`;
  if (HOURS_AWAKE_EL) HOURS_AWAKE_EL.textContent = `${row.current_awake_hours ?? 0} hours`;
  if (HOURS_SLEEP_EL) HOURS_SLEEP_EL.textContent = `${row.total_sleep_hours ?? 0} hours`;
}

// Countdown logic
function startCountdown() {
  function update() {
    const now = new Date();
    const diff = startTime - now;
    if (diff <= 0) {
      COUNTDOWN_EL.textContent = "Started!";
      return clearInterval(timer);
    }
    const h = Math.floor(diff/1000/3600);
    const m = Math.floor((diff/1000%3600)/60);
    const s = Math.floor(diff/1000%60);
    COUNTDOWN_EL.textContent = `${h}h ${m}m ${s}s`;
  }
  update();
  const timer = setInterval(update,1000);
}

// Show average sleep comparison
window.showAverage = ()=>{
  const totalAwake = 16*7; // example: 16 hours/day * 7 days
  const totalSleep = 8*7;  // 8 hours/day * 7 days
  const lifespanYears = 80;
  avgNotes.textContent = `Average person per week:
Awake: ${totalAwake}h
Sleep: ${totalSleep}h
Per month: ${totalAwake*4}h awake, ${totalSleep*4}h sleep
Per year: ${totalAwake*52}h awake, ${totalSleep*52}h sleep
Over a lifespan (~${lifespanYears}y):
Awake: ${totalAwake*52*lifespanYears}h
Sleep: ${totalSleep*52*lifespanYears}h
\nCompare this to your Uberman schedule!`;
  avgModal.style.display="block";
};

// Init
document.addEventListener("DOMContentLoaded", loadCounter);
window.incrementHour = incrementHour;
window.logSleep = logSleep;
window.resetCounter = resetCounter;
