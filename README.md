# Tablet kiosk

A simple, touch-friendly kiosk page with shortcuts for Facebook Messages, Gmail,
the phone dialer, and a custom React display. The display is fetched from the
Python backend and opens automatically after one minute without interaction.

# Setup
```
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```
Since USB is plugged, it's easy to just drag n drop from nautilus to downloads, and seems more reliable. Otherwise:
```
scp index.html app.js styles.css main.py tabletusb:~/bigLauncher
```

# Run

```sh
python3 main.py
```

Open the kiosk page in Chrome. To show the OpenCV activity display above the
home-menu buttons, start the activity script in a second terminal:

```sh
cd Activities
python3 activities.py
```

The browser preview refreshes once per second while the activity script runs.
The kiosk requests a screen wake lock while its page is visible and reacquires
it when the page returns to the foreground. This does not wake a device that
has already gone to sleep; keep the tablet/browser awake if its browser does
not support the Screen Wake Lock API.

# Oldies
## Debug

```
adb logcat | grep -i "I python"
```