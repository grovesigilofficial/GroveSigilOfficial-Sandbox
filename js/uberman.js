// FILE: js/uberman.js
import { supabase } from "./supabaseClient.js";

let counterId = null;
let locked = true;
let interval = null;

document.addEventListener("DOMContentLoaded", async () => {
  // Grab elements AFTER DOM is loaded
  const DAY_EL = document.getElementById("day");
  const HOURS_EL = document.getElementById("hours");
  const COUNTDOWN_EL = document.getElementById("countdown");
  const NOTES_EL = document.getElementById("notes");
  const START_INPUT = document.getElementById("startTime");

  const controls = document.getElementById("controls");
  const settings = document.getElementById("settings");
  const lockBtn = document.getElementById("lockBtn");
  const incrementBtn = document.getElementById("incrementBtn");
  const saveBtn = document.getElementById("saveBtn");
  const resetBtn = document.getElementById("resetBtn");
  const startBtn = document.getElementById("startBtn");
  const backBtn = document.getElementById("backBtn");
  const avgBtn = document.getElementById("avgBtn");
  const modal = document.getElementById("avgModal");
  const closeModal = modal.querySelector(".close");

  // ---------------- LOAD COUNTER ----------------
  async function loadCounter() {
    const { data, error } = await supabase
      .from("uberman_counters")
      .select("*")
      .limit(1)
      .maybeSingle();
    if (error) return console.error("Load error:", error);

    if (!data) {
      const { data: created, error: createErr } = await supabase
        .from("uberman_counters")
        .insert({
          day: 0,
          current_awake_hours: 0,
          current_sleep_hours: 0,
          start_time: new Date().toISOString(),
          notes: ""
        })
        .select()
        .single();
      if (createErr) return console.error("Create error:", createErr);
      counterId = created.id;
      render(created);
    } else {
      counterId = data.id;
      render(data);
    }

    startAutoUpdate();
  }

  // ---------------- RENDER ----------------
  function render(row) {
    DAY_EL.textContent = `Day ${row.day ?? 0}`;
    HOURS_EL.textContent = `Awake: ${row.current_awake_hours ?? 0}h / Asleep: ${row.current_sleep_hours ?? 0}h`;
    NOTES_EL.textContent = row.notes || "";
    if (START_INPUT && row.start_time) START_INPUT.value = new Date(row.start_time).toISOString().slice(0,16);
  }

  // ---------------- COUNTDOWN ----------------
  function updateCountdown(startTime) {
    const start = new Date(startTime);
    const now = new Date();
    let diff = Math.max(0, start - now);
    if (diff <= 0) {
      COUNTDOWN_EL.textContent = "Counter started!";
      return;
    }
    const hrs = String(Math.floor(diff/(1000*60*60))).padStart(2,'0');
    const mins = String(Math.floor(diff/60000%60)).padStart(2,'0');
    const secs = String(Math.floor(diff/1000%60)).padStart(2,'0');
    COUNTDOWN_EL.textContent = `Countdown: ${hrs}:${mins}:${secs}`;
  }

  // ---------------- AUTO UPDATE ----------------
  function startAutoUpdate() {
    if (!counterId) return;
    clearInterval(interval);
    interval = setInterval(async () => {
      const { data, error } = await supabase
        .from("uberman_counters")
        .select("*")
        .eq("id", counterId)
        .single();
      if (error) return console.error(error);

      const startTime = new Date(data.start_time);
      const now = new Date();
      if (now < startTime) {
        updateCountdown(startTime);
        return;
      }

      render(data);
      updateCountdown(startTime);
    }, 1000);
  }

  // ---------------- BUTTONS ----------------
  lockBtn.onclick = () => {
    locked = !locked;
    controls.style.display = locked ? "none" : "flex";
    settings.style.display = locked ? "none" : "flex";
    lockBtn.textContent = locked ? "Unlock Settings" : "Lock Settings";
  };

  incrementBtn.onclick = async () => {
    if (!counterId) return;
    const { data, error } = await supabase.from("uberman_counters").select("*").eq("id", counterId).single();
    if (error) return console.error(error);

    const updatedHours = (data.current_awake_hours || 0) + 1;
    const { error: updateErr } = await supabase.from("uberman_counters").update({ current_awake_hours: updatedHours, last_update: new Date().toISOString() }).eq("id", counterId);
    if (updateErr) return console.error(updateErr);
    render({ ...data, current_awake_hours: updatedHours });
  };

  saveBtn.onclick = async () => {
    if (!counterId) return;
    const { error } = await supabase.from("uberman_counters").update({ last_update: new Date().toISOString() }).eq("id", counterId);
    if (error) return console.error(error);
    alert("Counter saved!");
  };

  resetBtn.onclick = async () => {
    if (!counterId) return;
    const { error } = await supabase.from("uberman_counters").update({
      current_awake_hours: 0,
      current_sleep_hours: 0,
      day: 0,
      last_update: new Date().toISOString()
    }).eq("id", counterId);
    if (error) return console.error(error);
    render({ current_awake_hours: 0, current_sleep_hours: 0, day: 0 });
    alert("Counter reset!");
  };

  startBtn.onclick = async () => {
    if (locked) return;
    const start = START_INPUT.value ? new Date(START_INPUT.value) : new Date();
    if (!counterId) return;
    const { error } = await supabase.from("uberman_counters").update({
      start_time: start.toISOString(),
      current_awake_hours: 0,
      current_sleep_hours: 0,
      day: 0
    }).eq("id", counterId);
    if (error) return console.error(error);
    render({ current_awake_hours: 0, current_sleep_hours: 0, day: 0, start_time: start });
    alert("Start time set!");
  };

  backBtn.onclick = () => window.history.back();

  avgBtn.onclick = () => modal.style.display = "block";
  closeModal.onclick = () => modal.style.display = "none";

  // ---------------- INIT ----------------
  loadCounter();
});
