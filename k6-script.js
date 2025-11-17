import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 10,
  duration: '1m',

  thresholds: {
    // Functional quality
    http_req_failed: ['rate<0.01'],      // < 1% of requests should fail
    'checks{type:availability}': ['rate>0.99'], // 99% of checks must pass

    // Latency SLO-style thresholds
    http_req_duration: [
      'p(50)<200',   // median user experience should be snappy
      'p(95)<500',   // 95% of requests under 500ms
      'p(99)<1000',  // worst 1% still under 1s
    ],
  },

  tags: {
    service: 'demo-api',
    environment: `${__ENV.ENVIRONMENT || 'local'}`,
  },
};

export default function () {
  const url = __ENV.TARGET_URL || 'https://test.k6.io';

  const res = http.get(url, {
    tags: { endpoint: 'home' },
  });

  check(
    res,
    {
      'status is 200': (r) => r.status === 200,
    },
    { type: 'availability' }
  );
}
