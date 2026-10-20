#!/usr/bin/env python3
"""Resolve template content from this skill's bundled references/ directory."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

try:
    from common import (
        TemplateResolutionError,
        resolve_template_content,
        skill_references_dir,
    )
except ImportError:  # pragma: no cover - direct execution from unusual cwd
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    from common import (
        TemplateResolutionError,
        resolve_template_content,
        skill_references_dir,
    )


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("template_name")
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args(argv)

    references_dir = skill_references_dir(Path(__file__))
    try:
        content = resolve_template_content(args.template_name, references_dir)
    except TemplateResolutionError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1
    if content is None:
        print(
            f"ERROR: Could not resolve required {args.template_name} from this "
            "skill's references/ directory",
            file=sys.stderr,
        )
        return 1

    if args.json:
        print(
            json.dumps(
                {
                    "TEMPLATE_NAME": args.template_name,
                    "TEMPLATE_CONTENT": content,
                },
                ensure_ascii=False,
                separators=(",", ":"),
            )
        )
    else:
        sys.stdout.write(content)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
