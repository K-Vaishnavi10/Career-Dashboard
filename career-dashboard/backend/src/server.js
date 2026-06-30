require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const passport = require('./config/passport');
const { requireAuth } = require('./middleware/auth.middleware');
const { connectMongo } = require('./db/mongo');

const authRoutes = require('./routes/auth.routes');
const resumeRoutes = require('./routes/resume.routes');
const jdRoutes = require('./routes/jdMatch.routes');
const githubRoutes = require('./routes/github.routes');
const linkedinRoutes = require('./routes/linkedin.routes');
const codingRoutes = require('./routes/coding.routes');
const overallRoutes = require('./routes/overall.routes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'career-dashboard-backend' }));

app.use('/api/auth', authRoutes);

// All analyzer routes require a logged-in user
app.use('/api/resume', requireAuth, resumeRoutes);
app.use('/api/jd-match', requireAuth, jdRoutes);
app.use('/api/github', requireAuth, githubRoutes);
app.use('/api/linkedin', requireAuth, linkedinRoutes);
app.use('/api/coding', requireAuth, codingRoutes);
app.use('/api/overall', requireAuth, overallRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Career Dashboard backend running on http://localhost:${PORT}`);
});

connectMongo().catch((err) => {
  console.error('[mongo] Failed to connect to MongoDB:', err.message);
  console.error('[mongo] Auth endpoints (login) will not work until MONGODB_URI is set correctly in backend/.env');
});
