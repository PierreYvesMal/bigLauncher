#!/usr/bin/env python3
"""Serve the local kiosk interface and its display-content API."""

import argparse
import json
import os
from datetime import datetime, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent

# Resolve these once, while main.py runs on the app's main thread. Calling
# autoclass() from the HTTP handler's Python thread makes JNI's FindClass use
# the system classloader, which cannot see org.kivy.android.PythonActivity.
# PythonActivity = autoclass('org.kivy.android.PythonActivity')
# Intent = autoclass('android.content.Intent')

class KioskHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        path = urlsplit(self.path).path
        if path == "/api/display":
            payload = {
                "title": os.environ.get("KIOSK_DISPLAY_TITLE", "A little moment of calm"),
                "message": os.environ.get(
                    "KIOSK_DISPLAY_MESSAGE",
                    "Take a breath, get comfortable, and enjoy your day.",
                ),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
            body = json.dumps(payload).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(body)
            return

        if path == "/healthz":
            self.send_response(200)
            self.send_header("Content-Length", "2")
            self.end_headers()
            self.wfile.write(b"ok")
            return

        super().do_GET()

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

def main():

    parser = argparse.ArgumentParser(description="Run the tablet kiosk app.")
    parser.add_argument("--host", default="127.0.0.1", help="Interface to bind to.")
    parser.add_argument("--port", type=int, default=8001, help="Port to listen on.")
    args = parser.parse_args()

    server = ThreadingHTTPServer((args.host, args.port), KioskHandler)
    print(f"Kiosk ready at http://{args.host}:{args.port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping kiosk server.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()

__version__ = "1.0.3"