📂 Portal Project File Structure

This file documents the minimal and readable file structure for the Portal website. 
It includes every folder and file, along with notes, so anyone can understand it. 
The file is placed inside `/public/` so it stays with the other files.

---

Current Minimal Portal Structure

├─ index.html          # Landing page for Portal
├─ uberman.html        # Uberman tracker page
├─ file-structure.md   # THIS file documenting the structure
└─ js/
   └─ uberman.js       # JS logic for Uberman tracker: PIN unlock, awake hours, notes

├─ server.js           # Node server to handle private PIN unlock
└─ .env                # Environment variables (PIN, other keys in future)

---

Notes:

- **Folder / File Relationships:**  
   - Files in `/js/` are inside the `js` folder.  
   - `server.js` and `.env` live in the root, because they control the backend and environment.  
   - `index.html`, `uberman.html`, and `file-structure.md` are in `/public/` to be accessible in the browser.

- **Naming Conventions:**  
   - HTML files = pages users see.  
   - JS files = scripts controlling the page behavior.  
   - server.js = backend logic.  
   - .env = private variables like PIN.  

- **Color and Style:**  
   - All UI elements will use **indigo (third-eye indigo)** as the main color.  

- **Readability Tips:**  
   - This tree format keeps indentation intact for visual clarity.  
   - Beginner-friendly: you can see exactly which files belong inside which folders.  
   - Developer-friendly: easy to expand into a full social media platform later.

- **Future Expansion:**  
   - You can add more HTML pages, JS files, or folders (like `/api/` for serverless endpoints) and keep the same tree style.
