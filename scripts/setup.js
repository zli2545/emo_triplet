#!/usr/bin/env node

/**
 * Regenerate this study with the shared template generator.
 *
 * The default layout keeps the two repositories as siblings:
 *   code/triplet_experiment_template/
 *   code/emo_triplet/
 *
 * Set TRIPLET_TEMPLATE_DIR when the template is stored elsewhere.
 */

"use strict";

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const studyDir = path.resolve(__dirname, "..");
const templateDir = path.resolve(
  process.env.TRIPLET_TEMPLATE_DIR || path.join(studyDir, "..", "triplet_experiment_template")
);
const generator = path.join(templateDir, "scripts", "generate_experiment.js");

if (!fs.existsSync(generator)) {
  console.error("Shared template generator not found:");
  console.error("  " + generator);
  console.error("Set TRIPLET_TEMPLATE_DIR to the local template repository.");
  process.exit(1);
}

const result = spawnSync(process.execPath, [generator, studyDir], {
  cwd: templateDir,
  stdio: "inherit",
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status === null ? 1 : result.status);
