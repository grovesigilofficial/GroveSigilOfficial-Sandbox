// FILE: js/uberman.js
import { supabase } from "./supabaseClient.js";

const DAY_EL = document.getElementById("day");
const HOURS_EL = document.getElementById("hours");
const INCREMENT_BTN = document.getElementById("incrementBtn");

let counterId = null;

// Load or create the counter row
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

    if (createError) {
      console.error("Create error:", createError);
      return;
    }

    counterId = created.id;
    render(created);
  } else {
    counterId = data.id;
    render(data);
  }
}

// Increment awake hours
async function incrementHour() {
  if (!counterId) return;

  const { data, error } = await supabase
    .from("uberman_counters")
    .select("current_awake_hours, day")
    .eq("id", counterId)
    .single();

  if (error) {
    console.error("Read error:", error);
    return;
  }

  let updatedHours = Number(data.current_awake_hours || 0) + 1;
  let updatedDay = data.day;

  // Auto-increment day every 24 hours
  if (updatedHours >= 24) {
    updatedHours -= 24;
    updatedDay += 1;
  }

  const { error: updateError } = await supabase
    .from("uberman_counters")
    .update({ current_awake_hours: updatedHours, day: updatedDay, last_update: new Date().toISOString() })
    .eq("id", counterId);

  if (updateError) {
    console.error("Update error:", updateError);
    return;
  }

  render({ ...data, current_awake_hours: updatedHours, day: updatedDay });
}

// Render UI
function render(row) {
  if (DAY_EL) DAY_EL.textContent = `Day: ${row.day ?? 0}`;
  if (HOURS_EL) HOURS_EL.textContent = `Hours Awake: ${row.current_awake_hours ?? 0}`;
}

// Init
INCREMENT_BTN?.addEventListener("click", incrementHour);
document.addEventListener("DOMContentLoaded", loadCounter);
