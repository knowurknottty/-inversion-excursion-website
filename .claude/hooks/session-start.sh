#!/bin/bash
set -euo pipefail

# Only run in remote (Claude Code on the web) environments
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# Verify Python 3 is available (required for convert.py build tool)
python3 --version

# Verify convert.py can be imported/parsed without errors
python3 -c "import ast; ast.parse(open('${CLAUDE_PROJECT_DIR}/convert.py').read())" \
  && echo "convert.py syntax OK"

echo "Session start: environment ready for Inversion Excursion book project"
