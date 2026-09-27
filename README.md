# YouTube Comments Extractor

This repository contains two JavaScript tools to easily extract and download comments from any YouTube video. The scripts automate the process of scrolling to load all comments and extracting them into a clean, readable text file.

## Features

- **Automated Scrolling:** Automatically scrolls to the bottom of the page to load all comments.
- **Reply Expansion:** Automatically clicks "Show more replies" and "Read more" to capture all hidden text and nested comments (Dashboard script only).
- **One-Click Export:** Automatically generates and downloads a `.txt` file containing the author and content of every comment.
- **No Dependencies:** Pure Vanilla JavaScript. No need to install any browser extensions or Python packages.

---

## 🛠️ Included Tools

### 1. `youtube_dashboard_script.js` (Recommended)
This script injects a sleek UI dashboard directly into the YouTube page, giving you a 1-click button to start extraction, along with a live progress bar and status updates.

**How to use:**
1. Open the YouTube video page you want to extract comments from.
2. Open your browser's Developer Tools (Right-click anywhere -> **Inspect**, or press `F12` / `Ctrl+Shift+I`).
3. Navigate to the **Console** tab.
4. Copy the entire contents of `youtube_dashboard_script.js`.
5. Paste it into the console and press **Enter**.
6. A red "🛠️ Auto-Extractor" button will appear in the bottom right corner of the video page.
7. Click the button, open the dashboard, and click **🚀 Start Auto-Extraction**. 
8. Do not interact with the page while it works. The file will download automatically when finished!

### 2. `youtube_console_script.js`
A simpler, headless version of the extractor that runs silently in the console without adding any UI elements to the page.

**How to use:**
1. Open the YouTube video page.
2. Open your browser's Developer Tools -> **Console**.
3. Copy the entire contents of `youtube_console_script.js`.
4. Paste it into the console and press **Enter**.
5. Wait. The script will log its progress in the console.
6. A text file containing all the comments will download automatically when it finishes scrolling.

---

## Output Format

The generated `.txt` file is formatted cleanly for easy reading:

```text
YouTube Comments Extraction
Video URL: https://www.youtube.com/watch?v=...
Total Comments: 150

===================================================

Author: John Doe
Comment:
This video was incredibly helpful, thank you!
---------------------------------------------------

Author: Jane Smith
Comment:
I have a question about the second step...
---------------------------------------------------
```

## Disclaimer

This tool is for educational purposes. Please be respectful of YouTube's Terms of Service and API limits when scraping large amounts of data.
