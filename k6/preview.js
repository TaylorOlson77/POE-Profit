import exec from "k6/execution";
import http from "k6/http";
import { browser } from "k6/browser";
import { check } from "k6";
import { Trend } from "k6/metrics";

// Hand run against the load Preview. CI does not run this file.
// K6_BASE_URL is the preview origin.
// VERCEL_AUTOMATION_BYPASS_SECRET is sent as a header and is not recorded.

const PRODUCTION_HOST = "poe-profit.vercel.app";

const API_PATHS = [
  "/api/strategies",
  "/api/strategies/seed_strategy_poe2_expedition",
  "/api/map-sessions",
  "/api/map-sessions/seed_map_session_poe2_expedition",
];

const pageLoadMs = {
  5: new Trend("page_load_ms_5", true),
  10: new Trend("page_load_ms_10", true),
};

function previewOrigin() {
  const raw = __ENV.K6_BASE_URL;
  if (!raw) {
    throw new Error("Set K6_BASE_URL to the preview origin.");
  }
  const match = /^(https?:)\/\/([^/?#]+)/i.exec(raw.trim());
  if (!match) {
    throw new Error("K6_BASE_URL must be an absolute origin.");
  }
  const host = match[2].split("@").pop();
  const hostname = host.split(":")[0];
  if (hostname === PRODUCTION_HOST) {
    throw new Error("K6_BASE_URL must not be the production host.");
  }
  return `${match[1].toLowerCase()}//${host}`;
}

const origin = previewOrigin();

function requestHeaders() {
  const secret = __ENV.VERCEL_AUTOMATION_BYPASS_SECRET;
  if (!secret) {
    return {};
  }
  return { "x-vercel-protection-bypass": secret };
}

function apiScenario(level) {
  return {
    executor: "constant-vus",
    vus: level,
    duration: "2m",
    exec: "apiGets",
    tags: { level: String(level) },
    gracefulStop: "5s",
  };
}

function browserScenario(level) {
  return {
    executor: "shared-iterations",
    vus: 1,
    iterations: 3,
    maxDuration: "2m",
    exec: "homeLoads",
    options: { browser: { type: "chromium" } },
    tags: { level: String(level) },
    gracefulStop: "5s",
  };
}

export const options = {
  scenarios: {
    api5: apiScenario(5),
    api10: Object.assign(apiScenario(10), { startTime: "2m" }),
    browser5: browserScenario(5),
    browser10: Object.assign(browserScenario(10), { startTime: "2m" }),
  },
  thresholds: {
    "http_req_duration{kind:api,level:5}": ["p(95)<200"],
    "http_req_failed{kind:api,level:5}": ["rate<0.01"],
    "http_req_duration{kind:api,level:10}": ["p(95)<200"],
    "http_req_failed{kind:api,level:10}": ["rate<0.01"],
    "checks{level:5,page:home}": ["rate==1"],
    "checks{level:10,page:home}": ["rate==1"],
  },
};

export function apiGets() {
  const headers = requestHeaders();
  for (const path of API_PATHS) {
    http.get(`${origin}${path}`, {
      headers,
      tags: { kind: "api" },
    });
  }
}

export async function homeLoads() {
  const level = exec.scenario.name === "browser5" ? 5 : 10;
  const page = await browser.newPage();
  const headers = requestHeaders();
  if (headers["x-vercel-protection-bypass"]) {
    await page.setExtraHTTPHeaders(headers);
  }

  let opened = false;
  const started = Date.now();
  try {
    const response = await page.goto(`${origin}/`, { waitUntil: "load" });
    opened =
      response !== null && response.status() >= 200 && response.status() < 400;
    if (opened) {
      pageLoadMs[level].add(Date.now() - started);
    }
  } catch (error) {
    opened = false;
  }

  try {
    await page.close();
  } catch (error) {
    // The navigation result is already recorded.
  }

  check(opened, { "home page opened": (ok) => ok === true }, { page: "home" });
}

function submetric(data, name) {
  const exact = data.metrics[name];
  if (exact && exact.values) {
    return exact;
  }
  const prefix = name.endsWith("}") ? `${name.slice(0, -1)},` : `${name}{`;
  const matches = Object.keys(data.metrics).filter((candidate) => {
    return candidate.startsWith(prefix);
  });
  if (matches.length !== 1 || !data.metrics[matches[0]].values) {
    return null;
  }
  return data.metrics[matches[0]];
}

function levelSummary(data, virtualUsers) {
  const duration = submetric(
    data,
    `http_req_duration{kind:api,level:${virtualUsers}}`,
  );
  const failed = submetric(
    data,
    `http_req_failed{kind:api,level:${virtualUsers}}`,
  );
  const pageLoad = submetric(data, `page_load_ms_${virtualUsers}`);
  if (!duration || !failed || !pageLoad) {
    return null;
  }
  return {
    virtualUsers,
    httpReqDurationAvgMs: duration.values.avg,
    httpReqDurationMaxMs: duration.values.max,
    httpReqDurationP95Ms: duration.values["p(95)"],
    httpReqFailedRate: failed.values.rate,
    pageLoadAvgMs: pageLoad.values.avg,
    pageLoadMaxMs: pageLoad.values.max,
  };
}

function thresholdsOk(data) {
  return Object.values(data.metrics).every((metric) => {
    if (!metric.thresholds) {
      return true;
    }
    return Object.values(metric.thresholds).every((threshold) => threshold.ok);
  });
}

export function handleSummary(data) {
  const levels = [levelSummary(data, 5), levelSummary(data, 10)];
  const passed = thresholdsOk(data) && levels.every((level) => level !== null);
  const summary = {
    runAt: new Date().toISOString(),
    previewOrigin: origin,
    levels: levels.filter((level) => level !== null),
  };
  const text = `${passed ? "passed" : "failed"}\n${JSON.stringify(summary, null, 2)}\n`;
  if (!passed) {
    return { stdout: text };
  }
  return {
    stdout: text,
    "k6/summary.json": `${JSON.stringify(summary, null, 2)}\n`,
  };
}
