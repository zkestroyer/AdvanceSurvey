import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import masterRoutes from './routes/master.routes';
import surveyRoutes from './routes/survey.routes';
import checkinRoutes from './routes/checkin.routes';
import analyticsRoutes from './routes/analytics.routes';
import executiveRoutes from './routes/executive.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Debug logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  
  // Hook into response to log status code
  const originalSend = res.send;
  res.send = function (body) {
    console.log(`[RESPONSE SEND] ${req.originalUrl} -> ${res.statusCode}`);
    if (res.statusCode !== 200 && res.statusCode !== 201) {
      console.log(`[RESPONSE BODY]`, body);
    }
    return originalSend.call(this, body);
  };

  const originalEnd = res.end;
  res.end = function (chunk?: any, encoding?: any, cb?: any) {
    console.log(`[RESPONSE END] ${req.originalUrl} -> ${res.statusCode}`);
    if (res.statusCode !== 200 && res.statusCode !== 201 && chunk) {
      console.log(`[RESPONSE CHUNK]`, chunk.toString());
    }
    return originalEnd.apply(this, arguments as any);
  };
  
  next();
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/master', masterRoutes);
app.use('/api/v1/surveys', surveyRoutes);
app.use('/api/v1/checkin', checkinRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/executive', executiveRoutes);

// Health Check
app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, message: 'Server is running', data: null, errors: null });
});

app.get('/api/v1/proxy-image', async (req, res) => {
  try {
    const url = req.query.url as string;
    if (!url) return res.status(400).send('URL required');
    const axios = require('axios');
    const response = await axios.get(url, { responseType: 'stream' });
    res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
    response.data.pipe(res);
  } catch (err: any) {
    console.error('Proxy Error:', err.message);
    res.status(500).send('Proxy Error');
  }
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[GLOBAL ERROR HANDLER]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Unknown Error',
    errors: [err.type || 'unknown']
  });
});

app.listen(PORT as number, '0.0.0.0', () => {
  console.log(`Backend server running on http://0.0.0.0:${PORT}`);
});
