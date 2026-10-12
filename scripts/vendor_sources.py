"""Restore pinned, openly licensed source guidance and record byte provenance."""
import hashlib
import json
from pathlib import Path
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "skills/ui-design-judgment/references/upstream"
SOURCES = [
    {"id": "design-taste", "repo": "arez-xd/ux-ui-design-taste", "revision": "a5c03fb6ac2b6b42f8f183d8514e30e9d032062c", "license": "MIT", "files": {
        "SKILL.md": "skills/design-taste/SKILL.md",
        "LICENSE": "LICENSE",
        **{f"references/{name}.md": f"skills/design-taste/references/{name}.md" for name in ["accessibility-review", "component-taste", "content-realism", "frontend-guardrails", "motion-performance", "motion-taste", "polish-review", "redesign-audit", "shadcn-implementation", "visual-dials"]},
    }},
    {"id": "frontend-design", "repo": "anthropics/skills", "revision": "dbd4588f9e1033efb41dad4bef2f7947c8993d44", "license": "Apache-2.0", "files": {"SKILL.md": "skills/frontend-design/SKILL.md", "LICENSE.txt": "skills/frontend-design/LICENSE.txt"}},
    {"id": "web-interface-guidelines", "repo": "vercel-labs/web-interface-guidelines", "revision": "434b7f91364665f2f733b310ec54809bf8f37937", "license": "MIT", "files": {"command.md": "command.md", "LICENSE": "LICENSE"}},
]

records = []
for source in SOURCES:
    files = []
    for local, remote in source["files"].items():
        url = f"https://raw.githubusercontent.com/{source['repo']}/{source['revision']}/{remote}"
        with urlopen(url, timeout=30) as response:
            data = response.read()
        target = DEST / source["id"] / local
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
        files.append({"path": str(target.relative_to(ROOT)), "sourceUrl": url, "sha256": hashlib.sha256(data).hexdigest()})
    records.append({key: source[key] for key in ["id", "repo", "revision", "license"]} | {"files": files})
(ROOT / "sources.lock.json").write_text(json.dumps({"schemaVersion": 1, "sources": records}, indent=2) + "\n")
print(f"Restored {sum(len(source['files']) for source in records)} pinned source files.")
