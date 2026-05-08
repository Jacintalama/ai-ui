#!/usr/bin/env python3
"""Capture 1280x800 PNG previews of the 5 new design templates from local files.

Spins up a tiny HTTP server (so ES modules load — file:// won't work),
loads each template at the local URL, waits for networkidle + 2s settle,
saves the PNG to _tplpng/new-<key>.png.

Each template's index.html is served with `<%= APP_NAME %>` substituted
to a per-template demo name so the gallery preview shows a real-feeling
brand instead of the literal placeholder. The on-disk source files keep
the placeholder; only the served bytes are rewritten in flight.

Usage (from the repo root):
    pip install playwright
    python -m playwright install chromium
    python _tplpng/capture-local-templates.py
"""
import http.server
import socket
import threading
from contextlib import contextmanager
from pathlib import Path

from playwright.sync_api import sync_playwright

TEMPLATES = ["agency", "restaurant", "photography", "event", "real-estate"]

# Per-template demo name to substitute into <%= APP_NAME %>. Picked to
# match each template's tone — the gallery viewer should see a finished-
# looking brand, not a placeholder token.
DEMO_NAMES = {
    "agency":      "Halftone",
    "restaurant":  "La Maison",
    "photography": "Mara Lin",
    "event":       "DevCon Berlin",
    "real-estate": "42 Maple Street",
}

ROOT = Path(__file__).resolve().parents[1]
TEMPLATE_APPS = ROOT / "mcp-servers" / "tasks" / "template_apps"
OUT_DIR = ROOT / "_tplpng"


def make_handler(directory: Path, replacements: dict[str, str]):
    """Return a SimpleHTTPRequestHandler subclass that substitutes
    `<%= APP_NAME %>` (and any other text replacements) in served HTML."""
    class Handler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=str(directory), **kwargs)

        def do_GET(self):
            if self.path.endswith(".html") or self.path == "/" or self.path.endswith("/"):
                # Resolve the file path the way SimpleHTTPRequestHandler would.
                rel = self.path.lstrip("/")
                if rel == "" or rel.endswith("/"):
                    rel = rel + "index.html"
                file_path = directory / rel
                if file_path.is_file():
                    try:
                        text = file_path.read_text(encoding="utf-8")
                        for needle, repl in replacements.items():
                            text = text.replace(needle, repl)
                        body = text.encode("utf-8")
                        self.send_response(200)
                        self.send_header("Content-Type", "text/html; charset=utf-8")
                        self.send_header("Content-Length", str(len(body)))
                        self.end_headers()
                        self.wfile.write(body)
                        return
                    except Exception as e:
                        self.send_error(500, f"substitution failed: {e}")
                        return
            # Default: serve as-is (CSS, JS, images, etc.).
            super().do_GET()

        def log_message(self, *_):
            pass  # silence per-request log spam

    return Handler


@contextmanager
def serve_dir(directory: Path, replacements: dict[str, str]):
    """Start a one-shot HTTP server that rewrites HTML in flight. Yields the port."""
    handler_cls = make_handler(directory, replacements)
    sock = socket.socket()
    sock.bind(("127.0.0.1", 0))
    port = sock.getsockname()[1]
    sock.close()
    server = http.server.HTTPServer(("127.0.0.1", port), handler_cls)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield port
    finally:
        server.shutdown()
        server.server_close()


def main():
    OUT_DIR.mkdir(exist_ok=True)
    results = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={"width": 1280, "height": 800})
        page = ctx.new_page()
        for key in TEMPLATES:
            tdir = TEMPLATE_APPS / key
            if not (tdir / "index.html").exists():
                print(f"  SKIP {key} — index.html missing")
                continue
            replacements = {"<%= APP_NAME %>": DEMO_NAMES[key]}
            with serve_dir(tdir, replacements) as port:
                url = f"http://127.0.0.1:{port}/index.html"
                print(f"\n=== {key} ({DEMO_NAMES[key]}) ===\n  loading {url}")
                try:
                    page.goto(url, wait_until="networkidle", timeout=15_000)
                except Exception as e:
                    print(f"  WARN: {e}")
                page.wait_for_timeout(2_000)  # Alpine + Tailwind + fonts settle
                out = OUT_DIR / f"new-{key}.png"
                page.screenshot(path=str(out), full_page=False)
                size = out.stat().st_size
                print(f"  saved {out} ({size:,} bytes)")
                results.append((key, size))
        browser.close()
    print(f"\nDone. {len(results)} screenshots captured.")


if __name__ == "__main__":
    main()
