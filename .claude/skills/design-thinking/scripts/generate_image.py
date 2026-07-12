#!/usr/bin/env python3
"""Generate a sketch image via Google Gemini image API (Nano Banana).

Used by the design-thinking skill's image steps [I2] and [P2].

Usage:
  python generate_image.py --prompt-file prompt.txt --out output/sketch.png
  python generate_image.py --prompt "whiteboard sketch of ..." --out sketch.png

Requires:
  GEMINI_API_KEY        environment variable (free key: https://aistudio.google.com/apikey)
  GEMINI_IMAGE_MODEL    optional model override (default: gemini-2.5-flash-image)

No third-party dependencies (stdlib only).
"""

import argparse
import base64
import json
import os
import sys
import urllib.error
import urllib.request

API_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--prompt", help="image prompt text")
    group.add_argument("--prompt-file", help="path to a file containing the prompt")
    parser.add_argument("--out", required=True, help="output image path (.png)")
    parser.add_argument(
        "--model",
        default=os.environ.get("GEMINI_IMAGE_MODEL", "gemini-2.5-flash-image"),
    )
    args = parser.parse_args()

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        sys.exit(
            "GEMINI_API_KEY is not set.\n"
            "Get a free key at https://aistudio.google.com/apikey and set it:\n"
            '  setx GEMINI_API_KEY "YOUR_KEY"   (Windows, then open a new terminal)'
        )

    if args.prompt_file:
        with open(args.prompt_file, encoding="utf-8") as f:
            prompt = f.read().strip()
    else:
        prompt = args.prompt

    body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseModalities": ["IMAGE"]},
    }
    request = urllib.request.Request(
        API_URL.format(model=args.model),
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json", "x-goog-api-key": api_key},
    )

    try:
        with urllib.request.urlopen(request, timeout=180) as response:
            payload = json.load(response)
    except urllib.error.HTTPError as e:
        detail = e.read().decode(errors="replace")[:2000]
        sys.exit(f"API error {e.code}: {detail}")
    except urllib.error.URLError as e:
        sys.exit(f"Network error: {e.reason}")

    candidates = payload.get("candidates") or [{}]
    parts = candidates[0].get("content", {}).get("parts", [])
    for part in parts:
        inline = part.get("inlineData") or part.get("inline_data")
        if inline and inline.get("data"):
            out_dir = os.path.dirname(os.path.abspath(args.out))
            os.makedirs(out_dir, exist_ok=True)
            with open(args.out, "wb") as f:
                f.write(base64.b64decode(inline["data"]))
            print(f"saved: {args.out}")
            return

    sys.exit(f"No image in response: {json.dumps(payload)[:2000]}")


if __name__ == "__main__":
    main()
