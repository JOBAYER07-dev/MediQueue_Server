const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: ['http://localhost:3000'],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// ── JWT Generate ──
app.post('/jwt', (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.send({ token });
});

app.get('/', (req, res) => {
  res.send('MediQueue Server Running ✅');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
