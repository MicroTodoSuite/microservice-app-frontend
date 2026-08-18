"""Performance scenarios (spec 007 / US4). Drives auth /login and todos CRUD
through the frontend proxy against the running stack, and fails the gate on any
request error or when p95 latency exceeds the committed baseline threshold."""
import os

from locust import HttpUser, between, events, task

# Baseline threshold (ms). A regression above this fails the perf gate.
P95_THRESHOLD_MS = int(os.environ.get("P95_THRESHOLD_MS", "800"))


class TodoUser(HttpUser):
    wait_time = between(0.1, 0.5)
    token = None

    def on_start(self):
        response = self.client.post(
            "/login", json={"username": "admin", "password": "admin"}, name="/login POST"
        )
        if response.status_code == 200:
            self.token = response.json().get("accessToken")

    @task(3)
    def list_todos(self):
        if self.token:
            self.client.get(
                "/todos",
                headers={"Authorization": f"Bearer {self.token}"},
                name="/todos GET",
            )

    @task(1)
    def create_todo(self):
        if self.token:
            self.client.post(
                "/todos",
                headers={"Authorization": f"Bearer {self.token}"},
                json={"content": "perf task"},
                name="/todos POST",
            )


@events.quitting.add_listener
def _enforce_baseline(environment, **_kwargs):
    stats = environment.stats.total
    p95 = stats.get_response_time_percentile(0.95)
    fail_ratio = stats.fail_ratio
    if fail_ratio > 0.0:
        print(f"perf gate FAIL: failure ratio {fail_ratio:.2%}")
        environment.process_exit_code = 1
    elif p95 and p95 > P95_THRESHOLD_MS:
        print(f"perf gate FAIL: p95 {p95} ms > baseline {P95_THRESHOLD_MS} ms")
        environment.process_exit_code = 1
    else:
        print(f"perf gate OK: p95={p95} ms, fail_ratio={fail_ratio:.2%}")
        environment.process_exit_code = 0
