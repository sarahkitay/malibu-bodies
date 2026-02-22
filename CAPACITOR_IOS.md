# Malibu Bodies – iOS with Capacitor

This app is wrapped with [Capacitor](https://capacitorjs.com/) so you can build and run it as a native iOS app.

## Prerequisites

- **macOS** with **Xcode** (from the Mac App Store)
- **Apple Developer account** (free for simulator; paid for device/App Store)
- **Node.js** and npm installed

## Quick start

### 1. Build and sync

After any web app changes, rebuild and copy into the iOS project:

```bash
npm run cap:sync
```

This runs `npm run build` and then `npx cap sync ios`.

### 2. Open in Xcode

```bash
npm run cap:open:ios
```

Or: open `ios/App/App.xcworkspace` in Xcode (use the **.xcworkspace** file, not .xcodeproj).

### 3. Run on simulator or device

- In Xcode, pick a simulator or a connected iPhone from the scheme/device menu.
- Press **Run** (▶) or `Cmd + R`.

First time on a **physical device**: select the App target → **Signing & Capabilities** → choose your Team (Apple ID). You may need to set the device to “Trust” the developer in **Settings → General → VPN & Device Management**.

---

## Pushing to the App Store

1. **Apple Developer Program**  
   Enroll at [developer.apple.com](https://developer.apple.com) (paid) if you want to ship to TestFlight or the App Store.

2. **In Xcode**
   - Select the **App** target.
   - Open **Signing & Capabilities** and set your Team and a unique **Bundle Identifier** (e.g. `com.malibubodies.app` is already set in `capacitor.config.ts`).
   - Under **General**, set **Version** and **Build** and choose an app icon if needed.

3. **Archive**
   - Choose **Any iOS Device (arm64)** as the run destination (not a simulator).
   - Menu: **Product → Archive**.
   - When the Organizer appears, click **Distribute App** and follow the steps for **App Store Connect** (and optionally TestFlight).

4. **App Store Connect**
   - Create the app at [appstoreconnect.apple.com](https://appstoreconnect.apple.com), then complete listing, screenshots, and submit the build from Xcode/Organizer.

---

## Config

- **App ID / name**: `capacitor.config.ts` → `appId`, `appName`.
- **Web output**: Vite builds into `dist/`; Capacitor uses that via `webDir: 'dist'`.

To change the iOS bundle ID, update `appId` in `capacitor.config.ts`, then in Xcode change the bundle identifier for the App target to match.
