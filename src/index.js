// src/index.js

const express = require('express');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const promClient = require('prom-client');
const { initTelemetry } = require('./telemetry');
const todosRouter = require('./routes/todos');
const { logger } = require('./logger');

/** 
 * 1) Initialize OpenTelemetry
 */
initTelemetry();

/** 
 * 2) Prometheus Client: Collect Default System Metrics
 */
promClient.collectDefaultMetrics();

/** 
 * 3) Create HTTP Request Duration Histogram
 */
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method','route','code'],
  buckets: [0.005,0.01,0.05,0.1,0.5,1,2,5]
});

const app = express();

/** 
 * 4) Global Middlewares
 */
app.use(express.json());
app.use(compression());
app.use(rateLimit({ windowMs: 60 * 1000, max: 100 }));

/** 
 * 5) HTTP Instrumentation
 */
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    // Express assigns req.route only after a matching route is found; fallback to req.path if undefined
    const route = req.route?.path || req.path;
    end({ method: req.method, route, code: res.statusCode });
  });
  next();
});

/** 
 * 6) Structured Logging
 */
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    logger.info('http_request', {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: Date.now() - start,
    });
  });
  next();
});

// —————— 7) Health-check ——————
app.get('/health', (_, res) => res.status(200).json({ status: 'ok' }));

// —————— 8) /metrics (prom-client uniquement) ——————
app.get('/metrics', async (req, res) => {
  try {
    const metrics = await promClient.register.metrics();
    res.set('Content-Type', promClient.register.contentType);
    res.end(metrics);
  } catch (err) {
    res.status(500).end(err.message);
  }
});

// —————— 9) Routes ToDo ——————
app.use('/todos', todosRouter);

// —————— 10) Démarrage du serveur ——————
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Todo service listening on port ${PORT}`);
});

module.exports = app;  // pour Jest / Supertest
