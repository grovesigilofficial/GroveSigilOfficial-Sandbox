// 🕒 Starter Uberman Counter
// -------------------------------------------------
// This file is loaded by index.html when needed
// Tracks the Uberman counter and can be expanded later
// -------------------------------------------------

// Initialize Uberman counter
let ubermanCounter = 0; // starts at 0

function incrementCounter() {
  ubermanCounter++;
  console.log("Uberman counter:", ubermanCounter);
}

// Temporary test trigger
document.addEventListener("DOMContentLoaded", () => {
  console.log("Uberman JS loaded!");
  incrementCounter();
});
