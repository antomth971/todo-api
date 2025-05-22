import http from 'k6/http';
import { check, sleep } from 'k6';

/*
    * This script is used to load test a simple API endpoint.
    * It sends GET requests to the endpoint and checks the response status.
    * The script is configured to run for a total of 2 minutes, with a ramp-up period of 30 seconds to reach 50 virtual users.
    * The test will then maintain that load for 1 minute before ramping down to 0 users over 30 seconds.
    * The script also includes thresholds to ensure that 95% of requests complete within 500ms and 99% within 1 second.
    * The script uses the k6 library for load testing.
*/
export let options = {
    stages: [
        { duration: '30s', target: 50 },
        { duration: '1m', target: 50 },
        { duration: '30s', target: 0 }
    ],
    thresholds: {
        'http_req_duration': ['p(95)<500', 'p(99)<1000'],
    }
};

export default function () {
    let res = http.get('http://host.docker.internal:3000/todos');
    check(res, { 'status 200': (r) => r.status === 200 });
    sleep(1);
}