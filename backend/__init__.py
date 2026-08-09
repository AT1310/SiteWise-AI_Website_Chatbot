import sys
from pathlib import Path

# When running `uvicorn backend.app.main:app` from the project root,
# Python adds the project root to sys.path — but NOT the backend/ directory.
# That means `from core.xxx import` and `from services.xxx import` inside
# backend files cannot be resolved.
#
# Adding backend/ to sys.path here fixes all internal imports without
# requiring any changes to the existing files.
_backend_dir = str(Path(__file__).parent)
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)
