// server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Server-side PIN unlock
app.post('/unlock', (req, res) => {
  const { pin } = req.body;
  const correctPin = process.env.NEXT_PUBLIC_UBERMAN_PIN;

  if (pin === correctPin) {
    return res.json({ unlocked: true });
  } else {
    return res.status(401).json({ unlocked: false });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
