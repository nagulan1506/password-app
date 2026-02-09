const express = require('express');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();

const { connectMongo } = require('./db');
const authRoutes = require('./routes/auth');

const app = express();

const ALLOWED_ORIGINS = [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173', 'https://password-app-adkb.onrender.com'];
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

const MongoStore = require('connect-mongo').default || require('connect-mongo');

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'change_this_secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/password_app',
      ttl: 24 * 60 * 60 // 1 day
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Must be 'none' for cross-site cookie if frontend/backend are on different domains (Netlify vs Render)
      secure: process.env.NODE_ENV === 'production' // Must be true for sameSite: 'none'
    }
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

const path = require('path');

// Serve static files from the client/dist directory
app.use(express.static(path.join(__dirname, 'client/dist')));

// Handle React routing, return all requests to React app
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
});

// app.use((req, res) => {
//   res.status(404).json({ error: 'Not Found' });
// });


app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
