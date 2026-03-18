/**
 * Simple Prometheus metrics endpoint for lks-api-service.
 * Exposes basic HTTP metrics so Prometheus in Oregon can scrape us.
 *
 * Prometheus in us-west-2 reaches this via Inter-Region VPC Peering:
 *   Oregon (10.1.1.x) → pcx-lks-2026 → Virginia (10.0.3.x:9100)
 */

const os = require('os');

// In-memory counters
let requestCount   = 0;
let requestErrors  = 0;
let startTime      = Date.now();

function increment()      { requestCount++; }
function incrementError() { requestErrors++; }

/**
 * Build a Prometheus text-format metrics response.
 * Called by GET /metrics — scraped by Prometheus every 30s.
 */
function buildMetrics() {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  const memUsed       = process.memoryUsage().rss;
  const cpuLoad       = os.loadavg()[0];

  return [
    '# HELP lks_api_requests_total Total HTTP requests handled by lks-api-service',
    '# TYPE lks_api_requests_total counter',
    `lks_api_requests_total{service="lks-api",region="us-east-1"} ${requestCount}`,
    '',
    '# HELP lks_api_errors_total Total HTTP 5xx errors from lks-api-service',
    '# TYPE lks_api_errors_total counter',
    `lks_api_errors_total{service="lks-api",region="us-east-1"} ${requestErrors}`,
    '',
    '# HELP lks_api_uptime_seconds Seconds since lks-api-service started',
    '# TYPE lks_api_uptime_seconds gauge',
    `lks_api_uptime_seconds{service="lks-api",region="us-east-1"} ${uptimeSeconds}`,
    '',
    '# HELP lks_api_memory_bytes_rss Resident memory usage of lks-api-service',
    '# TYPE lks_api_memory_bytes_rss gauge',
    `lks_api_memory_bytes_rss{service="lks-api",region="us-east-1"} ${memUsed}`,
    '',
    '# HELP lks_api_cpu_load_avg1 1-minute CPU load average of the host',
    '# TYPE lks_api_cpu_load_avg1 gauge',
    `lks_api_cpu_load_avg1{service="lks-api",region="us-east-1"} ${cpuLoad.toFixed(4)}`,
    '',
  ].join('\n');
}

module.exports = { increment, incrementError, buildMetrics };
