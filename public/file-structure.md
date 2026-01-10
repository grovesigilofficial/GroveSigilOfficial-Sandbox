Portal Project - File Structure

This file documents the current minimal file structure for Portal, including the Uberman counter feature.
It is placed inside the project with the other files for easy reference.

---

PROJECT FILE STRUCTURE

your-project/
├─ public/
│  ├─ file-structure.md   # This file - documents project structure & notes
│  ├─ index.html          # Landing page (Portal)
│  ├─ uberman.html        # Uberman counter page
│  └─ js/
│     └─ uberman.js       # JS logic for counter, notes, unlock
├─ server.js              # Node server handling private PIN for Uberman counter
└─ .env                   # Environment variables (PIN)

---

NOTES - GANG LEVEL

- Website name: **Portal** (clean, minimal, powerful).  
- Uberman counter is a separate feature, fully tracked via JS and server-side PIN.  
- Main color for UI elements: **indigo** (third-eye energy).  
- `.env` holds private secrets: PIN for Uberman counter.  
- `file-structure.md` is intentionally inside `public/` for easy reference, so any developer can see the current working setup.  
- No unnecessary dependencies, no extra frameworks yet. Minimal, clean, deployable.  
- `server.js` only handles PIN unlock; all other features will expand later (social feeds, profiles, notes sync, etc.).  
- Keep all JS inside `/public/js/` for now.  
- Everything is structured for clarity, maintainability, and fast iteration.  

---

REFERENCE

This file itself is part of the structure:

/public/file-structure.md
