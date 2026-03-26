import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    vus: 10,
    iterations: 50,

    thresholds: {
        http_req_failed: ['rate<0.01'], // http errors should be less than 1%
        http_req_duration: ['p(95)<200'], // 95% of requests should be below 200ms
    },
}

export default function () {
    const baseUrl = __ENV.BASE_URL || 'http://localhost:8000';

    let res = http.get(baseUrl + '/api/v1/fruits?page=1&limit=30');
    check(res, { "status is 200": (res) => res.status === 200 });
    sleep(0.3);
}