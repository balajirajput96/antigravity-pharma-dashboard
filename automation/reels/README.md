# Hindi Research-Reels Workflow

## Purpose

This bounded workflow creates Hindi educational reels about psychology, neuroscience, philosophy, and clearly labeled spiritual interpretation. It is deliberately separate from `/home/ubuntu/agy_pharma_job_task/`, the pharmaceutical vacancy-research workspace. No reel task may alter that workspace, its daily schedule, its reports, or its direct-confirmation gate.

## Production Gate

Every reel must progress through research, evidence review, Hindi scripting, visual planning, generation or editing, captioning, visual quality assurance, and private Drive-package verification. Evidence-supported claims must be separated from interpretation; health, neuroscience, spiritual, and philosophical material must not be framed as diagnosis, treatment, personal guarantee, or universal rule.

| Stage | Required output | Blocking condition |
| --- | --- | --- |
| Research | Source ledger with accessible URLs and claim boundaries | No high-quality source, unclear attribution, or unsupported inference |
| Script | Hindi 60-second script with source-safe wording | Claim cannot be made accurately in concise language |
| Production | Vertical MP4 and Hindi caption track | Captions are unreadable, claim context is missing, or no source-safe closing card |
| QA | Sampled visual review plus audio/caption alignment review | Illegible captions, visual conflict, or unsupported on-screen claim |
| Storage | Private Drive folder verified with video, captions, sources, and QA | Drive upload or file-presence check fails |

## Continuation Rule

`reels-continuation-state.json` is the non-secret system of record. It records Reel 0001 and Reel 0002 as privately Drive-verified accessibility packages, without inventing completion for any future reel. The workflow creates at most one reel per authorized review cycle. It does not schedule bulk video production, publish content externally, create social accounts, or use private user data.

## Master Progress and Batch Roadmap

The `masterProgress` object is the restart-safe tally for the requested 3,000-reel mission. It reports only **actual private-Drive-verified packages** as completed; a concept, a script, a generated asset, a local render, or an unverified Drive upload never increments the tally. The same object records pending, failed, retry-queue, current-batch, and current-reel fields so an interrupted session can resume without recreating completed work.

Each batch contains 30 zero-padded reel IDs, giving 100 planned batches for 3,000 reels. A future batch folder is not pre-created merely to simulate progress; it is created or reused only when its first reel reaches an evidence gate. A batch advances only after all of its 30 private Drive packages are actually verified. The current two verified packages remain in `Batch_001`; Reel 0003 is the next pending item, not a completed or rendered reel.

> The master tally is an audit record, not an authorization to bypass evidence, creative-review, media-generation, Drive-verification, or publication boundaries.

## Restart-Safe Local Indexes

The following non-secret JSON indexes turn the requested project-folder model into auditable local metadata without copying media into the repository or fabricating records. Each index starts with only the two **actual private-Drive-verified** packages and is updated only after its corresponding gate passes.

| Index | Purpose | Current record rule |
| --- | --- | --- |
| `research-database-index.json` | Claim, evidence classification, source-record location, and limitation | No unsupported claim or invented citation |
| `script-database-index.json` | Script readiness and source-safe wording status | Script text is stored only when an evidence-gated Reel is actively prepared |
| `asset-index.json` | Render/caption/source-package artifact inventory | Repository holds metadata, not MP4 bytes |
| `quality-control-index.json` | Technical, visual, caption, and Drive-package QA status | No status is inferred from a local render alone |
| `error-retry-log.json` | Retained correction attempts and genuine retry queue | A resolved artifact revision is not a failed Reel |
| `batch-index.json` | Batch ranges and actual completion counts | Future batches are not pre-created to simulate progress |

These indexes are a local operating record. Private Drive remains the package-storage system of record; only user-authorized private uploads may write there. The indexes never authorize public distribution, unattended bulk generation, or a recurring media schedule.

## Publication Boundary

Private Drive storage is a production archive, not public distribution. Uploading to any social platform, sending promotional messages, or responding to third parties requires a separate explicit user instruction and any required confirmation at that time.
