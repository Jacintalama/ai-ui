#!/usr/bin/env python3
"""Capture 1280x800 PNG previews of the 5 new design templates from local files.

Spins up a tiny HTTP server (so ES modules load — file:// won't work),
loads each template at the local URL, waits for networkidle + 2s settle,
saves the PNG to _tplpng/new-<key>.png.

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
ROOT = Path(__file__).resolve().parents[1]
TEMPLATE_APPS = ROOT / "mcp-servers" / "tasks" / "template_apps"
OUT_DIR = ROOT / "_tplpng"


@contextmanager
def serve_dir(directory: Path):
    """Start a one-shot HTTP server rooted at `directory`. Yields the port."""
    handler = lambda *a, **kw: http.server.SimpleHTTPRequestHandler(
        *a, directory=str(directory), **kw
    )
    sock = socket.socket()
    sock.bind(("127.0.0.1", 0))
    port = sock.getsockname()[1]
    sock.close()
    server = http.server.HTTPServer(("127.0.0.1", port), handler)
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
            with serve_dir(tdir) as port:
                url = f"http://127.0.0.1:{port}/index.html"
                print(f"\n=== {key} ===\n  loading {url}")
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
