// js/uberman.js
import { supabase } from "./supabaseClient.js";

let counterId = null;

// 1️⃣ Ensure ONE counter row exists
async function initCounter() {
  // try to load existing counter
  const { data, error } = await supabase
    .from("uberman_counters")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(error);
    return;
  }

  // if none exists, create it
  if (!data) {
    const { data: newCounter, error: insertError } = await supabase
      .from("uberman_counters")
      .insert({
        day: 0,
        current_awake_hours: 0
      })
      .select()
      .single();

    if (insertError) {
      console.error(insertError);
      return;
    }

    counterId = newCounter.id;
    updateUI(newCounter);
  } else {
    counterId = data.id;
    updateUI(data);
  }
}

// 2️⃣ Update counter
export async function incrementHour() {
  if (!counterId) return;

  const { data, error } = await supabase
    .from("uberman_counters")
    .update({
      current_awake_hours: supabase.sql`current_awake_hours + 1`,
      last_update: new Date()
    })
    .eq("id", counterId)
    .select()
    .single();

  if (error) {
    console.error(error);
    return;
  }

  updateUI(data);
}

// 3️⃣ UI
function updateUI(counter) {
  document.getElementById("day").textContent = counter.day;
  document.getElementById("hours").textContent = counter.current_awake_hours;
}

// boot
window.incrementHour = incrementHour;
window.addEventListener("DOMContentLoaded", initCounter);
