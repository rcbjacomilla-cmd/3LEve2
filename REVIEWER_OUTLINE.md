# 3L EVE2 · Succession syllabus aligned to the reviewer

**Source:** `[Draft] SUCCESSION Block Notes-3.pdf` (uploaded Oct. 14, 2026), especially pages 1–7 and 12–16. This syllabus is deliberately headed like the reviewer's notes, instead of being organized solely into arbitrary article-number groups.

## Chapter 2 — Testamentary Succession

### Section 5 — Legitime

| Unit | Original reviewer heading / study theme | Reviewer pages | Focused checkpoints |
|---|---|---:|---:|
| 1 | **LEGITIME** — Legitime; System of Legitimes; Nature of Legitimes; “Compulsion” | 1, 18 | 4 |
| 2 | **Compulsory Heirs** — classification as primary / secondary / concurring; legitimate children and descendants; legitimate parents/ascendants; surviving spouse; illegitimate children/descendants/parents | 1–2, 18 | 8 |
| 3 | **LEGITIME COMBINATIONS** — legitimate children only, legitimate parents/ascendants only, rules for the ascending line | 2–3 | 3 |
| 4 | **LEGITIME COMBINATIONS** — one or multiple legitimate children + spouse, parents + spouse, illegitimate children + spouse | 3 | 4 |
| 5 | **LEGITIME COMBINATIONS** — legitimate and illegitimate children + spouse; legitimate parents + illegitimate children; mixed heirs; reduction of shares | 3–5 | 5 |
| 6 | **LEGITIME COMBINATIONS** — surviving spouse only, illegitimate children only, representation, illegitimate parents + spouse | 5–6 | 4 |
| 7 | **Protection of Legitimes** — Arts. 904–907, future legitimes, completion and reduction | 6 | 4 |
| 8 | **Determination of Legitime** — net hereditary estate, donations and valuation | 6 | 2 |
| 9 | **Donations / Reduction / Devises** — Arts. 909–914, election for usufruct, indivisible devised property, public auction | 7 | 5 |

### Section 6 — Disinheritance

| Unit | Reviewer heading / study theme | Reviewer pages | Checkpoints |
|---|---|---:|---:|
| 10 | **DISINHERITANCE** — effects, requisites, burden of proof, ineffective disinheritance (Arts. 915–918) | 12–13 | 4 |
| 11 | **Causes for Disinheritance** — children/descendants (Art. 919), parents/ascendants (Art. 920), spouse (Art. 921) | 13–15 | 3 |
| 12 | **Reconciliation / Representation** — Articles 922–923 | 15–16 | 2 |

**Total:** 48 Succession checkpoints. The Labor Law world remains 10 checkpoints in three original chapters.

## How students see the original source

- The **chapter navigator** shows the reviewer's headings; each chapter shows the nested checkpoint topics.
- Each checkpoint opens with a focused study question and clickable keywords. Expanding them reveals notes-grounded explanations.
- Where a figure exists, the **original legitime table or pie chart** appears under the keywords and opens in the enlargement viewer. Those images were cropped from the uploaded PDF, not remade.
- **Law Files** include the relevant statutory excerpts as printed in the notes, including the old language of Article 895 with a note distinguishing the Family Code change.
- **Case Files** retain the previously uploaded detailed case digests and original case relationship figures. They were not summarized again in this update.

## How to expand it later

Edit `succession-syllabus.js`. Under `units`, add a topic's ID to the desired unit's `ids`, or add another unit with a new ID, title, subtitle, page citation and list of IDs. Then add exactly one matching `add('su-...', ...)` record with keyword explanations, provision, page, and a question. Keep prior `su-...` checkpoint IDs unchanged to preserve users' existing completion records. Relevant legal source excerpts belong in `supplemental-laws.js`; case digests belong in `reference-files.js`.

The Supabase `save_checkpoint` RPC in `UPGRADE_DATABASE.sql` permits future `su-...` IDs. If you've already applied that upgrade, this curriculum change does **not** require running the database SQL again. Keep your existing configured `config.js` when publishing the revised website.
