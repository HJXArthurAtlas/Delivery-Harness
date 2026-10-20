"""Shared helpers for the bundled Python scripts."""

from __future__ import annotations

import json
import os
import re
import sys
from dataclasses import dataclass
from pathlib import Path


def _trim_trailing_separators(value: Path) -> str:
    text = str(value)
    while len(text) > 1 and text.endswith((os.sep, "/")):
        text = text[:-1]
    return text


def find_specify_root(start_dir: Path | None = None) -> Path | None:
    # TODO: project-root marker is currently the .git directory; revisit when a
    # dedicated SDD marker is introduced.
    current = (start_dir or Path.cwd()).resolve()
    while True:
        if (current / ".git").exists():
            return current
        parent = current.parent
        if parent == current:
            return None
        current = parent


def resolve_specify_init_dir() -> Path:
    raw = os.environ.get("SPECIFY_INIT_DIR", "")
    candidate = Path(raw)
    if not candidate.is_absolute():
        candidate = Path.cwd() / candidate
    try:
        init_root = candidate.resolve(strict=True)
    except OSError:
        print(
            f"ERROR: SPECIFY_INIT_DIR does not point to an existing directory: {raw}",
            file=sys.stderr,
        )
        raise SystemExit(1)
    if not init_root.is_dir():
        print(
            f"ERROR: SPECIFY_INIT_DIR does not point to an existing directory: {raw}",
            file=sys.stderr,
        )
        raise SystemExit(1)
    if not (init_root / ".git").exists():
        print(
            "ERROR: SPECIFY_INIT_DIR is not a spec-driven development project "
            f"(no .git directory): {init_root}",
            file=sys.stderr,
        )
        raise SystemExit(1)
    return init_root


def get_repo_root(script_file: Path | None = None) -> Path:
    if os.environ.get("SPECIFY_INIT_DIR"):
        return resolve_specify_init_dir()

    specify_root = find_specify_root()
    if specify_root is not None:
        return specify_root

    if script_file is not None:
        script_root = find_specify_root(script_file.resolve().parent)
        if script_root is not None:
            return script_root

    return Path.cwd().resolve()


def get_current_branch() -> str:
    return os.environ.get("SPECIFY_FEATURE", "")


def read_feature_json_feature_directory(repo_root: Path) -> str:
    feature_json = repo_root / "docs" / "memory" / "feature.json"
    if not feature_json.is_file():
        return ""
    try:
        data = json.loads(feature_json.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError):
        return ""
    value = data.get("feature_directory") if isinstance(data, dict) else None
    return value if isinstance(value, str) else ""


def _json_dump(data: dict[str, str]) -> str:
    return json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n"


def persist_feature_json(repo_root: Path, feature_dir_value: str) -> None:
    # Strip the repo root prefix lexically (no resolve()) to mirror the
    # Bash/PowerShell helpers: with a symlinked <repo>/specs, resolve() would
    # escape the repo and persist a machine-specific absolute path instead of
    # the relative "specs/NNN-name" the other variants store.
    value = feature_dir_value
    relative = Path(value)
    if relative.is_absolute():
        try:
            value = relative.relative_to(repo_root).as_posix()
        except ValueError:
            value = str(relative)

    current = read_feature_json_feature_directory(repo_root)
    if current == value:
        return

    memory_dir = repo_root / "docs" / "memory"
    memory_dir.mkdir(parents=True, exist_ok=True)
    (memory_dir / "feature.json").write_bytes(
        _json_dump({"feature_directory": value}).encode("utf-8")
    )


@dataclass(frozen=True)
class FeaturePaths:
    repo_root: Path
    current_branch: str
    feature_dir: Path
    feature_spec: Path
    impl_plan: Path
    tasks: Path
    research: Path
    data_model: Path
    quickstart: Path
    contracts_dir: Path


def get_feature_paths(
    *, no_persist: bool = False, script_file: Path | None = None
) -> FeaturePaths:
    repo_root = get_repo_root(script_file)
    current_branch = get_current_branch()

    # SPECIFY_FEATURE_NO_PERSIST is the environment-level equivalent of no_persist=True,
    # letting an orchestrator (multi-agent runner, CI matrix) guarantee that no
    # script invocation in the process tree writes docs/memory/feature.json, even
    # scripts that don't pass no_persist themselves (#4128).
    no_persist = no_persist or os.environ.get("SPECIFY_FEATURE_NO_PERSIST", "") in ("1", "true")

    feature_dir_raw = os.environ.get("SPECIFY_FEATURE_DIRECTORY", "")
    if feature_dir_raw:
        feature_dir = Path(feature_dir_raw)
        if not feature_dir.is_absolute():
            feature_dir = repo_root / feature_dir
        if not no_persist:
            persist_feature_json(repo_root, feature_dir_raw)
    elif (repo_root / "docs" / "memory" / "feature.json").is_file():
        stored = read_feature_json_feature_directory(repo_root)
        if not stored:
            print(
                "ERROR: Feature directory not found. Set SPECIFY_FEATURE_DIRECTORY "
                "or ensure docs/memory/feature.json contains feature_directory.",
                file=sys.stderr,
            )
            raise SystemExit(1)
        feature_dir = Path(stored)
        if not feature_dir.is_absolute():
            feature_dir = repo_root / feature_dir
    else:
        print(
            "ERROR: Feature directory not found. Set SPECIFY_FEATURE_DIRECTORY "
            "or run the specify command to create docs/memory/feature.json.",
            file=sys.stderr,
        )
        raise SystemExit(1)

    if not current_branch:
        current_branch = Path(_trim_trailing_separators(feature_dir)).name

    return FeaturePaths(
        repo_root=repo_root,
        current_branch=current_branch,
        feature_dir=feature_dir,
        feature_spec=feature_dir / "spec.md",
        impl_plan=feature_dir / "plan.md",
        tasks=feature_dir / "tasks.md",
        research=feature_dir / "research.md",
        data_model=feature_dir / "data-model.md",
        quickstart=feature_dir / "quickstart.md",
        contracts_dir=feature_dir / "contracts",
    )


_SAFE_COMPONENT_PATTERN = re.compile(r"[a-z0-9-]+")


def _is_safe_component(value: object) -> bool:
    return (
        isinstance(value, str)
        and _SAFE_COMPONENT_PATTERN.fullmatch(value) is not None
    )


def skill_references_dir(script_file: Path) -> Path:
    """Return the calling skill's bundled references/ directory."""
    return script_file.resolve().parent.parent / "references"


class TemplateResolutionError(RuntimeError):
    """Raised when a template cannot be resolved or read safely."""


def resolve_template(template_name: str, references_dir: Path) -> Path | None:
    """Resolve a template name to the skill's bundled references/ copy.

    Templates are self-contained in each skill's references/ directory; the
    project-layer override stack (.specify/templates, presets, extensions)
    has been removed.
    """
    if not _is_safe_component(template_name):
        return None
    candidate = references_dir / f"{template_name}.md"
    return candidate if candidate.is_file() else None


def resolve_template_content(template_name: str, references_dir: Path) -> str | None:
    """Read the resolved template content, or None when absent."""
    path = resolve_template(template_name, references_dir)
    if path is None:
        return None
    try:
        return path.read_bytes().decode("utf-8")
    except (OSError, UnicodeError) as exc:
        raise TemplateResolutionError(
            f"Failed to read template '{template_name}': {exc}"
        ) from exc


def format_pack_command(command_name: str) -> str:
    """Format the pack slash-command path for a core workflow step.

    Example: ``format_pack_command("specify")`` returns ``/ncw-speckit-specify``.
    """
    name = command_name.lstrip("/")
    if name.startswith("ncw-speckit-"):
        name = name[len("ncw-speckit-") :]
    return f"/ncw-speckit-{name}"
