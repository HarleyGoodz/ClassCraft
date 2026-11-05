# React + Vite

## First-attempt progress tracking

The Spring Boot API owns attempt persistence in Supabase Postgres. Its JPA
entity creates/updates the `learning_attempts` table when the backend starts
(`spring.jpa.hibernate.ddl-auto=update`). Set `SUPABASE_URL` and
`SUPABASE_PUBLISHABLE_KEY` in `backend/classcraft/.env` so the backend can
validate the signed-in learner's access token. The frontend calls the backend
at `http://localhost:8080` by default; set `VITE_API_BASE_URL` to override it.

For each scenario, first-attempt accuracy uses only the first saved submission:

`correct required elements on the first submitted attempt / total required elements`

Skill Development and Class Diagram Construction are reported separately.
Each Skill Development practice session randomly orders all eligible questions.
Questions with first-attempt accuracy of at least 80% are excluded by default;
learners can opt to include those mastered questions. Overall first-attempt
accuracy is the average of each attempted scenario's first score. Consistency
is the share of attempted scenarios whose first-attempt accuracy met the 80%
target. The original first score is retained when a learner retries. Existing
attempts, including those recorded during previous practice rounds, are
included using each scenario's earliest saved score. Mastered scenarios can be
reviewed from the Skill Development page.
The frontend caches non-response attempt fields per signed-in user in browser
storage so progress can render immediately on return visits while the API
refreshes in the background.

If a scenario's first two saved submissions are both below 80%, the activity
shows a prompt that a guided experience may help. Guided lessons are not yet
implemented.

Class Diagram Construction metrics use all submitted construction scenarios,
so adding scenarios does not require changing a fixed scenario threshold.
Later submissions count as attempts and appear in scenario breakdowns, but do
not change a scenario's first score or its first-attempt metrics. Unattempted
scenarios display as not attempted; no sample percentages are used.

Activity prompts and answer/grading data are stored in `src/questionBank/`,
with one JSX module per activity. A Supabase question table is not needed while
questions are managed in source code; add backend-managed question storage only
if instructors need to edit question content without a code release.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
