# Absurdly True — daily short pipeline (source of truth)

Channel: **Absurdly True** — YouTube `@absurdlytrue_shorts` (vidIQ platformAccountId `UCRvFwaituSFwPXT_uRyf8sQ`),
TikTok account "ActLikeSamTV" (vidIQ platformAccountId `_000oz0HzsPTKfRGKi5OMhhG5nVOLdYoYEmL`).
Content: true stories and general curiosities (history, science, everyday life), told as 25-60 s animated cartoons.
Reference production: `videos/2026-11-12_the-war-over-one-pig/` (approved by the owner as the standard for everything).
Talk to the owner in **Italian**; all on-screen/video text and metadata in **English**.

## Every day
- Publish at the day's slots (see the posting schedule in section 7), one NEW story per day, always WITH captions.
- Never repeat a story: check `STORIES.md` and append the new one.
- Posts are created as vidIQ drafts with `publishAt`; the owner must see and approve them before
  `vidiq_social_post_publish` is called (vidIQ requires it). Send a push/SendUserMessage with the preview and wait.

## 1. Story + script (skills: cartoon-audio-short Stage 2-3, cartoon-3d-short)
- Pick one surprising TRUE story or curiosity with a physical cause/effect that animates well; verify key facts with
  web search; legends must be framed as "legend says". No real living people as jokes, nothing graphic or political.
- Script: hook (absurd fact, no setup) → setting → 2-4 escalating beats → pivot → short ironic twist as last words.
  Plain spoken English, contractions, numbers written as words. The MiniMax voice speaks ~2.6 words/s: 85-110 words
  give 32-43 s.

## 2. Voice (MiniMax, no other TTS)
- Site: https://www.minimax.io/audio/text-to-speech (owner is logged in). Use the **built-in browser** of the
  Claude desktop app (tools `mcp__remote-devices__Claude_Browser__*`; needs the app open on the owner's computer).
- Voice: **"Decent Young Man"** (English), default speed: search it in the voice picker and click its Use button.
- Type the script with the keyboard into the editor (clear it with the eraser button, click the text area first, then
  verify with JS that the text appears exactly once and the counter = script length — JS insertText does not register,
  and a delayed keyboard type can double the text). Generate, check the duration (audio element `duration`).
- Download automatically (no Save-as dialog): read the network request `GET /v1/api/audio/details?audio_id=…`
  (read_network_requests with its requestId) → `audio_url` (https://cdn.hailuoai.video/…mp3) and `curl` it directly
  into `/home/claude/pig/voice.mp3` in the cloud workspace (all domains allowed since 2026-11-14).
- If the computer/app is not reachable: tell the owner (Italian) and retry later; do NOT switch voice provider.

## 3. Timing
- Detect speech segments: `ffmpeg -i voice.mp3 -af silencedetect=noise=-35dB:d=0.18 -f null -`
- Map script phrases (split at punctuation) to segments → `work/phrases.json` (see `engine/work/make_timing.py`).
  Total frames = round(duration × 30). The video lasts exactly as long as the voice.

## 4. Picture (three.js engine in `engine/`)
- Set up: `cp -r engine/* /home/claude/pig/` (absolute paths assume `/home/claude/pig`), then
  `ln -s /opt/npm-tools/node_modules /home/claude/pig/node_modules` (Playwright + Chromium are preinstalled).
  three.js r160 is vendored in `web/three.module.js` (fallback: sparse git fetch of mrdoob/three.js tag r160).
- Engine files: `engine.js` (renderer, two-tone shading, light presets day/golden/night/twilight/interior, ink pass,
  lens blur, grade), `cast.js` (Pen/toon cards: outfits, ARMS poses, props, pig, effect cards), `toon.js` (bridge
  toon.ts + new hats straw/kepi/bicorne/pickel/sailor, beards, custom arms, expressions angry/yell/yawn/bored),
  `world.js` (sets + painted textures), `story.js` (SHOTS: frames, set, light, camera keys, DOF, actors).
- For a new story: write a new `work/PLAN.md` shot table (one shot per phrase, reactions land 0-3 frames before the
  word, vary shot sizes, every hold creeps, kicks on impacts, white flash on time jumps, twist = music stop + push-in),
  then build the needed sets in `world.js` and the shots in `story.js` (reuse builders: pine, bush, patch, cabin,
  flagPole, cannon, ship, tent, sign/text textures, palace room…). Characters are camera-facing cards.
- Look check BEFORE the long render: `node render.mjs stills/a "f1,f2,..."` + `python3 sheet.py stills/a sheet.jpg 8`.
  Fix framing (vertical frame is narrow: stage characters in depth; ±0.5 m width per metre of distance at fov 40),
  cards hidden in geometry, text mirrored, props too close to lens. Remember: looking toward +z, world +x is screen-LEFT.
- Full render: two halves in parallel in the background
  `RESUME=1 node render.mjs frames "0-N/2"` and `PORT=8124 RESUME=1 node render.mjs frames "N/2+1-N"`
  (~5-9 s/frame on 2 CPUs ≈ 1-1.5 h for 40 s; when one half finishes, start a third renderer on the tail of the other).

## 5. Sound (`engine/audio/`)
- `audio.py`: write a new cue table for the story (march-style score with the kit instruments, music STOPS at the twist
  line + sting + drone, SFX on every big event). `mix.py`: **music and SFX at -6 dB vs the voice (50 %)**, gated RMS,
  SFX peaks ≤ 0.7× voice peak, voice untouched. Then `finish.sh "<Title>"`: -14 LUFS, -1 dBFS limiter, H.264 CRF 17,
  freeze/black QA.

## 6. Captions (approved style — always)
- `captions.py` → `out/captions.ass`, burn with
  `ffmpeg -i out/<Title>.mp4 -vf "ass=out/captions.ass:fontsdir=/usr/share/fonts/truetype/google-fonts" -c:v libx264 -preset veryfast -crf 17 -c:a copy`.
- Centre-bottom TikTok/Shorts style, Poppins Bold uppercase white with dark outline, 2-4 words per chunk, current word
  yellow + bigger, pop-in, keywords bigger, numbers as digits. Update the KEY set and DISPLAY overrides per story.

## 7. Publish (vidIQ)
- Hosting (owner-authorized 2026-11-14, every run): the Cowork scheduled task has no repository attached, so `git push`
  is always refused by the git proxy. Instead:
  - Video: `mcp__Higgsfield__media_upload` (filename `<Title_With_Underscores>.mp4`, video/mp4) → `curl -X PUT -H
    "Content-Type: video/mp4" -H "If-None-Match: *" --data-binary @out/final_captions.mp4 '<upload_url>'` (expect 200) →
    `media_confirm` (type video) → `vidiq_video_upload` with the returned cloudfront `url`. Storage only: 0 credits
    (check `mcp__Higgsfield__balance` before/after; stop and tell the owner if it ever changes).
  - Repo text files (STORIES.md, PIPELINE.md, videos/<date>_<slug>/metadata.md with the video URL): push with the GitHub
    connector `mcp__github__push_files` (owner ingvince, repo absurdly-true, branch main). Never push mp4/mp3 there.
- SEO & reach checklist (owner request: fill EVERY available field, maximise discoverability — always):
  1. Research: `vidiq_keyword_research` on the topic (main keyword + 2-3 variants: people, place, year, "true story",
     "history facts"); check `vidiq_trending_videos` / `vidiq_outliers` for the niche to borrow proven angles and hashtags.
  2. Titles: write 5 candidates (`vidiq_generate_titles` can help), score them with `vidiq_score_title`, keep the best.
     Main keyword in the first ~40 chars (Shorts feed cuts long titles), curiosity gap, 1 emoji, end with `#shorts`, ≤ 100.
  3. YouTube description (≥ 600 chars, keyword-rich, natural): hook line with main keyword; 3-5 sentences telling the
     story with names, place, year and the "absurd" twist; a comment-bait question ("Would you have fired the shot? 👇");
     "📜 A true story…", "🔔 Subscribe for a new absurdly true story every day!", "📱 Also on TikTok: @AbsurdlyTrue_Shorts";
     then 5-8 hashtags (first 3 = most relevant, they show above the title; never more than 15).
  4. YouTube tags: fill toward the 500-char limit (20-30 tags): main keyword, variants, names, place, year, era, topic
     phrases, "absurdly true", "history shorts", "true story", "did you know", "weird history", "history facts".
  5. YouTube settings: categoryId 27 (Education), privacyStatus public, publishAt = today's YouTube slot. Custom
     thumbnail (`thumbnailImageId`) only if the channel is verified — Shorts usually ignore it, so skip if refused.
  6. TikTok caption (TikTok search is SEO): first line = hook with main keyword + emoji; 2-3 lines of story with the
     keywords written as plain words (names, place, year); a comment-bait question; "Follow for a new absurdly true
     story every day! 📜"; 6-8 hashtags mixing broad (#history #truestory #historytok #didyouknow #fyp) and niche topic
     tags from the research. privacyLevel PUBLIC_TO_EVERYONE, allowComment true, musicUsageConfirmed true,
     isAiGenerated true (mandatory disclosure), brandContent/brandOrganic false; publishAt = today's TikTok slot.
  7. In the video itself (biggest factor): hook in the first 1-2 s with the keyword on screen in the captions, no slow
     intro, loop-friendly ending. Never fake facts, clickbait that the video doesn't deliver, or irrelevant hashtags.
- Posting schedule (Europe/Rome): Mon/Tue/Thu YT 19:00, TikTok 20:00 · Wed YT 19:00, TikTok 20:30 ·
  Fri YT 17:00, TikTok 18:00 · Sat/Sun YT 18:00, TikTok 19:00. Draft ready ≥3 h before the YouTube slot.
- One draft with two destinations, show it to the owner, publish only after approval. Log the story in `STORIES.md`.
- Local copy (owner request, from 2026-11-13 on): save ONLY the final captioned version (the one published) to the
  owner's PC in `Desktop\YOUTUBE CHANNEL\` (C:\Users\penne\Desktop\YOUTUBE CHANNEL), named `<Title_With_Underscores>.mp4`
  (e.g. `The_War_Over_One_Pig.mp4`). The folder is attached to the scheduled task (no access request needed):
  SendUserFile → device_commit_files with the fileUuid; retry up to 3 times on timeout. Never copy final_nocaptions.mp4 there.

## Brand
- `brand/banner_2560x1440.png` (title + slogan in the all-devices safe area, cast in the desktop band),
  `brand/profile_800x800.png` (top-hat gentleman with monocle). Channel description and TikTok bio are in `CHANNEL.md`.
