# Project Guide

## Purpose

This is a small, touch-first local kiosk for a tablet. Its four main actions are
Facebook Messages, Gmail, the device's phone dialer, and a custom display.
After 60 seconds without interaction, the home menu switches to that display.
This is a browser app: it cannot wake the tablet after the operating system
sleeps, so kiosk deployments must keep the tablet/browser awake.

## Components

- `server.py` serves the static app with Python's standard-library HTTP server.
  `GET /api/display` returns display title and message from
  `KIOSK_DISPLAY_TITLE` and `KIOSK_DISPLAY_MESSAGE`; `GET /healthz` is a
  health check. The default bind is localhost; use `--host 0.0.0.0` only when
  the app needs to be reached over the local network.
- `index.html` loads the styles, React 18 and ReactDOM UMD bundles from
  unpkg.com, and the app script. React therefore needs to be available from the
  network (or browser cache).
- `app.js` implements the React UI, navigation shortcuts, `tel:` dialer link,
  display API request, and idle timer (`IDLE_TIMEOUT_MS`).
- `styles.css` defines the responsive, large-button, touch-friendly layout.
- `README.md` documents how to run and configure the kiosk.

## Development Notes

- Keep the home screen simple, legible, and comfortable to use by touch.
- Keep external destinations as direct links and use the `tel:` URL scheme for
  the native dialer; browser and device support determines whether those apps
  open. Facebook and Gmail links navigate in the current tab, so browser Back
  returns to the kiosk without accumulating tabs. Pause the idle timer while
  the page is hidden and restart it when the kiosk becomes visible.
- The display's content comes from `/api/display`; report request failures in
  the UI rather than silently substituting content.
- There is no build step or third-party Python dependency. Start the app with
  `python3 server.py`. Validate backend changes with Python syntax checks and
  HTTP smoke tests; validate `app.js` with `node --check` when Node.js is
  available. No automated test suite is currently configured.
