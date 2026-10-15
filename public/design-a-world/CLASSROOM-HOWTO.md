# Design a World: Classroom How-To (Grade 5, GT)

## What it is
Students build an island world on a map. Each place they build opens a mission.

**Missions**
- There are 70 missions in four stages.
- They teach every Grade 5 Science TEKS, plus math, writing (ELAR) and social studies TEKS that fit the world.
- Every mission ends with a Claim–Evidence–Reasoning explanation. An optional GT Challenge follows.

**Stages**

| Stage | Topic | Missions |
|---|---|---|
| 1 | Earth & Materials | 17 |
| 2 | Water, Weather & Sky | 13 |
| 3 | Ecosystems & Organisms | 12 |
| 4 | People, Resources, Energy & Forces | 28 |

- A stage opens only when the one before it is finished.
- The science practices (5.1–5.5) run through every stage.
- Later missions reuse places from earlier stages, for example the canyon, the cloud and the farm.

## Opening it
- **From the web:** go to the class link (the planned home is `hacks-hacks.netlify.app/design-a-world/`). This is not deployed yet.
- **From a folder or USB:** open `index.html` directly. It works without internet. The offline cache is used only when it is served from a website.
- Works on Chromebooks in Chrome. It has no logins, ads, trackers or outside fonts or CDNs.

## First day (10 minutes)
1. Students type a first name and class period on the welcome screen. Nothing is sent anywhere.
2. Show the left **Build** palette. A blue dot means "start this mission"; a check means done.
3. Click **Base Camp**, then click a tile on the map. The mission opens.
4. Show the steps: Start → Activity → Explain (CER) → Challenge → Done.
5. Show **Read** (read-aloud), **Hint**, and **Show me** (appears after 3 tries).
6. Show **Saves**: Download save file, Copy save code, Load. Ask students to save the file to Google Drive at the end of each class.

## Tools on the map bar
- **Build, Info, Erase.**
- **Measure:** drag a rectangle for area and perimeter.
- **Volume:** click a building to see l × w × h.
- **Grid, (x, y) coordinates** (first quadrant, 0 to 23), **Compass, Scale** (1 cell side = 1 km), **Legend**, and zoom. The map is a cozy island with no lines by default; grid lines show up when students turn on Grid or (x, y), use Measure, or hover while placing (a green footprint means it fits, red means it doesn't). Big places like towns, lakes and canyons take a 2 x 2 block of cells; small ones take 1 cell.
- **Place at ( x , y ):** places the selected item at an ordered pair.
- **Biomes:** pick a biome and a brush (1 x 1 or 3 x 3), then tap or drag on the island to paint it; the eraser sets cells back to grassland. Students can repaint any time. The **i** button opens a climate card (usual temperature and rain/snow) with a button to start Survival Season in that biome; tapping empty land with Info shows its biome too. If a repaint leaves a placed organism in a biome it doesn't fit, Ranger Rae asks what to do: move it, change it back, or keep it and explain why it could still survive. "Move" and "explain" count as 5.13A/B evidence (shown as "Biome change" in the report); there are no points. Landform dialogs show soft hints (dunes: desert or coast; glacial landforms: tundra; deltas: coast or wetland).

## Panels in the header
- **⚑ Needs:** the World Needs board. It shows what the world needs right now (from each mission's story trigger), upkeep needs (water for crops and towns, power for homes, plants for animals) with how to fix them, the history events and their meters, and a story log. Event cards also appear at the top of the Missions panel. Open places can be built any time in an unlocked stage; their missions start when the world needs them.
- **★ Showcase:** the capstone. Tour (5 required stops + at least one the student picks, with an editable read-aloud script), Explore (tap a place for the student's labels and TEKS), Standards Evidence (strong / weak / missing for every TEKS, with why and Fix-it; statuses, not a grade), Checklist (95 items), Reflection (with a self-assessment in words: Not yet, Getting there, I did it, I could teach it), Peer feedback, and Share & export. **Present mode** is full screen; use the arrow keys, Esc to leave.
- **TEKS:** the tracker, with tabs for Science, Math, Writing and Social Studies. The number on the button is how many TEKS have evidence.
  - Each subject says "N of M TEKS have evidence" and lists every TEKS as done (✔), not yet, or not in this mission set yet (gray). There are no percentages or grades anywhere; you do the scoring.
  - Every Science TEKS has a mission, so a finished world shows every Science TEKS done.
- **XP, levels and badges** are in-game play progression only. They never appear in the Turn-in report, PDF, PNG, Showcase, slideshow or teacher view.
- **Coins:**
  - The budget panel shows income from producers (farm, wind farm, market) and the costs of decorations.
  - Mission places are free grants.
- **☘ Field Guide:** the number on the button is how many placed things still need a description.
  - Landforms: students pick the process, agent and time scale (wrong picks get misconception feedback, and "Show me" appears after 3 tries), then write 15+ words in their own words using sentence frames. A landform stays a faded ghost with a ✎ badge until it is described. Optional GT Predict: how will it change in 10,000 years?
  - Resources, water, weather and energy: identify (for example renewable or nonrenewable), then describe.
  - Organism Library: add plants and animals to biome places. For each one, students pick its real adaptations (some choices are distractors), sort each as structure or behavior and inherited or learned, and explain how it helps the organism survive. A wrong-biome placement asks them to move it or write a 15+ word justification.
  - GT Compare: compare two organisms' adaptations.
  - Every description can be edited later, like a mission (the revision count goes up).
- **✎ Writing:** the writing workspace. It has built-in stage prompts and the mission writing tasks, a checklist of criteria for each kind of writing (criteria only, no points), a word count, and vocabulary and place chips. It autosaves.
- **Charts:** bar, line and dot plots made from the student's own world.
- **Turn in:** PNG picture, print/PDF report, code, or save file.
- **⚙ Settings:** name and period, read-aloud speed, history events on/off, bigger text, less motion.
- **? Help.**

## History events (teacher notes)
- Students meet history events when their world is ready (for example, when the first town is built). Choices are peaceful civic actions; there is never an option to enslave, buy or sell people, profit from slavery, or fight. Slavery is framed as a rights violation, centered on enslaved people's perspectives and actions; imagery is symbolic only.
- `teacher.html` has a **History events** section: every event's teacher note, trigger, choices (with meter effects) and sources, plus the harmful-choice scan result. Use **Preview in the game** to try one.
- To turn history events off: tick the box in `teacher.html` (this computer), share `index.html?history=off`, or use the switch in Settings.

## Civilizations (god game)
- Students press **Start civilizations** on the map. The bar shows the year and time speed (pause, slow, medium, fast). Time stops for every decision, while a dialog is open, and when the tab is hidden.
- Pick the grade pack in `teacher.html` (Civilizations card). Only 5th grade is ready; 4th, 6th and 7th say "coming soon". For other computers use `index.html?grade=g5`.
- What you will see in the report and teacher view: each problem's choice and year, rights picked, votes counted, the student's look-back ("It worked well", "It helped and it hurt", "I would choose differently") and why, plus documents in Writing. No scores. The class CSV has a count of problems looked back on.
- Content rules: every option is peaceful civic action. The American Indian nation in the story was there first and its homeland is never settled; the Then & Now text names broken treaties and removal as violations of rights. Slavery appears only in Then & Now and as a rights violation; on the island no one can ever be owned. Floods and dust storms are gentle, and no one is hurt.

## World Showcase day
- Each student is the tour guide of their own world: 5 required stops plus at least one choice, about 6–7 minutes including questions. The narration lines can be read aloud with the Read button.
- Visitors leave Two Stars and a Wish on the presenter's device (**Add feedback on this device**) or on their own device (`index.html#feedback` makes a code to give the presenter).
- Exports in **Turn in**: Showcase PDF (multi-page), Slideshow (.html, works offline), Labeled world picture (.png).

## Turning in and scoring (the teacher scores)
- Students click **Turn in**. They choose "Current world" or a stage checkpoint, then download the PNG, print or save the PDF, or copy the code.
- If the code is longer than about 8,000 characters, the game tells them to attach the save file instead. This is usual for finished worlds.
- Open **`teacher.html`**.
  - You can paste many codes (one per line) or open many save files at once.
  - The game computes no score, percent or grade. The table shows: name, period, missions finished, stages done, TEKS with evidence (count) and per subject (with evidence / not yet), Standards Evidence statuses (strong / weak / missing counts), words written, **Field Guide** (described / still to describe / organisms), "needs review" count, last saved, and **Verified / Changed**.
  - The full report and the student's PDF include a "Field Guide: descriptions and adaptations" section with every description, a "History events (Then & Now)" section (choices, meters, artifacts, and each Then & Now answer next to the answer key) and a "World Showcase" section (tour, evidence statuses, reflection, feedback). Writing shows the student's checklist as ticked / not-ticked criteria. The TEKS table at the end lists done / not yet for every TEKS with its Standards Evidence status and why, so you can score from it.
  - Click a row for a full report you can print. **Download CSV** gives you the same counts and statuses for your own gradebook (no computed grade).
  - Verified/Changed is a tamper check, **not security**.

## Fun layer (teacher notes)
- **Sound** is muted by default. Students turn it on with the 🔇 header button or in Settings. Nothing plays until they do (no audio is even started). Read-aloud (🔊 buttons, optional auto-read in Settings) uses the browser's voice and works with sound muted.
- **Nature surprises** (dry spell, flood, landslide, invasive species, storm) start after Stage 1 now and then, as needs on the board with a visible map effect. They are gentle: nobody is hurt, and the student fixes them by choosing a good idea. To turn them off for the class: open `teacher.html` → **Fun settings** → check **Turn off nature surprises on this device** (it is saved on that Chromebook), or give students the link `index.html?events=off`. Students can also turn them off in Settings unless you locked them.
- **Motion:** the living map animates gently (about 15 frames a second) and pauses when the tab is hidden. Settings → **Reduced motion** (or the Chromebook's own reduce-motion setting) stops all animation, confetti and time-lapse playback; everything still works.
- **Favorites rule:** each stage, students star 2 favorite Field Guide entries and write one short explanation (12+ words, sentence frames available) for each. The next stage opens once those are written. Everything else in the Field Guide can be done with taps and drags. In Standards Evidence, picks count as weak evidence and written explanations as stronger, so a student who only writes their favorites can still reach "strong".
- **Survival Season** (Field Guide → Survival Season) is a quick "who thrives here?" experiment. A season where every creature thrives counts as evidence for 5.13A, 5.13B and 5.12B.
- **Achievements** are play-only rewards for variety and persistence (never speed or time played). They never appear in the TEKS tracker, Turn-in report, PDF/PNG, slideshow, class CSV or this teacher view. A "My Achievements" Showcase page is off unless the student turns it on, and it is never exported.
- **Looks and themes** unlock as stages are finished. They only change colors on the student's screen; reports and exports are unaffected.

## Tips
- **Absent or new computer?** Load the save file from Drive.
- **Lost autosave** (for example, history was cleared)? Load the last save file or code.
- **Small groups:** each Chromebook keeps one world per browser profile. Use separate profiles, or save and load files.
- **Preview everything as a teacher:** `index.html?unlock=all` opens a separate preview world. `index.html?demo=full` shows a finished sample world. Neither touches student saves.

## Nature and Shaping Energy
The island now changes on its own over time (canyons, deltas, dunes, ice ages, rock layers). Before some problems,
students explain how a landform formed (process, agent, how long). Wrong answers get a hint, never a penalty.
Shaping Energy is a play-only budget for changing the world. It keeps students from wrecking it: big or harmful changes
cost much more, need a preview and a confirm, are limited per era, and can be undone. It never appears in reports,
the teacher view, or CSV. The link `index.html?grade=5` works, and so do `?grade=5th` and `?grade=g5`.

## Challenge level (GT)

The link (`?mode=`) only sets the level of a **new** world. Each world keeps its level after it is made, so students cannot switch by editing the link. Changing the teacher setting updates worlds on that computer the next time they open, and the report notes "changed … by the teacher setting".
Students play in **Challenge** by default. For a student who needs it, pick **Support** on the teacher page (for this
computer) or share the `?mode=support` link. Challenge asks students to balance farms, forest, and water, and to justify
open-ended choices with a claim, evidence, and reasoning. It also asks them to predict how landforms will change and
look back later. Nothing is graded: the teacher view shows their writing, plus statuses such as "Looked back". The
Stretch tab has optional Grade 6 challenges, which sit outside Grade 5 coverage.

## Read-aloud voice
Settings > Read-aloud voice is a plain selector with Preview and a speed slider. Most lessons are read from recorded Kokoro clips that work offline; anything a student typed is read by the Chromebook's own voice. The choice is kept on that computer only and never goes into save codes or reports.
