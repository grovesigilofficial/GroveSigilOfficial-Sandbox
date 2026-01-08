// FILE: js/uberman.js
// Purpose: Handle Uberman Sleep Counter frontend interactions

import { supabase } from "./supabaseClient.js";

// Load the current counter for logged-in user
export async function loadCounter() {
    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) return;

        const { data, error } = await supabase
            .from("uberman_counters")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle(); // ❌ Use maybeSingle to avoid single object errors

        if (error) throw error;

        // If no counter exists yet, create one
        if (!data) {
            await supabase.from("uberman_counters").insert({
                user_id: user.id,
                day: 0,
                current_awake_hours: 0
            });
            return loadCounter(); // reload after creation
        }

        document.getElementById("dayCount").innerText = data.day;
        document.getElementById("hoursAwake").innerText = data.current_awake_hours;

    } catch (err) {
        console.error("Load counter error:", err);
    }
}

// Increment awake hours
export async function incrementHours(hours = 0.5) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from("uberman_counters")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();
        if (error) throw error;

        if (!data) return;

        const newHours = parseFloat(data.current_awake_hours) + hours;
        const newDay = newHours >= 24 ? data.day + 1 : data.day;

        await supabase
            .from("uberman_counters")
            .update({
                current_awake_hours: newHours % 24,
                day: newDay,
                last_update: new Date().toISOString()
            })
            .eq("id", data.id);

        loadCounter(); // refresh UI
    } catch (err) {
        console.error("Increment error:", err);
    }
}

// Expose globally
window.loadCounter = loadCounter;
window.incrementHours = incrementHours;

// Auto-load on page load
window.addEventListener("DOMContentLoaded", loadCounter);
