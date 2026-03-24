# Auto reScaler for Adobe Premiere Pro 🎬

**Auto reScaler** is a lightweight, mathematically precise CEP extension for Adobe Premiere Pro that automates the tedious process of resizing timelines and scaling individual clips. 

Whether you are upscaling a 1080p edit to 4K, or adapting a 16:9 sequence into a vertical 9:16 social media format, Auto reScaler handles the math, protects your keyframes, and safely backs up your work—all in one click.

<img width="304" height="813" alt="Auto_reScaler Screenshot v1 1 0" src="https://github.com/user-attachments/assets/6367df9d-0e71-4343-87cc-355a6ca9e963" />

---

## ✨ Key Features

* **One-Click Scaling:** Instantly scales all clips (or just selected clips) to match your new target sequence resolution.
* **Smart Presets & Match Logic:** Lock your aspect ratio or use built-in presets (HD, QHD 2K, 3K, UHD 4K, DCI 4K, 4:5 Social, 9:16 Vert). A dynamic "Match" dropdown lets you calculate multipliers strictly by Width or Height (and automatically switches to Height for vertical formats to prevent letterboxing).
* **Bulletproof Backups:** Natively clones your active sequence as a safe backup in your Project Bin *before* making any changes. 
* **Keyframe Protection:** Automatically detects clips with Scale or Position keyframes and safely skips them to prevent animation breakage.
* **Automated Quality Control:** Drops a distinct red timeline marker on any clip scaled over 100%, allowing you to easily scrub the timeline and check for pixelation/quality loss. Includes a one-click "Clear Markers" button for cleanup.

---

## 🚀 How to Install

This tool is packaged as a standard Adobe `.ZXP` extension.

1. Download the latest `Auto_reScaler_v1.1.0_Release.zip` file from the **Releases** tab on the right.
2. Extract the folder to access the `.ZXP` file.
3. Download a free ZXP installer, such as **[Anastasiy’s Extension Manager](https://install.anastasiy.com/)** or the **[aescripts ZXP Installer](https://aescripts.com/learn/zxp-installer/)**.
4. Close Adobe Premiere Pro.
5. Drag and drop the `.ZXP` file into the installer window.
6. Open Premiere Pro and navigate to **Window > Extensions > Auto reScaler** to launch the panel.

---

## 🛠️ How to Use

1. Open the sequence you want to scale in your timeline.
2. Click **Load Sequence Info** to pull your current dimensions.
3. Type in your **Target Width/Height** (or use a Preset). 
4. Select whether you want the scale multiplier to **Match Width** or **Match Height**. The script will automatically calculate the exact multiplier.
5. Check your desired safeguards (Backup, Keyframe Skipping, Red QC Markers).
6. Click **Process Sequence**. 

*Note: The script will clone your sequence, leave the backup safely in your bin, and upscale your active timeline. If Premiere's UI tab doesn't immediately update to the new name, simply click the timeline panel or scrub the playhead to force a visual refresh!*

---

## 💻 Developer Notes (The Adobe API Quirks)

Building this required navigating some infamous roadblocks in the Premiere Pro ExtendScript API. If you are exploring the source code, here is how a few key challenges were solved:

* **The Timeline-Switching Crash (`EvalScript error`):** Premiere's API often crashes when scripts try to rapidly switch active UI sequences while simultaneously running loops. To bypass this, Auto reScaler renames the active sequence to the new target resolution, clones it, and then renames the *clone* to the original name to serve as the backup. This allows the math to run on the fully-loaded active sequence, ensuring 100% stability.
* **Undo Groups:** ExtendScript `app.project.beginUndoGroup()` is an After Effects feature that causes silent crashes in Premiere. Auto reScaler relies on native sequence cloning instead of script-based undo stacks to provide a bulletproof safety net for the user.

---

### Credits
Created by **[Fooch]** | Version 1.1.0
