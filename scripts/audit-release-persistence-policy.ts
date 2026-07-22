import assert from "node:assert/strict";
import { shouldReplacePersistedRelease } from "../src/lib/release-persistence-policy";

assert.equal(
  shouldReplacePersistedRelease({ status: "live", metricCount: 20 }, { status: "source_linked", metricCount: 0 }),
  false,
  "A source outage must not downgrade a structured live release.",
);
assert.equal(
  shouldReplacePersistedRelease({ status: "live", metricCount: 20 }, { status: "live", metricCount: 8 }),
  false,
  "A partial refresh must not erase structured metrics from the same release.",
);
assert.equal(
  shouldReplacePersistedRelease({ status: "summary_only", metricCount: 0 }, { status: "live", metricCount: 8 }),
  true,
  "A structured live refresh should upgrade an archived summary.",
);
assert.equal(
  shouldReplacePersistedRelease({ status: "live", metricCount: 8 }, { status: "live", metricCount: 12 }),
  true,
  "A richer structured refresh should replace the existing release.",
);

console.log("Release persistence policy audit passed: stored official evidence cannot be silently downgraded.");
