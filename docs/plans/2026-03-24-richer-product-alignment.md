# Richer Product Alignment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor the app so the frontend, API routes, and Prisma-backed workflow consistently use the richer estimate/project model.

**Architecture:** Keep the existing Prisma schema and most server-side domain concepts as the canonical model. Introduce shared mapping and validation helpers so the app router pages consume a stable richer variation shape, then align approval and export flows to that contract.

**Tech Stack:** Next.js 14 App Router, TypeScript, Prisma, PostgreSQL, jsPDF, TailwindCSS, Node test runner.

---

### Task 1: Establish verification and shared contract helpers

**Files:**
- Create: `tests/lib/variation-contract.test.js`
- Create: `src/lib/variation-contract.ts`
- Modify: `package.json`

**Step 1: Write the failing test**

Add tests that describe:
- mapping API data into the list/detail UI shape
- mapping create-form input into the richer DTO payload
- normalizing approval decisions into API statuses

**Step 2: Run test to verify it fails**

Run: `node --test tests/lib/variation-contract.test.js`
Expected: FAIL because `src/lib/variation-contract.ts` does not exist yet.

**Step 3: Write minimal implementation**

Implement pure helpers for:
- `buildCreateVariationPayload`
- `mapVariationToSummary`
- `mapVariationToDetail`
- `normalizeApprovalDecision`

**Step 4: Run test to verify it passes**

Run: `node --test tests/lib/variation-contract.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add package.json tests/lib/variation-contract.test.js src/lib/variation-contract.ts
git commit -m "test: add variation contract helpers"
```

### Task 2: Align create flow with richer DTO

**Files:**
- Modify: `src/app/variations/new/page.tsx`
- Modify: `src/components/CostCalculator.tsx`
- Modify: `src/components/PhotoUpload.tsx`
- Modify: `src/app/api/variations/route.ts`

**Step 1: Write the failing test**

Extend contract tests to assert the create form payload includes required richer fields and derived totals.

**Step 2: Run test to verify it fails**

Run: `node --test tests/lib/variation-contract.test.js`
Expected: FAIL on missing required richer payload fields.

**Step 3: Write minimal implementation**

Update the create page to collect richer estimate fields and submit the canonical DTO shape. Keep mobile-first layout, but remove obsolete `jobId/reason/scopeChange` assumptions.

**Step 4: Run test to verify it passes**

Run: `node --test tests/lib/variation-contract.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/variations/new/page.tsx src/components/CostCalculator.tsx src/components/PhotoUpload.tsx src/app/api/variations/route.ts tests/lib/variation-contract.test.js
git commit -m "feat: align variation creation with richer schema"
```

### Task 3: Align list and detail pages with richer variation model

**Files:**
- Modify: `src/app/variations/page.tsx`
- Modify: `src/app/variations/[id]/page.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/components/Header.tsx`

**Step 1: Write the failing test**

Extend contract tests to assert list/detail mappings expose project name, client info, totals, status, and PDF/export affordances from the richer model.

**Step 2: Run test to verify it fails**

Run: `node --test tests/lib/variation-contract.test.js`
Expected: FAIL because the current mappings still expect the old simple fields.

**Step 3: Write minimal implementation**

Refactor list/detail pages to render project-centric data and remove dead navigation targets.

**Step 4: Run test to verify it passes**

Run: `node --test tests/lib/variation-contract.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/variations/page.tsx src/app/variations/[id]/page.tsx src/app/page.tsx src/components/Header.tsx tests/lib/variation-contract.test.js
git commit -m "feat: align variation views with richer model"
```

### Task 4: Normalize approval and export contracts

**Files:**
- Modify: `src/app/approve/[id]/page.tsx`
- Modify: `src/app/api/approvals/route.ts`
- Modify: `src/app/api/export/route.ts`
- Modify: `src/lib/email.ts`

**Step 1: Write the failing test**

Extend contract tests to assert approval decision normalization and export request method/query handling.

**Step 2: Run test to verify it fails**

Run: `node --test tests/lib/variation-contract.test.js`
Expected: FAIL because the current approval page/API disagree on payload shape and export uses the wrong method.

**Step 3: Write minimal implementation**

Make the approval page and route share one status contract, update final variation status correctly, and ensure export is invoked using the implemented route contract. Fix notification writes so they use a real variation id.

**Step 4: Run test to verify it passes**

Run: `node --test tests/lib/variation-contract.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/approve/[id]/page.tsx src/app/api/approvals/route.ts src/app/api/export/route.ts src/lib/email.ts tests/lib/variation-contract.test.js
git commit -m "fix: normalize approval and export flows"
```

### Task 5: Verify end-to-end buildability

**Files:**
- Modify: `package.json`
- Modify: any files required to satisfy type-check/build verification

**Step 1: Run focused tests**

Run: `node --test tests/lib/variation-contract.test.js`
Expected: PASS

**Step 2: Run type-check**

Run: `npm run type-check`
Expected: PASS

**Step 3: Run production build**

Run: `npm run build`
Expected: PASS

**Step 4: Commit**

```bash
git add .
git commit -m "chore: verify richer product alignment"
```
