# Design a World (Grade 5 GT, Texas TEKS)

A static, offline-friendly Chromebook game. Students build an island world, and each place opens a mission.

**Missions:** 63, from School Bot's final `game_missions_v2.json`: 31 science, 17 math, 5 writing, 10 social studies.
- Stage 1: 16
- Stage 2: 10
- Stage 3: 11
- Stage 4: 26

**TEKS coverage** (a TEKS counts when it is in at least one mission's `teks` or `practices`, or in a history event's `teks`; see `TEKS-COVERAGE.md`):

| Subject | Covered by missions | With history events |
|---|---|---|
| Science | 42 of 42 | 42 of 42 |
| Math | 43 of 46 | 43 of 46 |
| Writing (ELAR) | 24 of 63 | 24 of 63 |
| Social Studies | 38 of 77 | 77 of 77 |
| All | 147 of 228 | 186 of 228 |

These counts describe the game's content. **The teacher does the scoring:** nothing the student or teacher sees (game, TEKS tracker, Turn-in report, PDF/PNG, Showcase, slideshow, teacher view) shows a percentage, points, a grade or a level grade. The tracker says "N of M TEKS have evidence" and lists each TEKS as done, not yet, or not in this game; Standards Evidence marks each TEKS strong, weak or missing; XP, levels and badges are in-game play progression only and never appear in reports. The tracker labels TEKS that have nothing in this set "not in this mission set yet". `AWKWARD-TEKS.md` (from School Bot) lists every SE left out on purpose and why (reading-block ELAR SEs, decimal area models, prime/composite).

**World Needs (creative sandbox):** tasks come from what the world needs right then, never as quizzes on tiles. Each mission has School Bot's `trigger` (type, condition, narrative) and `freedom` (open, guided, choice). The **⚑ Needs** board and the event cards in the Missions panel show what the world needs now. Open places can be built any time in an unlocked stage (they wait until the world needs them); guided ones appear when their need does. Upkeep needs make consequences visible: crops and towns dry out without water, homes go dark without power, animals thin out without enough plants. Fixing the need restores the map and posts a "Fixed!" card. A stage unlocks when the earlier stage is done and its blocking needs are met; once unlocked it stays unlocked. Data: `data/world.json`, built by `tools/import_world.py`.

**History events (Then & Now):** 11 School Bot history arcs (`history_events.json`) start from world state (for example, when the first town is built). Each part shows the situation and several perspectives, then peaceful civic choices that move the Trust, Unity, Rights and Economy meters and add a pennant to the map. Writing artifacts (compact, declaration, constitution, compromise, amendment, petition, and others) open in the Writing workspace with frames, key words and a model. Then & Now compares the student's choices with real history, with quoted or paraphrased sources and compare questions (right/wrong feedback while playing; the report shows the student's answers next to the key for the teacher). Safety: no option ever enslaves, buys or sells people, profits from slavery, or uses violence or combat; an automated scan checks every choice when content is imported and again in the game (0 of 63 choices flagged). Teachers can preview every event and its teacher note in `teacher.html` and turn history events off (`index.html?history=off`, or Settings).

**World Showcase (capstone):** School Bot's `showcase.json` and `showcase_prompts.json`. A guided tour with the 5 required stops (Front Gate, Landform Trail, Creature Lab, History Hall, World Systems Expo) plus at least one stop the student picks, each with an editable read-aloud narration script; click-to-explore labels on the student's own map (explanations, Field Guide descriptions, history choices, each tagged with its TEKS); full-screen **Present mode**; a **Standards Evidence** page that marks every TEKS strong, weak or missing by School Bot's evidence rules, with Fix-it buttons; the 95-item checklist; reflection (4 prompts, a self-assessment in words such as "Getting there" or "I could teach it", exit ticket); Two Stars and a Wish peer feedback (on the presenter's device or as a `DAWF1.` code from a visitor's device); and exports in Turn in: multi-page showcase PDF, a self-contained offline slideshow (.html), and a labeled world picture (.png).

**Field Guide (describe and identify):** every landform, resource, water/weather feature and energy source a student places must be described before it counts. Landforms need the process (weathering/erosion/deposition), the agent (water/wind/ice/gravity) and the time scale, (picked visually); until then they show as a faded ghost with a ✎ badge. The Organism Library (46 Texas plants and animals from School Bot's `describe_library.json`) asks students to pick real adaptations from distractors, sort them structure/behavior and inherited/learned, and (for favorites) explain how one helps survival. Putting an organism in the wrong biome asks the student to move it or justify it in writing. GT extras: predict landform change and compare two organisms. Descriptions add tracker evidence for 5.10B/5.10C (landforms) and 5.13A/5.13B (adaptations); they do not change the coverage counts. Content comes from `data/describe.json` (built by `tools/import_describe.py`).

**Fun layer (less typing, a living world):** Field Guide entries are now mostly visual. For a landform the student drags a force (water, wind, ice, gravity) onto the land and watches a time-lapse with a "years passed" clock, then taps what happened and how long it took. Organism traits are dragged onto the creature or tapped, then sorted by tapping. Visual picks count as evidence (weak); a written explanation counts as stronger evidence. **Favorites rule:** each stage, the student stars 2 favorite entries and writes one short explanation (12+ words, optional sentence frames) for each; that is the only required writing in the Field Guide, and the next stage opens when the favorites are written (older saves keep the stages they already had). A student who never types except for those favorites can still reach "strong" for 5.10B/C and 5.13A/B. The map is alive: animated water, clouds and rain, a slow day/night cycle with house lights and chimney smoke, wandering creatures (requestAnimationFrame at about 15 fps, paused when the tab is hidden, off with Settings → Reduced motion or the system's reduced-motion setting). **Survival Season** (Field Guide → Survival Season) runs a season in any biome and weather with up to 6 living things; each one thrives or struggles and the result says why (home, weather, food); the student swaps and runs again. A season where every creature thrives is evidence for 5.13A/5.13B/5.12B. **Townsfolk:** 6 original characters (Mayor Marisol, Ranger Rae, Captain Cumulus, Sparky, Professor Pebble, Archivist Ada) give quests from a bubble on the map and appear on event cards, with short funny lines. **Nature surprises:** gentle events (dry spell, flood, landslide, invasive species, storm) appear as needs with a visible map effect; the student picks the best fix (wrong ideas get feedback) and a "Fixed!" card and confetti follow. Nobody is ever hurt; disasters are shown symbolically. Teachers can turn them off. **Sound** effects (WebAudio, no files) are **muted by default**; the 🔇 button turns them on. Every dialog, prompt and townsfolk line has a 🔊 read-aloud button (speechSynthesis), and Settings has optional auto-read. **Unlocks:** finishing stages unlocks building looks and map themes (shown in a stage celebration) and every Field Guide entry becomes a flip card in **My Collection** (name your creatures on the back).

**Achievements (play only):** 53 achievements in 6 groups (science mastery, creativity and exploration, persistence, civic writing, showcase, writing and math), each with an original SVG medal, a kid-friendly name and a short description (`data/achievements.json`). Some have bronze/silver/gold tiers that reward variety (different landforms, creatures, genres, events solved), never speed, streaks, time played or repetition. Unlocking shows a toast and a chime (silent when sound is muted). The gallery (🏅 header button, or My Collection → Achievements) shows locked ones as silhouettes with a hint; secret ones show "???" until found. Achievements are kept **out of** the TEKS tracker, Turn-in report, PDF/PNG, slideshow, teacher view and class CSV. An optional "My Achievements" Showcase page is off by default and is never exported. Older saves are quietly awarded what they already earned, with one "Welcome back" toast.

## Map (schema 6)
- The map is a 24 x 24 grid of cells drawn as a cozy island: soft blended ground, sandy shore, scattered trees and rocks, all original art made in `js/terrain.js`. The terrain is drawn once on a canvas and cached, and only the animations run each frame (about 15 fps).
- Grid lines are hidden until Grid, (x, y) or Measure is used. While placing, a footprint preview shows where the thing goes. The math stays a square first-quadrant grid (no hexes).
- Old saves move onto the finer grid with every place in the same spot; ordered pairs double. See SAVING.md section 12 and DATA-FORMAT.md.

## Biomes (painted)
- The **Biomes** map tool paints cells with grassland, forest, desert, tundra, wetland, ocean & coast, or mountain (brush 1 x 1 or 3 x 3, tap or drag; the eraser goes back to grassland). Ocean & coast cells become water inside the island. Art and climate facts live in `js/biomes.js` and `js/terrain.js`; the panel, climate cards and the "home changed" event live in `js/biome-ui.js`.
- The wrong-biome check, Survival Season and the Field Guide read the painted biome. Repainting under an organism that no longer fits opens a gentle event: move it, change it back, or keep it and explain (Field Guide evidence for 5.13A/B; no scores).
- The terrain is re-drawn once per paint stroke (cached by the paint string). The math grid is unchanged.

## Civilizations (god game, schema 7)
Students shape land, climate and biomes; then **Start civilizations** on the map. Settlements appear and grow on their own (village, town, city) where the geography supports them: fresh water, coasts and harbors, grassland farmland, mild climate. They group into northern, middle and southern regions (like New England, the Middle Colonies and the Southern Colonies). Problems arrive from a **grade pack** tied to the social studies TEKS. The student answers with a policy, by reshaping the land with the biome brush, or by writing a document (compact, declaration, constitution, amendment, petition, compromise). Consequences unfold over the years (year counter and pause / slow / medium / fast; time waits for every decision), then the student looks back and reads **Then & Now** (School Bot's history events). Counts and statuses only; no scores.
- 5th grade pack (`data/packs/g5.json`, 18 problems): Where people settle, Trade and the economy, Migration and conflict, Government, Changing the environment. 39 Grade 5 SS TEKS.
- The teacher picks the grade in `teacher.html` (Civilizations card) or shares `index.html?grade=g5`. 4th (Texas history), 6th (world cultures) and 7th (Texas history) are listed as coming soon.
- Code: `js/civ-core.js` (pure logic, Node-tested), `js/civ-ui.js`, `css/civ.css`; build packs with `python3 tools/make_packs.py` (checks TEKS codes and scans options for harmful wording).

## Run it
- **Without a server:** double-click `index.html` (works from `file://`; no service worker).
- **Local server:** `python3 -m http.server 8765`, then open http://127.0.0.1:8765/.
- **Web:** copy this folder to `/design-a-world/` on a static host. All paths are relative, and there is no build step. The service worker registers only on http(s).
- **Teacher view:** `teacher.html`.

## Folder map
- `index.html`, `teacher.html`, `css/app.css`, `fonts/` (Lexend, OFL), `icons/`, `manifest.webmanifest`, `sw.js`.
- `js/`:
  - `state.js`: save schema (5), checksum, codes, migration, mission aliases, tracker, in-game badges, writing checklists, neutral evidence wording, hooks for needs/history;
  - `world-core.js` / `world-ui.js`: World Needs, event cards, upkeep consequences, stage gates, history arcs, Then & Now, safety scan;
  - `showcase.js`: World Showcase tour, explore labels, Present mode, Standards Evidence, peer feedback, exports;
  - `describe-core.js` / `describe-ui.js`: Field Guide checks, records, describe-gate, Organism Library, wrong-biome, compare;
  - `art-landforms.js`, `art-organisms.js`, `art-organisms2.js`: landform and organism drawings (original SVG);
  - `fun-core.js` (favorites rule, Survival Season, nature surprises, townsfolk, unlocks, achievements; pure logic), `fun-ui.js` (living map, sound, townsfolk bubble, events, confetti, toasts), `fun-panels.js` (My Collection: cards, achievements, looks; Survival Season), `fun-art.js` (original townsfolk portraits and medal art), `timelapse.js` (landform time-lapse);
  - `checkers.js`;
  - `art-*.js`: original SVG art;
  - `ui.js`, `items.js`, `map.js`, `terrain.js` (cozy island pre-render), `charts.js`;
  - `tasks1-3.js`: activity renderers;
  - `mission.js`, `report.js`, `panels.js`;
  - `work.js`: writing, budget and charts;
  - `app.js`;
  - `vendor/lz-string.min.js` (MIT).
- `data/missions.json`/`.js` (missions), `data/describe.json`/`.js` (Field Guide), `data/world.json`/`.js` (needs, events, history, showcase), `data/fun.json`/`.js` (townsfolk, seasons, nature surprises, looks), `data/achievements.json`/`.js` (achievements).
- `tools/`: `import_schoolbot.py`, `import_describe.py`, `import_world.py` (+ `world_defaults.json`), `check_coverage` (+ `.py`), `make_sw.py`, `make_fun_data.py` (rebuilds `data/fun.js` and `data/achievements.js`), `teks_official.json`, `last_import_report.txt`.
- `tests/`:
  - `unit.test.cjs`, `fun.test.cjs` and `civ.test.cjs` (`node --test tests/unit.test.cjs tests/fun.test.cjs tests/civ.test.cjs`);
  - `shot-civ.cjs` (civilization screenshots 70-74);
  - `e2e.cjs` (`node tests/e2e.cjs http://127.0.0.1:8765/ --shots`; set `SUBFOLDER_URL` to also test a subfolder and offline);
  - `e2e-results.json`.
- `screenshots/`.
- Docs: `CLASSROOM-HOWTO.md`, `SAVING.md`, `DATA-FORMAT.md`, `TEKS-COVERAGE.md`, `AWKWARD-TEKS.md` (School Bot).

## Privacy
- No accounts, ads, analytics, trackers or CDNs.
- Saves stay in the browser plus the files and codes students choose to make. Nothing is sent anywhere.
- Read-aloud uses the browser's built-in Web Speech voice.
- No PhET code, art or trademarks are used; all art is original SVG.

## Natural change and Shaping Energy (G5 rework)
- `js/nature-core.js` (pure, tested in `tests/nature.test.cjs`) extends the civilization engine. As years pass the island
  changes on its own: rivers cut a V-shaped valley, then a canyon, and build a delta at the sea; wind piles sand dunes in
  dry land; delta sediment becomes sedimentary rock layers (compaction + cementation); ice ages (sooner in a cooler
  climate) spread a glacier from the mountains, then melt back and leave a U-shaped valley and a moraine. Landforms
  are kept in `save.civ.nat` and drawn with the existing art. If a problem waits for fresh water and no settlement has
  any, rain forms a stream within 20 years, and the "All is calm" card says what is missing, so no problem stays out of reach.
- Settlements prefer landforms they can use: delta farms, valley passes, rock for building stone, river-mouth ports.
- Problems tied to a landform (`landform` in `data/packs/g5.json`: p-regions, p-scarcity, p-dam, p-dust) open only after
  the student explains how it formed. Three multiple-choice questions (process, agent, timescale) use `describe.json`.
  A wrong answer shows a hint and allows another try. It never costs anything.
- **Shaping Energy** is used in play only, so students cannot simply wreck the world. It is earned once per finished
  mission (3), once per correct explanation answer (2), and once per problem looked back on (2). It is never earned
  for speed or repeats, never deducted for a wrong answer, and never shown in reports, the teacher page, exports, or CSV.
  It is spent in the **Shape** dialog (raise mountains, carve a river, paint a biome, place a town, shift the climate;
  saving 30 unlocks *start an ice age* and saving 40 unlocks *move the coastline*). Cost grows with size and harm:
  +15 for each settlement displaced, +8 for each landform worn away, +5 for each built place covered, and extra for bulk
  changes. A change can cover at most 3x3 cells. Each 50-year era allows 3 changes, and only 1 of them can be a big
  tool. The preview shows the cost and warnings first, and any change that hurts a settlement or landform needs a
  confirm tick. **Undo my last change** restores the land and refunds the energy. The free biome brush cannot paint over
  settlements or landforms.
- `?grade=` accepts `g5`, `5`, `5th`, or `Grade 5`. An unknown id falls back to the default pack.
- Content order: see `WIP-ORDER.md`. The source sheet could not be read, so nothing was reordered.
- Helper bubble (Professor Pebble and the others): it sits below the civ bar and has a × close button. It hides itself
  after 10 seconds (the face stays, with a dot). It also tucks away when the map or civ bar is tapped, so it never
  takes a tap meant for a control.
- Shape over a settlement moves its families to the nearest open, livable land. Only when none is left do they sail
  away safely (the log says so; no one is hurt). Undo brings them back. A spot off the island says "That spot is off
  your island". Time pauses while the biome brush is in use, and ice ages wait until a land task is finished.

## GT challenge layer (Challenge is the default)

**Retest fixes:** Show me is always reachable in Challenge. Every Check on a changed or wrong answer counts, and Show me always opens after the Support number of tries + 3 (a test covers every task). Each CER part needs a word about this problem and must be in the student's own words (text mostly copied from the prompt is caught by matching 3-word runs). A number in Evidence must really appear on the map, in the needs table or in the problem; a landform on the island or an observed detail ("the table shows…", "I saw…") also counts. Predictions and the Show me written attempt need 2 different topic words. Minimums are lower: Challenge 6 words per CER part and 4 per prediction (Support 4 and 3). More linking words count (since, that's why, this shows, if…then, due to, as a result, so that, causes). Feedback is a specific nudge, such as "add a fact you saw on your map".

**r3:** Evidence can also be an observed cause and effect ("When people cut the trees the hills got bare…"). Reasoning no longer needs a linking word. Explanation verbs (hold, feed, help, protect, keep, grow…) count, and without either the student only gets a tip. A bug in `mission.js` was fixed: the main-task try counter was hidden inside a comment, which made the first-try record never set.

**Anti-gaming (playtest fixes):** written checks count only *different real words* (repeats, single letters and keyboard mash such as `asdf`, `qwerty` do not count). Evidence needs a fact, number or observed detail; Reasoning needs a connector (because, so, which means…); Claims and predictions need a topic word. Feedback names what is missing, never a grade. In Challenge, Show me opens strictly later than in Support: more *changed* tries (4 on main tasks, 3 on follow-ups; resubmitting the same answer does not count), or the Support number of tries plus a real written attempt. Challenge earns 1 per mission/quiz/look-back and carries at most 35 energy into a new era (Support 80). The mode is locked when a world is made; `?mode=` only sets new worlds; only a newer teacher setting changes it, with a note in the report.
`js/challenge-core.js` (pure, tested in `tests/challenge.test.cjs`) and `js/challenge-ui.js`.
- **Modes.** Challenge is the default. Support is opt-in: set it in `teacher.html` (Challenge level; applies to students on
  that computer) or give one student a link with `?mode=support`. `?mode=challenge` forces Challenge. The mode is
  saved in `save.civ.mode`.
- **Challenge constraints.** A starting Shaping Energy budget of 4 (Support: 10) and 2 world-shaping changes per era
  (Support: 3). The Regions tab and the land-plan problem show competing needs (farmland, forest, water: have, need, Enough/Short).
- **Open-ended problems** (`open` in `data/packs/g5.json`). In `p-balance` the student shares 12 parcels among farms,
  forest, and water. Many plans are valid, each need has a minimum (higher in Challenge), and every parcel has to be used.
  In the chain problems, every option is a valid fix. Each open problem needs a written claim, evidence, and reasoning
  (at least 10 words per part in Challenge, 5 in Support). A self-check list sits beside it and is never graded.
  The writing is saved in Writing and shown in the report and the teacher view.
- **"Show me"**: Support keeps the old timing (3 tries on the main task, 2 on parts and Field Guide checks). Challenge shows
  it after 2 tries or after a written attempt of 8+ words ("Show your thinking" box).
- **Predictions**: when nature makes a delta, a V-shaped valley, or a dune, the student predicts what it will look like in
  50 years (multiple choice plus a sentence). The change then shows on the map (the delta grows, or shrinks if a dam starves it;
  the dune moves downwind; the valley deepens). The student then looks back: right, partly, or not, and why. The report
  shows each prediction's status (Predicted, watching / Ready to look back / Looked back), not a mark.
- **Consequence chains** (`trigger.chose` + `trigger.yearsAfter`): building the dam leads, 25 years later, to "The delta
  is shrinking". Clearing the forest leads, 20 years later, to "Soil is washing away". If the student chose something
  else, the follow-up problem does not appear.
- **Stretch (Grade 6)**: three optional challenges in the Stretch tab, tagged 6.10C, 6.11B, and 6.12A. Their text was
  checked against 19 TAC §112.26 and is stored in `tools/teks_g6_official.json`; `tools/make_packs.py` fails if the text
  differs. They are marked stretch, sit outside Grade 5 coverage, and never count in the G5 TEKS tracker.

## Read-aloud voice
Reading aloud is tap-only (the Read buttons) and sound stays off by default. Static narration (mission intros, task questions, explain prompts, Then & Now events, landform prompts, and the Grade 5 civilization problems) is read from **pre-made clips** made once with Kokoro-82M (Apache-2.0) and shipped in `audio/` (mono Opus .ogg, 20 kbps). Settings has a plain voice selector (default Heart, American, plus British Emma, Isabella, George, Fable, Lewis), a Preview button, and a speed slider. The choice is stored on this device only (`localStorage` key `daw.voice`), never in save codes, turn-in codes, or reports.

- Heart has a clip for every static line (336 clips). The British voices have the preview line and the Then & Now events; any line a chosen voice lacks is read by Heart. Text a student typed, or personalised text (renamed items), has no clip and uses the browser's own voice.
- That fallback voice is ranked by `js/voice.js`: natural/neural, Google US/UK, and Apple voices first, Microsoft David/Zira/Mark and eSpeak last; only on-device voices are used when offline.
- Clips are found by the exact text (`js/narration.js` builds the strings, `tools/audio_lines.cjs` lists them). The service worker pre-caches the manifest and Heart; other voices are cached the first time they play.
- To remake or extend the clips: `tools/kokoro/make_audio.mjs` (needs Node, ffmpeg, and the Kokoro model download), then `python3 tools/make_audio_manifest.py` and `python3 tools/make_sw.py`. If narration text in the data changes, remake the clips (a test fails if a line has no Heart clip).
