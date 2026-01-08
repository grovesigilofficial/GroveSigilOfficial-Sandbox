// FILE: js/uberman.js
import { supabase } from "./supabaseClient.js";

const DAY_EL = document.getElementById("day");
const HOURS_EL = document.getElementById("hours");
const COUNTDOWN_EL = document.getElementById("countdown");
const NOTES_EL = document.getElementById("notes");

let counterId = null;
let interval = null;

// Average person sleep constants
const AVG_SLEEP_HOURS_DAY = 8;
const AVG_SLEEP_HOURS_WEEK = 56;
const AVG_SLEEP_HOURS_MONTH = 240;
const AVG_SLEEP_HOURS_YEAR = 2920;
const AVG_LIFESPAN_YEARS = 80;

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
      .insert({ day: 0, current_awake_hours: 0, current_sleep_hours: 0, start_time: new Date().toISOString() })
      .select()
      .single();
    if (createError) return console.error("Create error:", createError);
    counterId = created.id;
    render(created);
  } else {
    counterId = data.id;
    render(data);
  }

  startAutoUpdate();
}

// Render UI
function render(row) {
  if (DAY_EL) DAY_EL.textContent = `Day ${row.day ?? 0}`;
  if (HOURS_EL) HOURS_EL.textContent = `Awake: ${row.current_awake_hours ?? 0}h / Asleep: ${row.current_sleep_hours ?? 0}h`;
  if (NOTES_EL) NOTES_EL.textContent = row.notes || '';
}

// Countdown timer
function updateCountdown(startTime) {
  const start = new Date(startTime);
  const now = new Date();
  let diff = Math.max(0, start - now);

  if (diff <= 0) {
    COUNTDOWN_EL.textContent = "Counter started!";
    return;
  }

  const hours = String(Math.floor(diff / (1000*60*60))).padStart(2,"0");
  const minutes = String(Math.floor(diff/60000 %60)).padStart(2,"0");
  const seconds = String(Math.floor(diff/1000 %60)).padStart(2,"0");
  COUNTDOWN_EL.textContent = `Countdown: ${hours}:${minutes}:${seconds}`;
}

// Auto increment awake/sleep every hour
function startAutoUpdate() {
  if (!counterId) return;
  interval = setInterval(async () => {
    const { data, error } = await supabase
      .from("uberman_counters")
      .select("*")
      .eq("id", counterId)
      .single();
    if (error) return console.error("Auto update read error:", error);

    const startTime = new Date(data.start_time);
    const now = new Date();
    if (now < startTime) return updateCountdown(startTime);

    // Simple schedule: awake 2h, sleep 2h example (can adjust)
    const awake = Math.floor((now - startTime)/(1000*60*60)) % 4 < 2;
    let newAwake = data.current_awake_hours;
    let newSleep = data.current_sleep_hours;
    if (awake) newAwake += 1;
    else newSleep += 1;

    const day = Math.floor((newAwake + newSleep)/24);

    const { error: updateError } = await supabase
      .from("uberman_counters")
      .update({ current_awake_hours: newAwake, current_sleep_hours: newSleep, day, last_update: new Date().toISOString() })
      .eq("id", counterId);
    if (updateError) return console.error("Auto update write error:", updateError);

    render({ ...data, current_awake_hours: newAwake, current_sleep_hours: newSleep, day });
    updateCountdown(startTime);
  }, 1000 * 60); // every minute for demo
}

// Buttons
document.getElementById("startBtn").onclick = async () => {
  const now = new Date();
  const { error } = await supabase
    .from("uberman_counters")
    .update({ start_time: now.toISOString() })
    .eq("id", counterId);
  if (error) return console.error("Start error:", error);
  render({ current_awake_hours: 0, current_sleep_hours: 0, day:0, start_time: now });
};

document.getElementById("stopBtn").onclick = () => {
  clearInterval(interval);
};

document.getElementById("saveBtn").onclick = async () => {
  const { error } = await supabase
    .from("uberman_counters")
    .update({ last_update: new Date().toISOString() })
    .eq("id", counterId);
  if (error) return console.error("Save error:", error);
  alert("Counter saved!");
};

document.getElementById("resetBtn").onclick = async () => {
  const { error } = await supabase
    .from("uberman_counters")
    .update({ current_awake_hours: 0, current_sleep_hours: 0, day: 0, last_update: new Date().toISOString() })
    .eq("id", counterId);
  if (error) return console.error("Reset error:", error);
  render({ current_awake_hours: 0, current_sleep_hours: 0, day:0 });
};

// Average comparison modal
const modal = document.getElementById("avgModal");
document.getElementById("avgBtn").onclick = () => {
  modal.style.display = "block";
  const totalUAwake = (DAY_EL.textContent.match(/\d+/)||[0])[0]*24 + (HOURS_EL.textContent.match(/\d+/g)||[0,0])[0]*1;
  const text = `
Average person sleeps ~${AVG_SLEEP_HOURS_WEEK}h/week, ${AVG_SLEEP_HOURS_MONTH}h/month, ${AVG_SLEEP_HOURS_YEAR}h/year.
If they live ~${AVG_LIFESPAN_YEARS} years, total sleep ~${AVG_LIFESPAN_YEARS*365*AVG_SLEEP_HOURS_DAY}h.
You've been awake ${totalUAwake}h so far.
  `;
  document.getElementById("avgText").textContent = text;
};
modal.querySelector(".close").onclick = () => modal.style.display="none";

// Init
document.addEventListener("DOMContentLoaded", loadCounter);
