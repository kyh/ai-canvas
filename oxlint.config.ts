import { defineConfig } from "oxlint";
import antiSlop from "ultracite/oxlint/anti-slop";
import core from "ultracite/oxlint/core";
import next from "ultracite/oxlint/next";
import react from "ultracite/oxlint/react";

export default defineConfig({
  extends: [core, react, next, antiSlop],
  ignorePatterns: [
    ...core.ignorePatterns,
    ".eve",
    ".workflow-data",
    ".output",
    ".claude",
    ".codex",
    ".conductor",
    ".superset",
  ],
  overrides: [
    {
      files: ["agent/tools/**"],
      rules: {
        // eve derives the model-visible tool name from the filename, so tools are snake_case.
        "unicorn/filename-case": ["error", { case: "snakeCase" }],
      },
    },
  ],
  rules: {
    // Sequential awaits in loops are deliberate here (rate-limited source reads, ordered writes).
    "no-await-in-loop": "off",
  },
});
