#!/bin/bash
set -e

TYPE=${1:-patch}

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

# ── Validate ──
VALID_TYPES=("patch" "minor" "major")
if [[ ! " ${VALID_TYPES[*]} " =~ " ${TYPE} " ]]; then
  echo -e "${RED}Invalid type: ${TYPE}${NC}"
  echo "Valid options: patch, minor, major"
  exit 1
fi

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     🚀 terra-trace Release Process           ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════╝${NC}"
echo ""

# ── Step 1: TypeScript Check ──
echo -e "${YELLOW}[1/3] Running TypeScript type check...${NC}"
echo "      tsc --noEmit"
echo ""
if npm run typecheck; then
  echo ""
  echo -e "  ${GREEN}✅ TypeScript check passed${NC}"
else
  echo ""
  echo -e "  ${RED}❌ TypeScript found errors, release aborted${NC}"
  echo "     Fix the errors above and try again."
  exit 1
fi
echo ""

# ── Step 2: Version Bump ──
echo -e "${YELLOW}[2/3] Bumping version (${TYPE})...${NC}"
echo "      npm version ${TYPE} --no-git-tag-version"
echo ""
npm version "${TYPE}" --no-git-tag-version
NEW_VER=$(cat package.json | jq -r '.version')
echo ""
echo -e "  ${GREEN}✅ Version bumped → v${NEW_VER}${NC}"
echo ""

# ── Step 3: Commit ──
echo -e "${YELLOW}[3/3] Committing version bump...${NC}"
echo "      git add package.json package-lock.json"
echo "      git commit -m \"chore: bump version (${TYPE})\""
echo ""
git add package.json package-lock.json
git commit -m "chore: bump version (${TYPE})"
COMMIT_SHA=$(git rev-parse --short HEAD)
echo ""
echo -e "  ${GREEN}✅ Committed (${COMMIT_SHA})${NC}"
echo ""

# ── Summary ──
echo -e "${CYAN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  ✅ Release v${NEW_VER} ready!                    ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${GREEN}✔ TypeScript check${NC}"
echo -e "  ${GREEN}✔ Version bumped to v${NEW_VER}${NC}"
echo -e "  ${GREEN}✔ Committed (${COMMIT_SHA})${NC}"
echo ""
echo -e "  ${YELLOW}━━━ Next step ━━━${NC}"
echo ""
echo -e "  Run the following command to trigger deployment:"
echo ""
echo -e "  ${CYAN}    git push origin main${NC}"
echo ""
echo -e "  This will push the commit to GitHub, and the"
echo -e "  CD workflow will automatically build and deploy"
echo -e "  terra-trace to k3s."
echo ""
