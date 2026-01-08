// FILE: js/uberman.js
import { supabase } from "./supabaseClient.js";

window.incrementHour = incrementHour; // expose function globally

document.addEventListener("DOMContentLoaded", async () => {
  const DAY_EL = document.getElementById("day");
  const HOURS_EL = document.getElementById("hours");

  let counterId = null;

  async function render(row) {
    if (DAY_EL) DAY_EL.textContent = `Day ${row.day ?? 0}`;
    if (HOURS_EL) HOURS_EL.textContent = `${row.current_awake_hours ?? 0} hours awake`;
  }

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
        .insert({ day: 0, current_awake_hours: 0 })
        .select()
        .single();

      if (createError) return console.error("Create error:", createError);

      counterId = created.id;
      render(created);
    } else {
      counterId = data.id;
      render(data);
    }
  }

  async function incrementHour() {
    if (!counterId) return;

    const { data, error } = await supabase
      .from("uberman_counters")
      .select("current_awake_hours, day")
      .eq("id", counterId)
      .single();

    if (error) return console.error("Read error:", error);

    const updatedHours = Number(data.current_awake_hours ?? 0) + 1;

    const { error: updateError } = await supabase
      .from("uberman_counters")
      .update({ current_awake_hours: updatedHours, last_update: new Date().toISOString() })
      .eq("id", counterId);

    if (updateError) return console.error("Update error:", updateError);

    render({ ...data, current_awake_hours: updatedHours });
  }

  // Make incrementHour accessible globally
  window.incrementHour = incrementHour;

  await loadCounter();
});
