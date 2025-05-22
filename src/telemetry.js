// src/telemetry.js

const { NodeSDK } = require('@opentelemetry/sdk-node');
const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');
const { logger } = require('./logger');

function initTelemetry() {
  // ---------------------------------------------------------------------------
  // 1) Prometheus Metrics Exporter
  // ---------------------------------------------------------------------------
  // Creates a Prometheus exporter that starts its HTTP server on the specified port.
  const promExporter = new PrometheusExporter(
    { startServer: true, port: Number(process.env.PROMETHEUS_PORT) || 9464 },
    () => logger.info(`✅ Prometheus metrics exposed on port ${process.env.PROMETHEUS_PORT || 9464}`)
  );

  // ---------------------------------------------------------------------------
  // 2) OTLP Trace Exporter
  // ---------------------------------------------------------------------------
  // Configures the OTLP exporter to send trace data to the specified endpoint.
  const traceExporter = new OTLPTraceExporter({
    url: process.env.OTLP_TRACE_ENDPOINT || 'http://localhost:4318/v1/traces',
  });

  // ---------------------------------------------------------------------------
  // 3) Initialize the OpenTelemetry SDK
  // ---------------------------------------------------------------------------
  // The SDK is configured with both the trace and metrics exporters and instrumentations.
  const sdk = new NodeSDK({
    traceExporter,
    metricReader: promExporter,
    instrumentations: [
      new HttpInstrumentation(),
      new ExpressInstrumentation(),
    ],
  });

  // 4) Démarrage DU SDK (synchrone), on logge après
  try {
    sdk.start();
    logger.info('✅ OpenTelemetry SDK started');
  } catch (err) {
    logger.error('❌ OpenTelemetry failed to start', err);
  }
}

module.exports = { initTelemetry };
