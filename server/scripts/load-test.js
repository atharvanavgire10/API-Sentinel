const fs = require('fs');
const path = require('path');

const TARGET_URL =
  process.env.TARGET_URL ||
  'http://localhost:5000/api/proxy/demo/api/products';

const TOTAL_REQUESTS =
  Number.parseInt(process.env.TOTAL_REQUESTS, 10) || 1000;

const CONCURRENCY =
  Number.parseInt(process.env.CONCURRENCY, 10) || 50;

const OUTPUT_FILE =
  process.env.OUTPUT_FILE || null;

async function sendRequest() {
  const start = process.hrtime.bigint();

  try {
    const response = await fetch(TARGET_URL);

    await response.arrayBuffer();

    const end = process.hrtime.bigint();

    return {
      success: response.ok,
      status: response.status,
      latency: Number(end - start) / 1_000_000
    };
  } catch (error) {
    const end = process.hrtime.bigint();

    return {
      success: false,
      status: 0,
      latency: Number(end - start) / 1_000_000,
      error: error.message
    };
  }
}

function percentile(values, percentileValue) {
  if (values.length === 0) {
    return 0;
  }

  const index =
    Math.ceil((percentileValue / 100) * values.length) - 1;

  return values[Math.max(0, index)];
}

function round(value, decimals = 2) {
  return Number(value.toFixed(decimals));
}

async function runLoadTest() {
  console.log('API Sentinel Load Test');
  console.log('----------------------');
  console.log(`Target: ${TARGET_URL}`);
  console.log(`Requests: ${TOTAL_REQUESTS}`);
  console.log(`Concurrency: ${CONCURRENCY}`);
  console.log('');

  const results = [];
  const testStart = process.hrtime.bigint();

  let nextRequest = 0;

  async function worker() {
    while (true) {
      const requestNumber = nextRequest++;

      if (requestNumber >= TOTAL_REQUESTS) {
        return;
      }

      const result = await sendRequest();
      results.push(result);
    }
  }

  const workers = Array.from(
    {
      length: Math.min(CONCURRENCY, TOTAL_REQUESTS)
    },
    () => worker()
  );

  await Promise.all(workers);

  const testEnd = process.hrtime.bigint();

  const totalSeconds =
    Number(testEnd - testStart) / 1_000_000_000;

  const successful = results.filter(
    (result) => result.success
  );

  const failed = results.filter(
    (result) => !result.success
  );

  const latencies = results
    .map((result) => result.latency)
    .sort((a, b) => a - b);

  const averageLatency =
    latencies.length === 0
      ? 0
      : latencies.reduce(
          (sum, value) => sum + value,
          0
        ) / latencies.length;

  const statusCodes = {};

  for (const result of results) {
    const status = String(result.status);

    statusCodes[status] =
      (statusCodes[status] || 0) + 1;
  }

  const report = {
    timestamp: new Date().toISOString(),
    target: TARGET_URL,
    requests: TOTAL_REQUESTS,
    concurrency: CONCURRENCY,
    results: {
      total: results.length,
      successful: successful.length,
      failed: failed.length,
      durationSeconds: round(totalSeconds, 3),
      requestsPerSecond: round(
        results.length / totalSeconds
      ),
      averageLatencyMs: round(averageLatency),
      p50LatencyMs: round(
        percentile(latencies, 50)
      ),
      p95LatencyMs: round(
        percentile(latencies, 95)
      ),
      p99LatencyMs: round(
        percentile(latencies, 99)
      ),
      statusCodes
    }
  };

  console.log('Results');
  console.log('-------');
  console.log(`Total: ${report.results.total}`);
  console.log(`Successful: ${report.results.successful}`);
  console.log(`Failed: ${report.results.failed}`);
  console.log(
    `Duration: ${report.results.durationSeconds}s`
  );
  console.log(
    `Requests/sec: ${report.results.requestsPerSecond}`
  );
  console.log(
    `Average latency: ${report.results.averageLatencyMs} ms`
  );
  console.log(
    `P50 latency: ${report.results.p50LatencyMs} ms`
  );
  console.log(
    `P95 latency: ${report.results.p95LatencyMs} ms`
  );
  console.log(
    `P99 latency: ${report.results.p99LatencyMs} ms`
  );

  console.log('');
  console.log('Status Codes');
  console.log('------------');

  for (const [status, count] of Object.entries(
    statusCodes
  )) {
    console.log(`${status}: ${count}`);
  }

  if (OUTPUT_FILE) {
    const outputPath = path.resolve(OUTPUT_FILE);

    fs.mkdirSync(path.dirname(outputPath), {
      recursive: true
    });

    fs.writeFileSync(
      outputPath,
      JSON.stringify(report, null, 2)
    );

    console.log('');
    console.log(`Report saved: ${outputPath}`);
  }

  return report;
}

runLoadTest().catch((error) => {
  console.error('Load test failed:', error);
  process.exitCode = 1;
});
