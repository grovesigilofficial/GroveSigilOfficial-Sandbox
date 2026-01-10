import { supabase } from "./supabaseClient.js";

/* ===== CONFIG ===== */
const PIN = "0432"; // hard-set so unlock WORKS, no setup required

/* DOM */
const lockBtn = document.getElementById("lockBtn");
const controls = document.getElementById("controls");
const statusEl = document.getElementById("status");
const hoursEl = document.getElementById("hours");
const countdownEl = document.getElementById("countdown");
const awakeBtn = document.getElementById("awakeBtn");
const saveBtn = document.getElementById("saveBtn");
const notesEl = document.getElementById("notes");
const showAvgBtn = document.getElementById("showAvgBtn");
const avgPanel = document.getElementById("avgPanel");

/* State */
let counterRow = null;
let unlocked = false;
let startTime = localStorage.getItem("ubermanStart");

/* Load or create row */
async function loadCounter() {
  const { data } = await supabase
    .from("uberman_counters")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (!data) {
    const { data: created } = await supabase
      .from("uberman_counters")
      .insert({ day: 0, current_awake_hours: 0 })
      .select()
      .single();

    counterRow = created;
  } else {
    counterRow = data;
  }

  render();
}

/* Render */
function render() {
  hoursEl.textContent = `Awake: ${counterRow.current_awake_hours}h`;
}

/* Unlock */
lockBtn.onclick = () => {
  const input = prompt("Enter PIN");

  if (input === PIN) {
    unlocked = true;
    controls.classList.remove("hidden");
    statusEl.textContent = "Status: Unlocked";
    lockBtn.textContent = "Unlocked";
  } else {
    alert("Wrong PIN");
  }
};

/* Increment awake */
awakeBtn.onclick = async () => {
  if (!unlocked) return;

  counterRow.current_awake_hours += 1;

  await supabase
    .from("uberman_counters")
    .update({
      current_awake_hours: counterRow.current_awake_hours,
      last_update: new Date().toISOString()
    })
    .eq("id", counterRow.id);

  render();
};

/* Average display */
showAvgBtn.onclick = () => {
  avgPanel.classList.toggle("hidden");
  avgPanel.textContent =
    `Current average awake: ${counterRow.current_awake_hours}h`;
};

/* Notes */
saveBtn.onclick = () => {
  localStorage.setItem("ubermanNotes", notesEl.value);
  alert("Notes saved");
};

/* Countdown */
function updateCountdown() {
  if (!startTime) {
    countdownEl.textContent = "Countdown: not set";
    return;
  }

  const diff = new Date(startTime) - new Date();

  if (diff <= 0) {
    countdownEl.textContent = "Uberman Active";
    return;
  }

  const h = Math.floor(diff / 36e5);
  const m = Math.floor((diff % 36e5) / 6e4);
  const s = Math.floor((diff % 6e4) / 1000);

  countdownEl.textContent = `Countdown: ${h}:${m}:${s}`;
}

setInterval(updateCountdown, 1000);

/* Init */
notesEl.value = localStorage.getItem("ubermanNotes") || "";
loadCounter();
