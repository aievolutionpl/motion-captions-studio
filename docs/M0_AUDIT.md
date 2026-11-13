# M0 foundation audit — 2026-11-13

Base: FableCut 1.18.0, upstream 579b08ec1a789baec5cbf06d7430373460508d09.
Decision: proceed with this fork for the next development slice. Full M0 remains open.

## Verified
- Node test suite: 536 passed, 0 failed, 0 skipped.
- Upstream release-check: passed.
- Local editor HTTP server started on 127.0.0.1:7788.
- MCP read and patch worked against the local project. A stale baseRevision was rejected.
- Source HEVC MOV decoded and transcoded by FFmpeg to a four-second H.264 local proxy. Native HEVC import into the UI is not yet verified.
- Headless export completed through the existing compositor: 1080x1920, 30 fps, 360 frames, 12 seconds, H.264 BT.709, AAC 48 kHz stereo, approximately 5.1 MB.
- Export job wall time: approximately 76 seconds, including headless startup. This is one cold run, not a performance guarantee.
- Sampled exported frames visually inspected: mixed-font text, text moving along an ellipse, and person foreground occluding the title.

## Limits
No new caption engine or UI feature is implemented yet. The fixture uses existing FableCut primitives.
The footage already has burned-in graphics; it is only a technical fixture and stays outside Git.
Mask temporal stability, detailed audio sync, native HEVC playback, interactive drag/undo/reopen, performance and memory measurements remain unverified.
Tracking was not exercised. Text-on-path is a manually specified ellipse, not automatic silhouette extraction.
The model used is upstream MediaPipe, not BiRefNet.

## Next slice
Build editable caption scenes using existing comps and word timing, starting with clean, bold and editorial styles. Preserve shared GUI/MCP commands and renderer. First add a clean fixture, verify interactive editing and export fidelity, then evaluate whether a higher-quality mask worker is necessary.

## Local artifacts (not committed)
../local-data/project.json
../local-data/tests.log
../local-data/render-review.jpg
../local-data/exports/Motion Captions M0_master_1080x1920.mp4

Run the editor with scripts/start-studio.ps1. MCP uses FABLECUT_PORT=7788; server uses PORT=7788.
