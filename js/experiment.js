/* Shared jsPsych 7 timeline. Study-specific values come from generated CONFIG. */
"use strict";

document.title = CONFIG.PAGE_TITLE;
const isLocal = ["localhost", "127.0.0.1", "::1", "[::1]"].includes(window.location.hostname) ||
  window.location.protocol === "file:";
let activeSession = 1;
let completedTrials = 0;
let savedSessions = 0;
let choiceDisplay = "";
const sessionSizes = CONFIG.SESSION_TRIAL_COUNTS || [CONFIG.N_MAIN_TRIALS];
const sessionPlan = CONFIG.SESSION_PLAN || planSessions({ random: CONFIG.N_RANDOM_TRIALS,
  validation: CONFIG.N_VALIDATION_TRIALS, check: CONFIG.N_CHECK_TRIALS }, sessionSizes);

const jsPsych = initJsPsych({
  show_progress_bar: true,
  auto_update_progress_bar: false,
  max_load_time: CONFIG.MAX_LOAD_TIME_MS,
  on_trial_start: function(trial) {
    trial.data = Object.assign({}, trial.data, {
      session_number: activeSession,
    });
    updateProgress();
  },
  on_finish: function() {
    let message = '<h1>Experiment Finished</h1>';
    if ((urlvar.workerId || "").length > CONFIG.WORKER_ID_MIN_LENGTH) {
      message += CONFIG.SECRET_CODE_HTML.replace("{{SECRET_CODE}}", CONFIG.SECRET_CODE);
    }
    jsPsych.getDisplayElement().innerHTML = message;
    if (!isLocal && urlvar.workerId && CONFIG.SONA_BASE_URL &&
        CONFIG.SONA_EXPERIMENT_ID && CONFIG.SONA_CREDIT_TOKEN) {
      const completionLink = CONFIG.SONA_BASE_URL +
        "?experiment_id=" + encodeURIComponent(CONFIG.SONA_EXPERIMENT_ID) +
        "&credit_token=" + encodeURIComponent(CONFIG.SONA_CREDIT_TOKEN) +
        "&survey_code=" + encodeURIComponent(urlvar.workerId);
      setTimeout(() => window.location.assign(completionLink), 2000);
    }
  },
});
const urlvar = jsPsych.data.urlVariables();
const runId = jsPsych.randomization.randomID(8);
const workerId = urlvar.workerId || runId;
jsPsych.data.addProperties({worker_id: workerId});
const sampleFn = (arr, n) => jsPsych.randomization.sampleWithoutReplacement(arr, n);
const useKeyboard = CONFIG.RESPONSE_MODE === "keyboard";

function updateProgress() {
  jsPsych.setProgressBar(completedTrials / CONFIG.N_MAIN_TRIALS);
  if (sessionPlan.length === 1) return;
  const outer = document.getElementById("jspsych-progressbar-outer");
  if (!outer) return;
  document.getElementById("jspsych-progressbar-container").classList.add("has-sessions");
  let labels = document.getElementById("session-progress");
  if (!labels) {
    labels = document.createElement("div");
    labels.id = "session-progress";
    let offset = 0;
    for (let i = 0; i <= sessionPlan.length; i++) {
      const boundary = document.createElement("span");
      boundary.className = "session-boundary";
      boundary.dataset.boundary = i;
      boundary.style.left = (100 * offset / CONFIG.N_MAIN_TRIALS) + "%";
      const text = document.createElement("span");
      text.textContent = i === 0 ? "Start" : i === sessionPlan.length ? "Final" : "Break " + i;
      boundary.appendChild(text);
      labels.appendChild(boundary);
      if (i < sessionPlan.length) {
        const segment = document.createElement("span");
        segment.className = "session-segment";
        segment.style.left = (100 * offset / CONFIG.N_MAIN_TRIALS) + "%";
        segment.style.width = (100 * sessionPlan[i].total / CONFIG.N_MAIN_TRIALS) + "%";
        segment.textContent = "S" + (i + 1);
        labels.appendChild(segment);
        offset += sessionPlan[i].total;
      }
    }
    outer.appendChild(labels);
  }
  labels.querySelectorAll(".session-boundary").forEach(dot => {
    dot.classList.toggle("complete", Number(dot.dataset.boundary) <= savedSessions);
  });
}

function downloadCsv(filename, csvData) {
  const url = URL.createObjectURL(new Blob([csvData], {type: "text/csv;charset=utf-8"}));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Give the browser time to start reading the download before revocation.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function rememberChoices() { choiceDisplay = jsPsych.getDisplayElement().innerHTML; }
function finishChoice(data) {
  data.trial_category = jsPsych.timelineVariable("type");
  data.stimulus = jsPsych.timelineVariable("stimulus");
  if (useKeyboard) data.response = CONFIG.RESPONSE_KEYS.indexOf(data.response);
  data.choices = [jsPsych.timelineVariable("choice1"), jsPsych.timelineVariable("choice2")];
  data.speedy = data.rt < CONFIG.MIN_RT_MS;
  if (data.trial_category === "check") {
    data.correct = data.response === jsPsych.timelineVariable("correct_choice");
  }
  completedTrials++;
  updateProgress();
  // Plugins have already recorded RT and ended the trial. Show its selection
  // during the normal post-trial gap, without adding time to the recorded RT.
  if (CONFIG.SELECTION_FEEDBACK_DURATION_MS > 0) {
    const display = jsPsych.getDisplayElement();
    display.innerHTML = choiceDisplay;
    display.querySelectorAll(".triplet-choice").forEach((choice, i) => {
      if (i === data.response) choice.classList.add("selected");
      if (choice.tagName === "BUTTON") choice.disabled = true;
    });
  }
}

const createTrial = {
  type: useKeyboard ? jsPsychHtmlKeyboardResponse : jsPsychImageButtonResponse,
  stimulus: useKeyboard ? function() {
    return '<div class="triplet-trial">' +
      '<div class="triplet-target"><div class="triplet-image-frame">' +
      '<img src="' + jsPsych.timelineVariable("stimulus") + '" alt="Target image">' +
      '</div></div>' +
      '<div class="triplet-choice-row">' +
      ["choice1", "choice2"].map((key, i) => '<div class="triplet-choice">' +
        '<div class="triplet-image-frame"><img src="' + jsPsych.timelineVariable(key) +
        '" alt="Choice ' + (i + 1) + '"></div>' +
        '<div class="triplet-key-hint"><kbd>' + CONFIG.RESPONSE_KEYS[i] +
        '</kbd></div></div>').join("") + '</div></div>';
  } : jsPsych.timelineVariable("stimulus"),
  choices: useKeyboard ? CONFIG.RESPONSE_KEYS : function() {
    return [jsPsych.timelineVariable("choice1"), jsPsych.timelineVariable("choice2")];
  },
  on_load: rememberChoices,
  on_finish: finishChoice,
  post_trial_gap: CONFIG.SELECTION_FEEDBACK_DURATION_MS || 0,
};
if (!useKeyboard) {
  createTrial.button_html = '<button class="jspsych-btn triplet-choice" type="button">' +
    '<span class="triplet-image-frame"><img src="%choice%" alt="Choice image"></span></button>';
}

const speedFeedback = {type: jsPsychHtmlKeyboardResponse, stimulus: CONFIG.SPEED_FEEDBACK_HTML,
  choices: [CONFIG.FEEDBACK_CONTINUE_KEY]};
const checkFeedback = {type: jsPsychHtmlKeyboardResponse, stimulus: CONFIG.CHECK_FEEDBACK_HTML,
  choices: [CONFIG.FEEDBACK_CONTINUE_KEY]};

function sessionBreakHtml(sessionNumber) {
  const templates = CONFIG.SESSION_BREAK_HTML || [];
  return (templates[sessionNumber - 1] || CONFIG.BREAK_HTML)
    .replace(/\{\{SESSION_NUMBER\}\}/g, sessionNumber)
    .replace(/\{\{N_SESSIONS\}\}/g, sessionPlan.length);
}

function fixationHtml() {
  if (CONFIG.FIXATION_SYMBOL === "+") {
    return '<div class="fixation-cross" aria-label="Fixation" style="--fixation-size:' +
      (CONFIG.FIXATION_SIZE_PX || 48) + 'px;--fixation-thickness:' +
      (CONFIG.FIXATION_THICKNESS_PX || 4) + 'px;"></div>';
  }
  const symbol = document.createElement("div");
  symbol.textContent = CONFIG.FIXATION_SYMBOL;
  symbol.style.fontSize = (CONFIG.FIXATION_SIZE_PX || 48) + "px";
  symbol.style.fontWeight = "bold";
  return symbol.outerHTML;
}

function sessionSaving(session) {
  const state = {saved: false, csv: null, filename: null, attempts: 0};
  function snapshot() {
    if (state.csv !== null) return;
    state.filename = sessionFilename(CONFIG.FILENAME_PREFIX, runId, session.session_number);
    state.csv = jsPsych.data.get().filter({session_number: session.session_number})
      .ignore("session_number").csv();
  }
  function saved() {
    state.saved = true;
    savedSessions = session.session_number;
    updateProgress();
  }
  const saveTrial = isLocal ? {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: "<p>Saving session data...</p>", choices: "NO_KEYS", trial_duration: 1,
    on_start: function() { snapshot(); downloadCsv(state.filename, state.csv); saved(); },
  } : {
    // Use the same Pipe save plugin as the original template, once per session.
    type: jsPsychPipe, action: "save", experiment_id: CONFIG.EXPERIMENT_ID,
    on_start: function() { state.attempts++; },
    filename: () => { snapshot(); return state.filename; },
    data_string: () => { snapshot(); return state.csv; },
    on_finish: function(data) { if (pipeSaveSucceeded(data)) saved(); },
  };
  const failure = {
    timeline: [{
      type: jsPsychHtmlButtonResponse,
      stimulus: "<p>The upload did not complete. Your responses are still in this page.</p><p>Please retry or keep a local copy before continuing.</p>",
      choices: ["Retry upload", "Download CSV and continue"],
      on_finish: function(data) {
        if (data.response === 1) { downloadCsv(state.filename, state.csv); saved(); }
      },
    }],
    conditional_function: () => !state.saved && state.attempts >= 3,
  };
  return {state: state, timeline: {timeline: [saveTrial, failure], loop_function: () => !state.saved}};
}

const timeline = [
  {type: jsPsychPreload, auto_preload: true, images: IMAGE_PATHS,
    show_progress_bar: true, message: CONFIG.PRELOAD_MESSAGE},
  {type: jsPsychHtmlKeyboardResponse, stimulus: CONFIG.WELCOME_TEXT},
  {type: jsPsychFullscreen, fullscreen_mode: true},
  {type: jsPsychImageButtonResponse, stimulus: CONFIG.CONSENT_IMAGE_PATH,
    choices: [CONFIG.CONSENT_BUTTON_TEXT]},
  {type: jsPsychHtmlButtonResponse,
    stimulus: CONFIG.INSTRUCTIONS_HTML
      .replace(/\{\{N_MAIN_TRIALS\}\}/g, CONFIG.N_MAIN_TRIALS)
      .replace(/\{\{N_SESSIONS\}\}/g, sessionPlan.length),
    choices: [CONFIG.CONTINUE_BUTTON_TEXT], post_trial_gap: CONFIG.POST_INSTRUCTION_GAP_MS},
];

let validationOffset = 0;
const savedFiles = [];
sessionPlan.forEach((session, i) => {
  // Multiple sessions use fixed, disjoint slices of the generated list.
  // A single session keeps the template's original candidate-pool sampling.
  const validations = sessionPlan.length === 1 ? VALIDATION_TRIALS :
    VALIDATION_TRIALS.slice(validationOffset, validationOffset + session.validation);
  validationOffset += session.validation;
  timeline.push({
    timeline: [
      {type: jsPsychHtmlKeyboardResponse, stimulus: fixationHtml, choices: "NO_KEYS",
        trial_duration: CONFIG.FIXATION_DURATION_MS},
      createTrial,
      {timeline: [checkFeedback], conditional_function: function() {
        const last = jsPsych.data.get().last(1).values()[0];
        return last.trial_category === "check" && !last.correct;
      }},
      {timeline: [speedFeedback], conditional_function: function() {
        const last = jsPsych.data.get().last(1).values()[0];
        return last.rt < CONFIG.MIN_RT_MS && last.trial_category !== "check";
      }},
    ],
    timeline_variables: createTrialSequence(session.random, session.check, session.validation,
      IMAGE_PATHS, validations, sampleFn),
    randomize_order: false,
    on_timeline_start: function() {
      activeSession = session.session_number;
    },
  });
  if (i === sessionPlan.length - 1) {
    timeline.push({
      type: jsPsychHtmlButtonResponse,
      stimulus: () => sessionBreakHtml(session.session_number),
      choices: [CONFIG.CONTINUE_BUTTON_TEXT],
    });
    timeline.push(
      {type: jsPsychHtmlButtonResponse, stimulus: CONFIG.DEMOGRAPHIC_INSTRUCTIONS_HTML,
        choices: [CONFIG.CONTINUE_BUTTON_TEXT], post_trial_gap: CONFIG.POST_DEMOGRAPHIC_GAP_MS},
      {type: jsPsychSurveyMultiSelect, questions: [{prompt: CONFIG.RACE_ETHNICITY_PROMPT,
        options: CONFIG.RACE_ETHNICITY_OPTIONS, horizontal: false, required: true, name: "race_eth"}]},
      {type: jsPsychSurveyText, questions: [
        {prompt: CONFIG.AGE_PROMPT, rows: 1, columns: CONFIG.AGE_COLUMNS, name: "age", required: true},
        {prompt: CONFIG.GENDER_PROMPT, rows: 1, columns: CONFIG.GENDER_COLUMNS, name: "gender"},
      ]}
    );
  }
  const saving = sessionSaving(session);
  savedFiles.push(saving.state);
  timeline.push(saving.timeline);
  if (i < sessionPlan.length - 1) {
    timeline.push({
      type: jsPsychHtmlButtonResponse,
      stimulus: () => sessionBreakHtml(session.session_number),
      choices: [CONFIG.CONTINUE_BUTTON_TEXT],
    });
  }
});

timeline.push({type: jsPsychFullscreen, fullscreen_mode: false});
jsPsych.run(timeline);
