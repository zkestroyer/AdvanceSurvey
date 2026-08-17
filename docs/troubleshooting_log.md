# Advance Telecom - Version Troubleshooting Log

This document tracks major issues encountered across different APK builds, their root causes, and the applied solutions. This ensures a permanent historical record to prevent regressions in future versions.

---

## Version 1.0.16 (Latest)

**Issue Reported:**
The new survey forms specified in the provided PDF (Market Visit Format) were not displaying in the mobile app. Fields like "Technology", "Power (Watts)", "Voltage", "IP Rating", and checkboxes for "Reason Unavailability" were missing. Furthermore, dependent dropdowns (Model filtered by Brand) were acting erratically and fetching incorrect lists.

**Root Cause Analysis:**
1. **Missing Backend Schema:** The mobile app renders forms dynamically based on a JSON schema fetched from the backend (`demo.bloomix.io`). The previous developer attempted to force the mobile app to display these fields by writing "override" logic in Dart. However, since the fields didn't exist in the backend database at all, the mobile app had nothing to render.
2. **Broken Scoping in Dropdowns:** The dependent dropdown logic in `survey_execution_screen.dart` scanned the entire `_responses` list for the string "Brand". This caused a cross-contamination bug: if a user selected a brand under "Solar Panels", the "Inverters" section would use the Solar Panel brand to filter its models.
3. **Missing UI Component:** The PDF required a "Multi Select Checkbox", but the Flutter app had no `CheckboxListTile` logic built into its dynamic form renderer.
4. **Numpad Keyboard Not Showing:** The backend was sending Contact Number fields as `type: "text"`, causing the default QWERTY keyboard to appear instead of the numeric keypad.

**Applied Fixes:**
1. **Direct Backend Injection:** Wrote a Node.js script (`update_api.js`) that authenticated with the live API and directly injected the exact PDF format into the `atsolar_db` as the new Active Survey Template (ID 9). This natively stored the correct field types (`dropdown`, `number`, `checkbox`, `text`).
2. **App Logic Cleanup:** Deleted the ~90 lines of hacky override logic in `survey_execution_screen.dart`, allowing the app to natively trust the robust backend schema.
3. **Fixed Dependent Dropdowns:** Updated `_buildDynamicField` to strictly scope the Brand lookup to the `sectionId` of the current field, preventing cross-contamination between different survey sections.
4. **Added Checkbox Support:** Engineered native `checkbox` parsing logic in the Flutter UI builder to support multi-select fields (saving selections as comma-separated strings).
5. **Numpad Resolution:** Because the backend now natively sends `type: "number"`, the mobile app automatically triggers the numeric keypad.

---

## Version 1.0.14 - 1.0.15

**Issue Reported:**
Changes to the forms (such as dropdown logic) were applied to the Flutter codebase but were not reflecting in the APKs distributed to the client.

**Root Cause Analysis:**
1. **Cached Build Artifacts:** Flutter was reusing cached compilation artifacts during the build process.
2. **Stale Local SQLite Database:** The mobile app stores the survey schema in a local SQLite database table (`surveys`). If the app is updated but not uninstalled, or the user does not trigger a fresh sync, the app continues to render the outdated, cached schema.

**Applied Fixes:**
1. Enforced a rigid build pipeline: `flutter clean` -> `flutter pub get` -> `flutter build apk --split-per-abi`.
2. Established standard operating procedure (SOP) requiring complete uninstallation of the old APK prior to testing new form structures to guarantee a fresh SQLite database sync.

---

*End of Log*
