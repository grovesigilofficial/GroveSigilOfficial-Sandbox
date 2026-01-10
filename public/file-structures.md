# File Structures

## 1️⃣ Current Needs (Uberman counter only)
your-project/
├─ public/
│  ├─ index.html
│  ├─ uberman.html
│  └─ js/
│     └─ uberman.js
├─ server.js
└─ .env

# Notes:
# - PIN stays private in .env
# - uberman.js handles countdown, awake increment, notes
# - server.js handles PIN check


## 2️⃣ Full Social Media Platform (future-ready)
your-project/
├─ public/
│  ├─ index.html
│  ├─ uberman.html
│  ├─ profile.html
│  ├─ feed.html
│  ├─ settings.html
│  └─ js/
│     ├─ uberman.js
│     ├─ feed.js
│     ├─ profile.js
│     └─ supabaseClient.js
├─ server.js
├─ package.json
├─ .env
├─ api/                # serverless endpoints
│  ├─ unlock.js
│  ├─ saveNote.js
│  ├─ feed.js
│  └─ profile.js
└─ components/         # reusable UI components
   ├─ header.html
   ├─ footer.html
   └─ modal.html
