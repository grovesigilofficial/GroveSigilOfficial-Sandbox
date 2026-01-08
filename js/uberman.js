// FILE: js/uberman.js
import { supabase } from "./supabaseClient.js";

const DAY_EL = document.getElementById("day");
const HOURS_EL = document.getElementById("hours");
const COUNTDOWN_EL = document.getElementById("countdown");
const NOTES_EL = document.getElementById("notes");

const LOCK_BTN = document.getElementById("lockBtn");
const CONTROLS = document.getElementById("controls");
const SETTINGS = document.getElementById("settings");
const INCREMENT_BTN = document.getElementById("incrementBtn");
const SAVE_BTN = document.getElementById("saveBtn");
const RESET_BTN = document.getElementById("resetBtn");
const BACK_BTN = document.getElementById("backBtn");
const START_INPUT = document.getElementById("startTime");
const START_BTN = document.getElementById("startBtn");
const AVG_BTN = document.getElementById("avgBtn");
const AVG_MODAL = document.getElementById("avgModal");
const AVG_TEXT = document.getElementById("avgText");
const CLOSE_AVG = document.querySelector(".close");

let counterId = null;
let startTime = null;
let unlocked = false;

// Average person stats
const AVG_SLEEP_HOURS_PER_DAY = 8;
const AVG_AWAKE_HOURS_PER_DAY = 16;
const AVG_WEEK = AVG_SLEEP_HOURS_PER_DAY*7;
const AVG_MONTH = AVG_SLEEP_HOURS_PER_DAY*30;
const AVG_YEAR = AVG_SLEEP_HOURS_PER_DAY*365;
const LIFE_YEARS = 80;

// ------------------- LOCK -------------------
LOCK_BTN.addEventListener("click", ()=>{
  unlocked = !unlocked;
  CONTROLS.style.display = unlocked?"flex":"none";
  SETTINGS.style.display = unlocked?"flex":"none";
  LOCK_BTN.textContent = unlocked?"Lock Settings":"Unlock Settings";
});

// ------------------- MODAL -------------------
AVG_BTN.onclick = ()=>{ AVG_MODAL.style.display="block"; }
CLOSE_AVG.onclick = ()=>{ AVG_MODAL.style.display="none"; }
window.onclick = e=>{ if(e.target===AVG_MODAL) AVG_MODAL.style.display="none"; }

// ------------------- BACK -------------------
BACK_BTN.onclick = ()=>{ window.history.back(); }

// ------------------- LOAD COUNTER -------------------
async function loadCounter(){
  const { data, error } = await supabase
    .from("uberman_counters")
    .select("*")
    .limit(1)
    .maybeSingle();
  if(error){ console.error("Load error:",error); return; }

  if(!data){
    const { data: created, error: createError } = await supabase
      .from("uberman_counters")
      .insert({ day:0, current_awake_hours:0 })
      .select()
      .single();
    if(createError){ console.error("Create error:",createError); return; }
    counterId = created.id;
    render(created);
  }else{
    counterId = data.id;
    render(data);
  }

  startTime = new Date(data.last_update || Date.now());
  startCountdown();
  updateNotes(data);
}

// ------------------- INCREMENT -------------------
INCREMENT_BTN.onclick = async ()=>{
  if(!counterId) return;
  const { data, error } = await supabase
    .from("uberman_counters")
    .select("current_awake_hours, day")
    .eq("id",counterId)
    .single();
  if(error){ console.error("Read error:",error); return; }
  const updatedHours = Number(data.current_awake_hours||0)+1;
  const { error: updateError } = await supabase
    .from("uberman_counters")
    .update({ current_awake_hours: updatedHours, last_update: new Date().toISOString() })
    .eq("id",counterId);
  if(updateError){ console.error("Update error:",updateError); return; }
  render({ ...data, current_awake_hours: updatedHours });
  updateNotes({ ...data, current_awake_hours: updatedHours });
}

// ------------------- SAVE -------------------
SAVE_BTN.onclick = async ()=>{
  if(!counterId) return;
  const { error } = await supabase
    .from("uberman_counters")
    .update({ last_update:new Date().toISOString() })
    .eq("id",counterId);
  if(error){ console.error("Save error:",error); alert("Save failed"); return; }
  alert("Counter saved!");
}

// ------------------- RESET -------------------
RESET_BTN.onclick = async ()=>{
  if(!counterId) return;
  const { error } = await supabase
    .from("uberman_counters")
    .update({ day:0, current_awake_hours:0, last_update:new Date().toISOString() })
    .eq("id",counterId);
  if(error){ console.error("Reset error:",error); alert("Reset failed"); return; }
  render({ day:0, current_awake_hours:0 });
  updateNotes({ day:0, current_awake_hours:0 });
}

// ------------------- SET START TIME -------------------
START_BTN.onclick = ()=>{
  const val = START_INPUT.value;
  if(!val) return;
  startTime = new Date(val);
  startCountdown();
}

// ------------------- COUNTDOWN -------------------
function startCountdown(){
  if(!startTime) return;
  const interval = setInterval(()=>{
    const now = new Date();
    const diff = startTime - now;
    if(diff<=0){ COUNTDOWN_EL.textContent="Countdown: 00:00:00"; clearInterval(interval); return; }
    const h = String(Math.floor(diff/3600000)).padStart(2,'0');
    const m = String(Math.floor((diff%3600000)/60000)).padStart(2,'0');
    const s = String(Math.floor((diff%60000)/1000)).padStart(2,'0');
    COUNTDOWN_EL.textContent=`Countdown: ${h}:${m}:${s}`;
  },1000);
}

// ------------------- NOTES -------------------
function updateNotes(data){
  const awake = data.current_awake_hours||0;
  const asleep = data.day*24-awake;
  NOTES_EL.innerHTML = `
    Compared to an average person: Awake ${AVG_AWAKE_HOURS_PER_DAY*data.day||0}h, Sleep ${AVG_SLEEP_HOURS_PER_DAY*data.day||0}h.
    Total awake: ${awake}h, total asleep: ${asleep}h.
    Over week/month/year/lifespan: ${AVG_WEEK}h / ${AVG_MONTH}h / ${AVG_YEAR}h / ${AVG_YEAR*LIFE_YEARS}h.
  `;
}

// ------------------- RENDER -------------------
function render(row){
  if(DAY_EL) DAY_EL.textContent=`Day ${row.day||0}`;
  if(HOURS_EL) HOURS_EL.textContent=`Awake: ${row.current_awake_hours||0}h / Asleep: ${(row.day||0)*24-(row.current_awake_hours||0)}h`;
  updateNotes(row);
}

// INIT
document.addEventListener("DOMContentLoaded", loadCounter);
