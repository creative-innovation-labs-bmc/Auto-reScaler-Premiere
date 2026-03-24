# Auto reScaler for Adobe Premiere Pro 🎬

**Auto reScaler** is a lightweight, mathematically precise CEP extension for Adobe Premiere Pro that automates the tedious process of resizing timelines and scaling individual clips. 

Whether you are upscaling a 1080p edit to 4K, or adapting a 16:9 sequence into a vertical 9:16 social media format, Auto reScaler handles the math, protects your keyframes, and safely backs up your work—all in one click.

<img width="304" height="813" alt="Auto_reScaler Screenshot v1 1 0" src="https://github.com/user-attachments/assets/6367df9d-0e71-4343-87cc-355a6ca9e963" />


---

## ✨ Key Features (Updated in v1.1.0)

* **Social Media Ready:** Built-in presets for 4:5 Social (1080x1350) and 9:16 Vertical (1080x1920).
* **Smart "Match" Multiplier:** Choose to calculate your scale multiplier based on Width or Height. Vertical presets automatically switch to Match Height to prevent letterboxing!
* **One-Click Scaling:** Instantly scales all clips (or just selected clips) to match your new target sequence resolution.
* **Bulletproof Backups:** Natively clones your active sequence as a safe backup in your Project Bin *before* making any changes. 
* **Keyframe Protection:** Automatically detects clips with Scale or Position keyframes and safely skips them to prevent animation breakage.
* **Automated Quality Control:** Drops a distinct red timeline marker on any clip scaled over 100%, allowing you to easily scrub the timeline and check for pixelation/quality loss. Includes a one-click "Clear Markers" button for cleanup.

---

## 🚀 How to Install

This tool is packaged as a standard Adobe `.ZXP` extension.

1. Download the latest `Auto_reScaler_v1.1.0_Release.zip` file from the **Releases** tab on the right.
2. Extract the folder and find the `.ZXP` file.
3. Download a free ZXP installer, such as **[Anastasiy’s Extension Manager](https://install.anastasiy.com/)** or the **[aescripts ZXP Installer](https://aescripts.com/learn/zxp-installer/)**.
4. Close Adobe Premiere Pro.
5. Drag and drop the `.ZXP` file into the installer window.
6. Open Premiere Pro and navigate to **Window > Extensions > Auto reScaler** to launch the panel.

---

## 💻 Developer Notes

Building this required navigating some infamous roadblocks in the Premiere Pro ExtendScript API. 

* **The Timeline-Switching Crash (`EvalScript error`):** Premiere's API often crashes when scripts try to rapidly switch active UI sequences while simultaneously running loops. To bypass this, Auto reScaler renames the active sequence to the new target resolution, clones it, and then renames the *clone* to the original name to serve as the backup. This allows the math to run on the fully-loaded active sequence, ensuring 100% stability.
* **Undo Groups:** ExtendScript `app.project.beginUndoGroup()` is an After Effects feature that causes silent crashes in Premiere. Auto reScaler relies on native sequence cloning instead of script-based undo stacks to provide a bulletproof safety net for the user.

---

### Credits
Created by **[Fooch]** | Version 1.1.0
