lockBtn.onclick = () => {
  const pin = prompt("Enter PIN");
  if (pin === window.NEXT_PUBLIC_UBERMAN_PIN) {  // <--- use env variable
    unlocked = true;
    controls.classList.remove("hidden");
    statusEl.textContent = "Status: Unlocked";
    lockBtn.textContent = "Locked";
  } else {
    alert("Wrong PIN");
  }
};
