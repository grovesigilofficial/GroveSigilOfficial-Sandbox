// FILE: js/uberman.js
import { supabase } from "./supabaseClient.js";

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

let counterId = null;
let interval = null;
let locked = true;

// ---------------- LOAD ----------------
async function loadCounter(){
  const { data, error } = await supabase
    .from("uberman_counters")
    .select("*")
    .limit(1)
    .maybeSingle();
  if(error) return console.error(error);

  if(!data){
    const { data: created, error:createErr } = await supabase
      .from("uberman_counters")
      .insert({
        day:0,
        current_awake_hours:0,
        current_sleep_hours:0,
        start_time: new Date().toISOString(),
        notes:''
      })
      .select().single();
    if(createErr) return console.error(createErr);
    counterId = created.id;
    render(created);
  } else {
    counterId = data.id;
    render(data);
  }
  startAutoUpdate();
}

// ---------------- RENDER ----------------
function render(row){
  DAY_EL.textContent = `Day ${row.day ?? 0}`;
  HOURS_EL.textContent = `Awake: ${row.current_awake_hours ?? 0}h / Asleep: ${row.current_sleep_hours ?? 0}h`;
  NOTES_EL.textContent = row.notes || '';
  if(START_INPUT && row.start_time) START_INPUT.value = new Date(row.start_time).toISOString().slice(0,16);
}

// ---------------- COUNTDOWN ----------------
function updateCountdown(startTime){
  const start = new Date(startTime);
  const now = new Date();
  let diff = Math.max(0,start-now);
  if(diff<=0){
    COUNTDOWN_EL.textContent="Counter started!";
    return;
  }
  const hrs = String(Math.floor(diff/(1000*60*60))).padStart(2,'0');
  const mins = String(Math.floor(diff/60000%60)).padStart(2,'0');
  const secs = String(Math.floor(diff/1000%60)).padStart(2,'0');
  COUNTDOWN_EL.textContent=`Countdown: ${hrs}:${mins}:${secs}`;
}

// ---------------- AUTO UPDATE ----------------
function startAutoUpdate(){
  if(!counterId) return;
  clearInterval(interval);
  interval = setInterval(async ()=>{
    const { data, error } = await supabase
      .from("uberman_counters")
      .select("*")
      .eq("id",counterId)
      .single();
    if(error) return console.error(error);

    const startTime = new Date(data.start_time);
    const now = new Date();
    if(now<startTime){updateCountdown(startTime);return;}

    // For now simple 1h increment every minute for demo
    const newAwake = data.current_awake_hours + 0;
    const newSleep = data.current_sleep_hours + 0;

    render({...data,current_awake_hours:newAwake,current_sleep_hours:newSleep});
    updateCountdown(startTime);
  },60000);
}

// ---------------- BUTTONS ----------------
lockBtn.onclick = ()=>{
  locked = !locked;
  controls.style.display = locked?"none":"flex";
  settings.style.display = locked?"none":"flex";
  lockBtn.textContent = locked?"Unlock Settings":"Lock Settings";
};

// Increment awake
incrementBtn.onclick = async ()=>{
  const { data, error } = await supabase.from("uberman_counters").select("*").eq("id",counterId).single();
  if(error) return console.error(error);
  const updatedHours = (data.current_awake_hours||0)+1;
  const { error:updateErr } = await supabase.from("uberman_counters").update({current_awake_hours:updatedHours,last_update:new Date().toISOString()}).eq("id",counterId);
  if(updateErr) return console.error(updateErr);
  render({...data,current_awake_hours:updatedHours});
};

// Save
saveBtn.onclick = async ()=>{
  const { error } = await supabase.from("uberman_counters").update({last_update:new Date().toISOString()}).eq("id",counterId);
  if(error) return console.error(error);
  alert("Counter saved!");
};

// Reset
resetBtn.onclick = async ()=>{
  const { error } = await supabase.from("uberman_counters").update({current_awake_hours:0,current_sleep_hours:0,day:0,last_update:new Date().toISOString()}).eq("id",counterId);
  if(error) return console.error(error);
  render({current_awake_hours:0,current_sleep_hours:0,day:0});
};

// Set start time
startBtn.onclick = async ()=>{
  if(locked) return;
  const start = START_INPUT.value?new Date(START_INPUT.value):new Date();
  const { error } = await supabase.from("uberman_counters").update({start_time:start.toISOString(),current_awake_hours:0,current_sleep_hours:0,day:0}).eq("id",counterId);
  if(error) return console.error(error);
  render({current_awake_hours:0,current_sleep_hours:0,day:0,start_time:start});
};

// Back
backBtn.onclick = ()=>window.history.back();

// ---------------- AVG MODAL ----------------
avgBtn.onclick=()=>modal.style.display="block";
closeModal.onclick=()=>modal.style.display="none";

// ---------------- INIT ----------------
document.addEventListener("DOMContentLoaded",loadCounter);
