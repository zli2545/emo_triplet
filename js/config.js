/**
 * Experiment configuration constants.
 * AUTO-GENERATED — do not edit directly.
 * Edit experiment.yaml and run `npm run setup` to regenerate.
 */

/* eslint-disable no-unused-vars */
var CONFIG = {

  // ── Page ────────────────────────────────────────────────
  PAGE_TITLE: "Emotion Triplet Pilot",

  // ── Response mode ───────────────────────────────────────
  RESPONSE_MODE: "keyboard",
  RESPONSE_KEYS: [
    "k",
    "l",
  ],

  // ── Trial counts ────────────────────────────────────────
  N_RANDOM_TRIALS: 96,
  N_CHECK_TRIALS: 3,
  N_VALIDATION_TRIALS: 9,
  N_MAIN_TRIALS: 108,

  // Sessions (category totals apply to the entire study)
  N_SESSIONS: 5,
  SESSION_TRIAL_COUNTS: [22,22,22,21,21],
  SESSION_PLAN: [{"session_number":1,"total":22,"random":20,"validation":1,"check":1},{"session_number":2,"total":22,"random":19,"validation":2,"check":1},{"session_number":3,"total":22,"random":19,"validation":2,"check":1},{"session_number":4,"total":21,"random":19,"validation":2,"check":0},{"session_number":5,"total":21,"random":19,"validation":2,"check":0}],
  BREAK_HTML: "<p>Session {{SESSION_NUMBER}} of {{N_SESSIONS}} is complete.</p> <p>Take a break. Continue when you are ready.</p>",

  // ── Timing (milliseconds) ──────────────────────────────
  MIN_RT_MS: 900,
  MAX_LOAD_TIME_MS: 120000,
  POST_INSTRUCTION_GAP_MS: 2000,
  POST_DEMOGRAPHIC_GAP_MS: 1000,
  FIXATION_DURATION_MS: 500,

  // ── Fixation ────────────────────────────────────────────
  FIXATION_SYMBOL: "+",
  FIXATION_SIZE_PX: 48,
  FIXATION_THICKNESS_PX: 4,
  SELECTION_FEEDBACK_DURATION_MS: 120,

  // ── Data pipeline ──────────────────────────────────────
  EXPERIMENT_ID: "LOCAL_EMO_TRIPLET_PILOT",
  FILENAME_PREFIX: "emo_triplet_pilot",

  // ── SONA integration (UW-Madison) ─────────────────────
  SONA_BASE_URL: "",
  SONA_EXPERIMENT_ID: "",
  SONA_CREDIT_TOKEN: "",

  // ── Participant feedback ───────────────────────────────
  SECRET_CODE: "LOCALPILOT",
  WORKER_ID_MIN_LENGTH: 7,

  // ── Consent ────────────────────────────────────────────
  CONSENT_IMAGE_PATH: "assets/consent/kc_lab_consent_prolific.png",
  CONSENT_BUTTON_TEXT: "Consent & Continue",

  // ── UI text / messages ─────────────────────────────────
  PRELOAD_MESSAGE: "Loading experiment files...",
  WELCOME_TEXT: "Welcome to the emotion triplet pilot. Press any key to begin.",
  INSTRUCTIONS_HTML: "<p>In each trial, you will see three images: one target image on top and two choice images beneath it.</p> <p>Select the choice that is most similar to the target using any criteria.</p> <p>Press <strong>k</strong> to select the left image and <strong>l</strong> to select the right image.</p> <p>There will be {{N_MAIN_TRIALS}} trials across {{N_SESSIONS}} sessions.</p>",
  CONTINUE_BUTTON_TEXT: "Continue",
  SPEED_FEEDBACK_HTML: "<p><strong>You're going too fast.</strong></p> <p>Please slow down and assess each triplet.</p> <p>Press 'y' to continue.</p>",
  CHECK_FEEDBACK_HTML: "<p><strong>Incorrect!</strong></p> <p>That was an attention check. Please pay attention while completing this task.</p> <p>Press 'y' to continue.</p>",
  FEEDBACK_CONTINUE_KEY: "y",
  DEMOGRAPHIC_INSTRUCTIONS_HTML: "<p>Almost finished.</p> <p>Please provide the following demographic information.</p>",
  GOODBYE_HTML: "You have finished the experiment.",
  SECRET_CODE_HTML: "<strong>Completion code: {{SECRET_CODE}}</strong><br>",
  COMPLETE_BUTTON_TEXT: "Complete Experiment",

  // ── Demographic questions ──────────────────────────────
  RACE_ETHNICITY_PROMPT: "Which categories describe you? Select all that apply to you:",
  RACE_ETHNICITY_OPTIONS: [
    "American Indian or Alaska Native",
    "Asian",
    "Black or African American",
    "Hispanic or Latino",
    "Middle Eastern or North African",
    "Native Hawaiian or Other Pacific Islander",
    "White",
    "Some other race, ethnicity, or origin",
    "I prefer not to answer",
  ],
  AGE_PROMPT: "Please enter your age (in years):",
  AGE_COLUMNS: 6,
  GENDER_PROMPT: "How do you currently describe your gender identity? Please specify.",
  GENDER_COLUMNS: 60,
};

// Export for testing (Node.js / vitest)
if (typeof module !== "undefined" && module.exports) {
  module.exports = { CONFIG };
}
