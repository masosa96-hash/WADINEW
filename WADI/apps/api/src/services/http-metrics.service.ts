export interface MetricsSnapshot {
  counts: {
    "2xx": number;
    "4xx": number;
    "5xx": number;
  };
  p95: number;
  p99: number;
  sampleSize: number;
}

const metrics = {
  requests: {
    "2xx": 0,
    "4xx": 0,
    "5xx": 0,
  },
  latencies: [] as number[],
};

export const recordHttpMetric = (statusCode: number, latencyMs: number) => {
  if (statusCode >= 200 && statusCode < 300) metrics.requests["2xx"]++;
  else if (statusCode >= 400 && statusCode < 500) metrics.requests["4xx"]++;
  else if (statusCode >= 500) metrics.requests["5xx"]++;

  metrics.latencies.push(latencyMs);
  if (metrics.latencies.length > 1000) {
    metrics.latencies.shift();
  }
};

const percentile = (percentileValue: number) => {
  if (metrics.latencies.length === 0) return 0;
  const sorted = [...metrics.latencies].sort((a, b) => a - b);
  const index = Math.ceil((percentileValue / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
};

export const getHttpMetrics = (): MetricsSnapshot => ({
  counts: { ...metrics.requests },
  p95: percentile(95),
  p99: percentile(99),
  sampleSize: metrics.latencies.length,
});
