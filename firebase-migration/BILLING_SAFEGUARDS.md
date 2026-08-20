# Firebase Blaze Billing Safeguards

> **Status:** Proposed local configuration only. No billing account is linked, no budget exists, and no cloud resource is changed by this document.

This safeguard plan applies only to the Firebase project backed by Google Cloud project `project-23447353-9f40-4f75-a8b` (**My First Project**). It must not be applied to either Gemini-related project.

## Proposed low-spend test configuration

The following is a **draft for explicit owner approval**, not a cost estimate or a guarantee. It is designed to make early testing visible quickly before any data migration or public traffic is enabled.

| Control                    |                                                                               Proposed setting | Purpose                                                                                       |
| -------------------------- | ---------------------------------------------------------------------------------------------: | --------------------------------------------------------------------------------------------- |
| Billing budget scope       |                                            Only `project-23447353-9f40-4f75-a8b`; all services | Keeps monitoring isolated from Gemini work.                                                   |
| Monthly alerts-only budget |                                                                                         ₹1,000 | Establishes a small testing threshold that the owner must explicitly approve before creation. |
| Actual-spend alerts        |                                                                     1%, 2%, 5%, 50%, 80%, 100% | Gives early warning during initial testing and stronger warnings near the selected threshold. |
| Forecast alert             |                                                                          100% forecasted spend | Flags an expected threshold breach before the end of the month.                               |
| Cloud Functions spend cap  |                    90% of the owner-approved Functions allocation, if the feature is available | Seeks to pause eligible Functions/Cloud Run usage before the selected threshold is reached.   |
| Owner review cadence       | Review Firebase **Usage and billing** after each deployment and weekly while the app is active | Detects unexpected reads, storage use, or function invocations.                               |
| Data import                |              Disabled until rules, owner bootstrap, and the initial budget review are complete | Avoids accidental storage or function usage before the safety gate is verified.               |

## Important limitations

Cloud Billing **budget alerts do not cap usage or charges**. They are notifications and may arrive after usage occurs. Budget spend caps are available only for supported services, are not instantaneous hard caps, and can pause an affected service until explicitly lifted. The owner remains responsible for any charge that occurs before a notification or enforcement takes effect.[1][2]

Cloud Functions requires the Blaze plan with a linked billing account. The plan may include no-cost usage quotas, but usage above applicable quotas is pay-as-you-go. Linking a billing account upgrades the entire Firebase project, not merely this application.[2]

## Required approval sequence

1. The owner completes Google Cloud payment verification manually.
2. Before linking the billing account, confirm the exact project, the billing account, and the above budget amount in the Google Cloud console.
3. Create the project-scoped budget and alerts before deploying Functions.
4. Deploy Firebase rules, Functions, and Hosting only after the owner gives a distinct confirmation for the deployment action.
5. Keep private reports, JSONL audits, drafts, contacts, and secrets out of the deployment package until the secured deployment passes its owner-only verification.

## References

[1]: https://firebase.google.com/docs/projects/billing/avoid-surprise-bills "Firebase: Avoid surprise bills"
[2]: https://firebase.google.com/docs/projects/billing/firebase-pricing-plans "Firebase pricing plans"
