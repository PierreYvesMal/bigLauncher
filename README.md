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
scp index.html app.js styles.css main.py tablet:~/bigLauncher
```

# Run

Requires Python 3. Run:

```sh
python3 server.py
```

And open a chrome web page

# Oldies
## Debug

```
adb logcat | grep -i "I python"
```