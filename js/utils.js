/**
 * Pure utility functions for the triplet experiment.
 *
 * These functions have no dependency on jsPsych and can be unit tested directly.
 */

/* eslint-disable no-unused-vars */

/**
 * Fisher-Yates shuffle — randomizes array in place and returns it.
 * @param {Array} array
 * @returns {Array} the same array, shuffled
 */
function shuffle(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = array[i];
    array[i] = array[j];
    array[j] = tmp;
  }
  return array;
}

/**
 * Return `n` unique images from `imagePaths`, excluding any in `excludeImages`.
 *
 * @param {string[]} imagePaths - full list of available image paths
 * @param {number}   n          - how many to select
 * @param {string[]} excludeImages - paths to skip
 * @param {Function} sampleFn  - sampling function(array, count) → array
 * @returns {string[]|null} selected paths, or null if not enough available
 */
function getUniqueRandomImages(imagePaths, n, excludeImages, sampleFn) {
  excludeImages = excludeImages || [];
  var availableImages = imagePaths.filter(function (img) {
    return excludeImages.indexOf(img) === -1;
  });
  if (availableImages.length < n) {
    return null;
  }
  return sampleFn(availableImages, n);
}

/**
 * Build a random trial (three distinct images).
 *
 * @param {string[]} imagePaths
 * @param {Function} sampleFn - sampling function(array, count) → array
 * @returns {{ type: string, stimulus: string, choice1: string, choice2: string }}
 */
function generateRandomTrial(imagePaths, sampleFn) {
  var selectedImages = getUniqueRandomImages(imagePaths, 3, [], sampleFn);
  return {
    type: "random",
    stimulus: selectedImages[0],
    choice1: selectedImages[1],
    choice2: selectedImages[2],
  };
}

/**
 * Build a check (attention) trial where the target appears as one of the choices.
 *
 * @param {string[]} imagePaths
 * @param {Function} sampleFn - sampling function(array, count) → array
 * @returns {{ type: string, stimulus: string, choice1: string, choice2: string, correct_choice: number }}
 */
function generateCheckTrial(imagePaths, sampleFn) {
  var target = sampleFn(imagePaths, 1)[0];
  var otherChoice = getUniqueRandomImages(imagePaths, 1, [target], sampleFn)[0];
  var isFirstChoice = Math.random() < 0.5;
  return {
    type: "check",
    stimulus: target,
    choice1: isFirstChoice ? target : otherChoice,
    choice2: isFirstChoice ? otherChoice : target,
    correct_choice: isFirstChoice ? 0 : 1,
  };
}

/**
 * Create a shuffled sequence of random, check, and validation trials.
 *
 * @param {number}   numRandom
 * @param {number}   numCheck
 * @param {number}   numValidation
 * @param {string[]} imagePaths
 * @param {Object[]} validationTrials - predefined validation trial objects
 * @param {Function} sampleFn - sampling function(array, count) → array
 * @returns {Object[]} shuffled array of trial descriptors
 */
function createTrialSequence(
  numRandom,
  numCheck,
  numValidation,
  imagePaths,
  validationTrials,
  sampleFn
) {
  var trials = [];

  for (var i = 0; i < numRandom; i++) {
    trials.push(generateRandomTrial(imagePaths, sampleFn));
  }
  for (var j = 0; j < numCheck; j++) {
    trials.push(generateCheckTrial(imagePaths, sampleFn));
  }

  var selectedValidation = sampleFn(validationTrials, numValidation);
  trials = trials.concat(selectedValidation);

  return shuffle(trials);
}

/**
 * Divide explicit study-wide category totals between sessions. Start with
 * proportional floors, then round cells up along augmenting paths so BOTH
 * margins stay exact. Each cell is a floor/ceiling of its ideal quota.
 * This allocates trial categories only; it never constrains stimulus sampling.
 */
function planSessions(counts, sessionSizes) {
  const categories = ["random", "validation", "check"];
  const totals = categories.map(key => counts[key]);
  if (!totals.every(n => Number.isSafeInteger(n) && n >= 0) ||
      !Array.isArray(sessionSizes) || !sessionSizes.length ||
      !sessionSizes.every(n => Number.isSafeInteger(n) && n > 0)) {
    throw new Error("Trial counts must be nonnegative integers; session sizes must be positive integers.");
  }
  const total = totals.reduce((a, b) => a + b, 0);
  if (!Number.isSafeInteger(total) || sessionSizes.reduce((a, b) => a + b, 0) !== total) {
    throw new Error("Session trial counts must sum to the explicit random + validation + check totals.");
  }
  const quotas = sessionSizes.map(size => totals.map(n => size * n / total));
  const cells = quotas.map(row => row.map(Math.floor));
  const rounded = cells.map(() => [false, false, false]);
  const remaining = totals.map((n, c) => n - cells.reduce((sum, row) => sum + row[c], 0));
  function roundUp(s, visited) {
    if (visited.has(s)) return false;
    visited.add(s);
    const order = [0, 1, 2].sort((a, b) =>
      (quotas[s][b] - cells[s][b]) - (quotas[s][a] - cells[s][a]) || a - b);
    for (const c of order) {
      if (rounded[s][c] || quotas[s][c] === cells[s][c]) continue;
      if (remaining[c] > 0) {
        remaining[c]--;
        rounded[s][c] = true;
        return true;
      }
      for (let previous = 0; previous < rounded.length; previous++) {
        if (rounded[previous][c] && roundUp(previous, visited)) {
          rounded[previous][c] = false;
          rounded[s][c] = true;
          return true;
        }
      }
    }
    return false;
  }
  return sessionSizes.map((size, s) => {
    const deficit = size - cells[s].reduce((a, b) => a + b, 0);
    for (let i = 0; i < deficit; i++) {
      if (!roundUp(s, new Set())) throw new Error("Cannot round session quotas.");
    }
    // Return after every row has been rounded: later paths can adjust this row.
    return { session_number: s + 1, total: size };
  }).map((session, s) => {
    categories.forEach((key, c) => { session[key] = cells[s][c] + Number(rounded[s][c]); });
    return session;
  });
}

function sessionFilename(prefix, runId, sessionNumber, date) {
  const timestamp = (date || new Date()).toISOString().replace(/[-:.]/g, "");
  return prefix + "_" + runId + "_session" + sessionNumber + "_" + timestamp + ".csv";
}

// Some Pipe versions label a caught network Error as success. Require an
// affirmative server acknowledgement rather than trusting that flag alone.
function pipeSaveSucceeded(data) {
  return Boolean(data && data.success === true && data.result &&
    !data.result.error && (data.result.message === "Success" || data.result.error === null));
}

// Export for testing (Node.js / vitest)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    shuffle: shuffle,
    getUniqueRandomImages: getUniqueRandomImages,
    generateRandomTrial: generateRandomTrial,
    generateCheckTrial: generateCheckTrial,
    createTrialSequence: createTrialSequence,
    planSessions: planSessions,
    sessionFilename: sessionFilename,
    pipeSaveSucceeded: pipeSaveSucceeded,
  };
}
