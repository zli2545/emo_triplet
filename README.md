# emo_triplet

Standalone deployment repository for the emotion-triplet experiment.

The experiment is generated from the shared
[`triplet_experiment_template`](https://github.com/zli2545/triplet_experiment_template) repository,
but this repository contains the study configuration and the complete static
study output needed to run the experiment independently.

The standalone `setup` wrapper still calls the original template generator, so
configuration changes remain compatible with the shared template logic.

## Run locally

Serve this directory over HTTP rather than opening `index.html` directly:

```bash
python3 -m http.server 8000
```

Then open <http://127.0.0.1:8000/>.

## Change configuration

Edit `experiment.yaml`, then regenerate the runtime files:

```bash
npm run setup
npm run check
```

By default, the wrapper expects the template repository to be the sibling
directory `../triplet_experiment_template`. If it is elsewhere, set its path:

```bash
TRIPLET_TEMPLATE_DIR=/path/to/triplet_experiment_template npm run setup
```

The shared template repository must have its Node dependencies installed.
`config.js` and `stimuli.js` are generated outputs; do not edit them directly.

## GitHub Pages

In the GitHub repository, choose **Settings → Pages → Deploy from a branch**,
select the `main` branch and `/ (root)`. The experiment will be available at:

```text
https://<github-username>.github.io/emo_triplet/
```

For online data collection, configure the production DataPipe experiment ID in
`experiment.yaml`, regenerate the generated configuration, and test the
hosted URL before recruitment. Participant data are sent to DataPipe; they are
not committed to this repository.

## Study contents

- `index.html`, `style.css`: participant-facing page and styling
- `js/`: generated configuration, stimuli list, shared runtime, and utilities
- `assets/stimuli/`: the 64 selected stimuli
- `assets/consent/`: consent material
- `stimulus_candidates.csv`: stimulus selection provenance
- `experiment.yaml`: study-level configuration and participant-facing text
- `scripts/setup.js`: calls the shared template generator
- `scripts/check.js`: checks study-specific counts and asset paths

## Updating from the template

The shared template remains the source for common runtime changes. After
changing the template or this study's configuration, regenerate the study in
the template repository and copy the generated study files here. Review the
diff, run a local HTTP test, then commit and deploy from this repository.
