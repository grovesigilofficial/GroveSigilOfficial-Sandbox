// FILE: js/uberman.js
import { supabase } from "./supabaseClient.js";

const DAY_EL = document.getElementById("day");
const HOURS_EL = document.getElementById("hours");
const COUNTDOWN_EL = document.getElementById("countdown");
const NOTES_EL = document.getElementById("notes");
const START_INPUT = document.getElementById("startTime");
const SETTINGS_DIV = document.getElementById("settings");

const incrementBtn = document.getElementById("incrementBtn");
const saveBtn = document.getElementById("saveBtn");
const resetBtn = document.getElementById("resetBtn");
const lockBtn = document.getElementById("lockBtn");
const startBtn = document.getElementById("startBtn");
const backBtn = document.getElementById("backBtn");
const avgBtn = document.getElementById("avgBtn");
const modal = document.getElementById("avgModal");

let counterId = null;
let interval = null;
let locked = true;

// Average sleep constants
const AVG_SLEEP_HOURS_WEEK = 56;
const AVG_SLEEP_HOURS_MONTH = 240;
const AVG_SLEEP_HOURS_YEAR = 2920;
const AVG_LIFESPAN_YEARS = 80;

// ---------------- LOAD COUNTER ----------------
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
      .insert({
        day:0,
        current_awake_hours:0,
        current_sleep_hours:0,
        start_time: new Date().toISOString(),
        notes:''
      })
      .select().single();
    if (createError) return console.error("Create error:", createError);
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
  if (START_INPUT && row.start_time) START_INPUT.value = new Date(row.start_time).toISOString().slice(0,16);
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
      .eq("id", counterId)
      .single();
    if(error) return console.error(error);

    const startTime = new Date(data.start_time);
    const now = new Date();
    if(now<startTime){updateCountdown(startTime);return;}

    // 2h awake / 2h sleep demo loop
    const awake = Math.floor((now-startTime)/(1000*60*60))%4<2;
    let newAwake = data.current_awake_hours;
    let newSleep = data.current_sleep_hours;
    if(awake) newAwake+=1; else newSleep+=1;
    const day = Math.floor((newAwake+newSleep)/24);

    const { error:updateError } = await supabase
      .from("uberman_counters")
      .update({current_awake_hours:newAwake,current_sleep_hours:newSleep,day,last_update:new Date().toISOString()})
      .eq("id",counterId);
    if(updateError) return console.error(updateError);

    render({...data,current_awake_hours:newAwake,current_sleep_hours:newSleep,day});
    updateCountdown(startTime);
  },60000);
}

// ---------------- BUTTONS ----------------
incrementBtn.onclick = async ()=>{
  const { data, error } = await supabase.from("uberman_counters").select("*").eq("id",counterId).single();
  if(error) return console.error(error);
  const updatedHours = (data.current_awake_hours||0)+1;
  const { error:updateError } = await supabase.from("uberman_counters").update({current_awake_hours:updatedHours,last_update:new Date().toISOString()}).eq("id",counterId);
  if(updateError) return console.error(updateError);
  render({...data,current_awake_hours:updatedHours});
};

saveBtn.onclick = async ()=>{
  const { error } = await supabase.from("uberman_counters").update({last_update:new Date().toISOString()}).eq("id",counterId);
  if(error) return console.error(error);
  alert("Counter saved!");
};

resetBtn.onclick = async ()=>{
  const { error } = await supabase.from("uberman_counters").update({current_awake_hours:0,current_sleep_hours:0,day:0,last_update:new Date().toISOString()}).eq("id",counterId);
  if(error) return console.error(error);
  render({current_awake_hours:0,current_sleep_hours:0,day:0});
};

startBtn.onclick = async ()=>{
  if(locked) return;
  const selectedTime = START_INPUT.value?new Date(START_INPUT.value):new Date();
  const { error } = await supabase.from("uberman_counters").update({start_time:selectedTime.toISOString(),current_awake_hours:0,current_sleep_hours:0,day:0}).eq("id",counterId);
  if(error) return console.error(error);
  render({current_awake_hours:0,current_sleep_hours:0,day:0,start_time:selectedTime});
  startAutoUpdate();
};

lockBtn.onclick = ()=>{
  locked=!locked;
  SETTINGS_DIV.style.display=locked?"none":"flex";
  lockBtn.textContent = locked?"Unlock Settings":"Lock Settings";
};

backBtn.onclick = ()=>window.history.back();

// ---------------- AVG MODAL ----------------
avgBtn.onclick=()=>{
  modal.style.display="block";
  const totalUAwake=(DAY_EL.textContent.match(/\d+/)||[0])[0]*24 + (HOURS_EL.textContent.match(/\d+/g)||[0,0])[0]*1;
  const text=`
Average person sleeps ~${AVG_SLEEP_HOURS_WEEK}h/week, ${AVG_SLEEP_HOURS_MONTH}h/month, ${AVG_SLEEP_HOURS_YEAR}h/year.
If they live ~${AVG_LIFESPAN_YEARS} years, total sleep ~${AVG_LIFESPAN_YEARS*365*8}h.
You've been awake ${totalUAwake}h so far.
  `;
  document.getElementById("avgText").textContent=text;
};
modal.querySelector(".close").onclick=()=>modal.style.display="none";

// ---------------- INIT ----------------
document.addEventListener("DOMContentLoaded", loadCounter);
