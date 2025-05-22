import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';

export const byStatus = new Counter('status_code');

export const options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '1m',  target: 50 },
    { duration: '30s', target: 0  },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
  },
};

export default function () {
  const res = http.get('http://api:3000/todos');
  byStatus.add(1, { status: res.status });

  const ok = [200, 201, 204];
  check(res, { expected: (r) => ok.includes(r.status) });

  sleep(1);
}
