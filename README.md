# Tablet kiosk

A simple, touch-friendly kiosk page with shortcuts for Facebook Messages, Gmail,
the phone dialer, and a custom React display. The display is fetched from the
Python backend and opens automatically after one minute without interaction.

## Run

Requires Python 3. Run:

```sh
python3 server.py
```

Then open `http://127.0.0.1:8000` in the tablet browser. To open the app on a
tablet from another device on the same network, bind the server to the tablet's
network interface with `python3 server.py --host 0.0.0.0`; use the tablet's LAN
address in the browser.

Set `KIOSK_DISPLAY_TITLE` and `KIOSK_DISPLAY_MESSAGE` environment variables to
customize the display content. The call shortcut opens the native dialer with
the number entered in its field. Facebook and Gmail open in the current tab;
use the browser's Back button to return to the kiosk. This avoids creating a
new tab every time a shortcut is selected.

The browser must stay open for the idle display to appear. A web page cannot
wake a tablet after its operating system has put it to sleep; configure the
tablet's kiosk/browser settings to keep the display awake if needed.