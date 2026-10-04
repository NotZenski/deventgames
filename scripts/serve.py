#!/usr/bin/env python3
"""Local preview server that serves /games from games.html, like GitHub Pages does.

Usage: python3 scripts/serve.py   then open http://localhost:8080
"""
import http.server
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
PORT = 8080


class CleanURLHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def send_head(self):
        path = self.path.split("?", 1)[0].split("#", 1)[0]
        if path != "/" and "." not in path.rsplit("/", 1)[-1]:
            candidate = ROOT / (path.lstrip("/") + ".html")
            if candidate.is_file():
                self.path = path + ".html"
        if not (ROOT / self.path.split("?", 1)[0].lstrip("/")).exists():
            self.path = "/404.html"
        return super().send_head()


if __name__ == "__main__":
    print(f"Serving {ROOT} at http://localhost:{PORT}")
    http.server.ThreadingHTTPServer(("", PORT), CleanURLHandler).serve_forever()
