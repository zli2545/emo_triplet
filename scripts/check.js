#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");
const { CONFIG } = require("../js/config.js");
const { IMAGE_PATHS, VALIDATION_TRIALS } = require("../js/stimuli.js");

const studyDir = path.resolve(__dirname, "..");
const fail = (message) => {
  console.error("CHECK FAILED: " + message);
  process.exit(1);
};

if (IMAGE_PATHS.length !== 64) fail("expected 64 stimuli, found " + IMAGE_PATHS.length);
if (VALIDATION_TRIALS.length !== CONFIG.N_VALIDATION_TRIALS) {
  fail("validation count does not match config");
}
if (CONFIG.N_RANDOM_TRIALS + CONFIG.N_VALIDATION_TRIALS + CONFIG.N_CHECK_TRIALS !== CONFIG.N_MAIN_TRIALS) {
  fail("trial counts do not sum to N_MAIN_TRIALS");
}
if (!Array.isArray(CONFIG.SESSION_PLAN) || CONFIG.SESSION_PLAN.length !== CONFIG.N_SESSIONS) {
  fail("session plan does not match N_SESSIONS");
}

for (const relativePath of IMAGE_PATHS) {
  if (!fs.existsSync(path.join(studyDir, relativePath))) {
    fail("missing stimulus: " + relativePath);
  }
}

console.log("Study check passed:");
console.log("  stimuli: " + IMAGE_PATHS.length);
console.log("  validation trials: " + VALIDATION_TRIALS.length);
console.log("  main trials: " + CONFIG.N_MAIN_TRIALS);
console.log("  sessions: " + CONFIG.N_SESSIONS);
