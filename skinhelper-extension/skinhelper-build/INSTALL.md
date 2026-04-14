# SkinHelper - Installation Guide

## Chrome / Brave / Edge / Opera (Chromium browsers)
1. Extract the skinhelper ZIP to a permanent folder on your PC
2. Open your browser and go to: `chrome://extensions` (or `brave://extensions` / `edge://extensions`)
3. Enable **Developer mode** (toggle in top-right corner)
4. Click **Load unpacked**
5. Select the `skinhelper` folder
6. Done ✅

---

## Firefox
1. Extract the skinhelper ZIP to a permanent folder on your PC
2. Open Firefox and go to: `about:debugging#/runtime/this-firefox`
3. Click **Load Temporary Add-on**
4. Navigate into the `skinhelper` folder and select `manifest.json`
5. Done ✅

> **Note:** Firefox temporary add-ons are removed when Firefox restarts.
> For permanent installation, the extension would need to be signed by Mozilla (addons.mozilla.org).
> For personal use, you can re-load it each time or use Firefox Developer Edition which allows unsigned extensions permanently.

---

## Safari (Mac only)
Safari requires converting the extension using Xcode. Steps:

### Prerequisites
- macOS with Xcode installed (free from App Store)
- Apple Developer account (free tier works)

### Steps
1. Open Terminal and run:
   ```
   xcrun safari-web-extension-converter /path/to/skinhelper --app-name SkinHelper --bundle-id com.skinhelper.extension
   ```
2. This generates an Xcode project — open it
3. Click **Run** (▶) in Xcode to build and install
4. In Safari: go to **Safari > Settings > Extensions**
5. Enable **SkinHelper**
6. Done ✅

---

## How to use
1. Click the SkinHelper icon in your browser toolbar
2. Start typing a skin name — Buff prices load automatically from the dropdown
3. Enter the Roll coin price
4. The verdict shows instantly (Overpriced / Underpriced / Fair)
5. Your referral code **cyborgjoshi** is auto-applied on CSGORoll deposit pages silently
