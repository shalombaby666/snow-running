# Snow Running Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first playable browser version of Snow Running, a pixel-art Christmas maze game for solo or two-player local play, with an optional online leaderboard.

**Architecture:** Use Phaser for the 2D game canvas and TypeScript/Vite for the browser application. Keep levels as grid data, separate movement and enemy logic from rendering, and keep game progress local; the leaderboard client calls a separately configured Supabase endpoint and gracefully stays offline when that endpoint is unavailable.

**Tech Stack:** TypeScript, Phaser, Vite, HTML/CSS, browser localStorage, Supabase REST/Edge Function.

**Spec:** `docs/superpowers/specs/2026-11-15-snow-running-design.md`

## Global Constraints

- The game is an HTML5 browser game and supports one or two players on one keyboard.
- Player 1 uses arrow keys and Space; Player 2 uses WASD and E.
- The campaign target is 33 levels; the first playable build uses a small sample campaign with a large first maze.
- A run starts with three shared lives. At zero lives, the campaign restarts at level one; cosmetic unlocks persist locally.
- Online scores are optional. Gameplay remains available offline, and no secret service key is shipped to the browser.
- Use original Christmas characters and pixel-art visuals.
- Do not implement online co-op in this release.

---

## File Structure

- `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`: browser application setup.
- `src/main.ts`: application entry point and Phaser boot.
- `src/styles.css`: responsive page shell, menus, HUD, overlays, and pixel-art presentation.
- `src/game/config.ts`: canvas size, tile size, and shared game constants.
- `src/game/scenes/BootScene.ts`: load authored sprite and audio assets.
- `src/game/scenes/MenuScene.ts`: title screen, solo/co-op selection, and controls.
- `src/game/scenes/GameScene.ts`: level session lifecycle and system coordination.
- `src/game/scenes/ResultScene.ts`: game-over, campaign completion, and score submission choice.
- `src/game/data/levels.ts`: typed maze definitions and campaign order.
- `src/game/data/levelAudit.ts`: flood-fill reachability audit for player starts, gifts, exits, enemy spawns, and all walkable cells.
- `scripts/audit-levels.ts`: command-line report for every authored sample level.
- `src/game/entities/Player.ts`: player input, grid movement, facing, collision, and action.
- `src/game/entities/Enemy.ts`: enemy movement state and type-specific decisions.
- `src/game/systems/IceSystem.ts`: create/break ice in the facing direction.
- `src/game/systems/EnemyDirector.ts`: patrol, chase, and interception decisions.
- `src/game/systems/RunState.ts`: lives, collected items, score, level transitions, and reset rules.
- `src/game/systems/LocalSave.ts`: persist score history and costume unlocks locally.
- `src/game/ui/Hud.ts`: lives, gifts remaining, score, and level display.
- `src/game/art/PixelArt.ts`: original small pixel-art textures built from crisp pixel shapes and a shared palette.
- `src/leaderboard/client.ts`: optional score submission and leaderboard retrieval.
- `src/leaderboard/types.ts`: leaderboard request/response types.
- `supabase/functions/submit-score/index.ts`: validate public score submissions before insertion.
- `supabase/migrations/001_leaderboard.sql`: leaderboard table and access policy.
- `.env.example`: names of browser-safe public endpoint settings, without credentials.
- `README.md`: local launch, controls, offline behavior, and leaderboard setup.

## Implementation Tasks

### Task 1: Create the browser game shell

**Files:** `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/main.ts`, `src/styles.css`, `src/game/config.ts`

- [x] Initialize the Vite + TypeScript project and add Phaser as the 2D engine.
- [x] Add an adaptive game container with a crisp pixel-art rendering mode and full-screen layout.
- [x] Boot Phaser from `src/main.ts` using the shared configuration in `src/game/config.ts`.
- [x] Add the title screen with Snow Running branding, solo/co-op selection, and keyboard instructions.
- [x] Add `npm run dev` and `npm run build` scripts and document local startup in `README.md`.

### Task 2: Add the authored level format and Christmas art

**Files:** `src/game/data/levels.ts`, `src/game/art/PixelArt.ts`, `src/game/scenes/BootScene.ts`

- [x] Define a typed tile grid for walls, paths, gifts, exit, ice, and enemy spawn points.
- [x] Author a large first maze and two follow-up levels that introduce movement, collecting, ice actions, and enemy behaviors in sequence.
- [x] Keep vertical openings away from horizontal divider rows and audit the whole floor graph from the player start.
- [x] Introduce one new idea at a time across the sample levels: collect and exit; create/break ice; then combine ice with a new enemy behavior.
- [x] Draw a cohesive small palette and original pixel sprites for Santa, Snow Maiden, gingerbread guide Kuki, gifts, trees, snow, ice, and the three enemy types.
- [x] Load the art assets in `BootScene.ts` and render tile layers with nearest-neighbor scaling.

### Task 3: Implement movement, collection, and level transitions

**Files:** `src/game/entities/Player.ts`, `src/game/scenes/GameScene.ts`, `src/game/systems/RunState.ts`, `src/game/ui/Hud.ts`

- [x] Implement grid-aligned movement for Player 1 with arrow keys and Player 2 with WASD.
- [x] Keep each player on walkable tiles and preserve their current facing direction for the action button.
- [x] Collect gifts and bonus items, update score and remaining-object count, and open the exit only after required gifts are collected.
- [x] Add the HUD for score, shared lives, current level, and remaining gifts.
- [x] Transition to the next level when a player reaches the unlocked exit; complete the sample campaign after its final level.

### Task 4: Add ice actions and distinct enemy behavior

**Files:** `src/game/systems/IceSystem.ts`, `src/game/entities/Enemy.ts`, `src/game/systems/EnemyDirector.ts`, `src/game/scenes/GameScene.ts`

- [x] Bind Space to Player 1's action and E to Player 2's action.
- [x] Create or break a short straight run of ice cells in front of the player, stopping at solid walls and respecting the maze bounds.
- [x] Prevent ice from appearing on players, gifts, exits, or enemy spawn cells.
- [x] Implement a corridor patroller that turns at walls, a chaser that follows the nearest player, and an ambusher that targets a point ahead of a player.
- [x] Make ice block or redirect enemies without trapping them permanently in unreachable parts of a level.

### Task 5: Complete local solo and co-op run flow

**Files:** `src/game/scenes/MenuScene.ts`, `src/game/scenes/GameScene.ts`, `src/game/scenes/ResultScene.ts`, `src/game/systems/RunState.ts`, `src/game/systems/LocalSave.ts`, `src/game/ui/Hud.ts`

- [x] Make solo mode create one player and co-op mode create Santa and Snow Maiden on a shared keyboard.
- [x] Start a run with three shared lives and decrement one on enemy contact.
- [x] On zero lives, return the run to level one and reset the campaign score and collected objects.
- [x] Persist local best score and unlocked cosmetic costumes between runs.
- [x] Show a clear game-over screen with restart and title-screen actions.
- [x] Add a simple costume selection that changes appearance only, including Santa and Ded Moroz looks.

### Task 6: Add optional online leaderboard

**Files:** `src/leaderboard/types.ts`, `src/leaderboard/client.ts`, `supabase/functions/submit-score/index.ts`, `supabase/migrations/001_leaderboard.sql`, `.env.example`, `src/game/scenes/ResultScene.ts`

- [x] Define score entries with a sanitized display name, numeric score, campaign level reached, and submission time.
- [x] Create the Supabase leaderboard table and public read policy; route submissions through an Edge Function rather than exposing a privileged database key.
- [x] Validate display-name length and score bounds in the Edge Function before inserting a row.
- [x] Read public endpoint configuration from environment variables and keep the online leaderboard disabled if configuration is absent.
- [x] Add a name-entry prompt and submit the final run score when the player chooses to post it.
- [x] Show the online leaderboard when connected and keep local gameplay and local records available when offline.

### Task 7: Document the finished prototype and publishing path

**Files:** `README.md`, `docs/superpowers/specs/2026-11-15-snow-running-design.md`

- [x] Document the game loop, controls, sample campaign, score rules, and local save behavior.
- [x] Document how to run the game locally and build its static HTML5 output.
- [x] Run `npm run audit:levels` before production bundling to catch unreachable maze cells and goals.
- [x] Document the Supabase project setup and environment variables needed to enable online scores.
- [x] Update the spec with any design decisions made while implementing the prototype.

## Design References

- Phaser is a browser-focused 2D framework with Canvas/WebGL rendering: <https://docs.phaser.io/>.
- itch.io accepts HTML/JavaScript/CSS game bundles for direct browser play: <https://itch.io/docs/creators/html5>.
- Bad Ice-Cream demonstrates distinct enemy behaviors and using ice walls to alter pursuit: <https://nitrome.wiki.gg/wiki/Bad_Ice-Cream>.
- GDC level-design teaching materials recommend introducing mechanics in safe, focused spaces before combining them: <https://media.gdcvault.com/gdc2024/Slides/GDC%2Bslide%2Bpresentations/TeachingLevelDesign_Totten.pdf>.
