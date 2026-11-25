# emo_triplet

Standalone deployment repository for the emotion-triplet experiment.

The experiment is generated from the shared
[`triplet_experiment_template`](https://github.com/zli2545/triplet_experiment_template) repository,
but this repository contains the complete static study output needed to run
the experiment independently.

## Run locally

Serve this directory over HTTP rather than opening `index.html` directly:

```bash
python3 -m http.server 8000
```

Then open <http://127.0.0.1:8000/>.

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

## Updating from the template

The shared template remains the source for common runtime changes. After
changing the template or this study's configuration, regenerate the study in
the template repository and copy the generated study files here. Review the
diff, run a local HTTP test, then commit and deploy from this repository.
