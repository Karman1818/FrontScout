# FrontScout Terminal Demo GIF Guide

This guide explains how to generate or record `assets/demo.gif` for the repository README.

---

## 🎬 Option 1: ScreenToGif (Windows - Recommended & Quickest)

[ScreenToGif](https://www.screentogif.com/) is a lightweight, portable, and free screen recorder for Windows.

1. **Download & Open ScreenToGif** (portable `.exe`).
2. **Setup your Terminal**:
   - Open PowerShell, Windows Terminal, or VS Code terminal.
   - Adjust window size to approximately **960 x 600 px**.
   - Clear the screen: `cls`.
3. **Position the ScreenToGif frame** over your terminal window.
4. **Hit Record (F7)**.
5. **Type and execute the command**:
   ```bash
   npm run audit tests/test-overflow.html
   ```
   *(Or audit a live site: `npm run audit https://fashion-boutique-demo.pl`)*
6. **Let the execution run (~6 seconds)**:
   - FrontScout CLI header appears with colored spinners.
   - Playwright captures dual viewports.
   - Technical Audit Summary outputs with red/yellow indicators and mobile overflow detected (`+544px`).
   - AI Vision analysis outputs Top Critical Issues, CSS fixes, and the ready-to-send cold outreach email snippet.
7. **Pause/Stop (F8)**: Wait ~3 seconds on the final screen so recruiters can read the output.
8. **In ScreenToGif Editor**:
   - Crop any unwanted borders.
   - Delete leading static frames before typing starts.
   - Click **Save As** -> File type: **GIF** -> Destination: `assets/demo.gif`.

---

## 📼 Option 2: VHS (Automated by Charmbracelet)

If you have [VHS](https://github.com/charmbracelet/vhs) installed:

```bash
# Run the tape file
vhs assets/demo.tape
```

This will automatically launch a virtual terminal, type the command, capture the execution, and export `assets/demo.gif`.

