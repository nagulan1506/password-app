const express = require('express');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();

const { connectMongo } = require('./db');
const authRoutes = require('./routes/auth');

const app = express();

const ALLOWED_ORIGINS = [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
// app.options('*', cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'change_this_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24, sameSite: 'none', secure: false }
  })
);

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/', authRoutes);

const PORT = process.env.PORT || 3000;
connectMongo(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/password_app')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
