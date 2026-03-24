# Clients and Projects Relational Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Normalize the data model so clients and projects are first-class relational entities and variations are created from linked lookups rather than duplicated free-text fields.

**Architecture:** Add `Client` and `Project` Prisma models, migrate `Variation` to reference `Project`, expose lookup APIs for clients/projects, and update the creation/detail/list flows to consume joined relational responses. Use a staged migration so existing data can be backfilled from current variations before removing obsolete columns.

**Tech Stack:** Next.js 14 App Router, TypeScript, Prisma, PostgreSQL, Node test runner, TailwindCSS.

---

### Task 1: Add relational schema contract tests

**Files:**
- Create: `tests/lib/relations-contract.test.mjs`
- Modify: `package.json`

**Step 1: Write the failing test**

Add tests for:
- grouping denormalized variation data into unique clients and projects
- mapping relational variation responses into UI-friendly shapes
- validating that project lookups are client-scoped

**Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --test tests/lib/relations-contract.test.mjs`
Expected: FAIL because helper modules do not exist yet.

**Step 3: Write minimal implementation**

Create pure mapping/backfill helpers.

**Step 4: Run test to verify it passes**

Run: `node --experimental-strip-types --test tests/lib/relations-contract.test.mjs`
Expected: PASS

### Task 2: Introduce Prisma `Client` and `Project` models

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_add_clients_projects/*`

**Step 1: Write the failing test**

Extend relation contract tests with expected relational model shape assumptions.

**Step 2: Run test to verify it fails**

Run: `npm run type-check`
Expected: FAIL once code references relational fields before schema is updated.

**Step 3: Write minimal implementation**

Add:
- `Client`
- `Project`
- `Variation.projectId` foreign key and relation

Temporarily keep current denormalized variation fields during migration.

**Step 4: Run verification**

Run:
- `npx prisma generate`
- `npm run type-check`

Expected: PASS

### Task 3: Add data backfill script for existing variations

**Files:**
- Create: `prisma/backfill-clients-projects.ts`
- Modify: `package.json`

**Step 1: Write the failing test**

Add tests that show repeated client/project text collapses into unique relational records.

**Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --test tests/lib/relations-contract.test.mjs`
Expected: FAIL on missing backfill behavior.

**Step 3: Write minimal implementation**

Create a script that:
- reads existing variations
- creates or reuses clients by normalized contact identity
- creates or reuses projects by normalized client + project/site identity
- links each variation to the correct project

**Step 4: Run test to verify it passes**

Run: `node --experimental-strip-types --test tests/lib/relations-contract.test.mjs`
Expected: PASS

### Task 4: Add lookup APIs for clients and projects

**Files:**
- Create: `src/app/api/clients/route.ts`
- Create: `src/app/api/projects/route.ts`
- Create: `src/lib/relations.ts`

**Step 1: Write the failing test**

Extend tests for client/project lookup filtering and creation payload normalization.

**Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --test tests/lib/relations-contract.test.mjs`
Expected: FAIL

**Step 3: Write minimal implementation**

Add:
- list/create clients
- list/create projects
- client-scoped project filtering

**Step 4: Run verification**

Run:
- `node --experimental-strip-types --test tests/lib/relations-contract.test.mjs`
- `npm run type-check`

Expected: PASS

### Task 5: Refactor variation APIs to use joined relations

**Files:**
- Modify: `src/app/api/variations/route.ts`
- Modify: `src/app/api/variations/[id]/route.ts`
- Modify: `src/lib/variation-contract.ts`
- Modify: `types/index.ts`

**Step 1: Write the failing test**

Add tests for relational variation response mapping.

**Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --test tests/lib/relations-contract.test.mjs`
Expected: FAIL

**Step 3: Write minimal implementation**

Change variation creation to accept `projectId` foreign key and return joined `project/client` data.

**Step 4: Run verification**

Run:
- `node --experimental-strip-types --test tests/lib/relations-contract.test.mjs`
- `npm run type-check`

Expected: PASS

### Task 6: Refactor UI creation flow to lookup client/project

**Files:**
- Modify: `src/app/variations/new/page.tsx`
- Modify: `src/components/CostCalculator.tsx` if needed

**Step 1: Write the failing test**

Add tests for create payload generation from selected `clientId/projectId` context.

**Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --test tests/lib/relations-contract.test.mjs`
Expected: FAIL

**Step 3: Write minimal implementation**

Build a form flow that:
- loads clients
- loads projects by selected client
- supports inline create for missing client/project
- submits variation-specific estimate data plus `projectId`

**Step 4: Run verification**

Run:
- `node --experimental-strip-types --test tests/lib/relations-contract.test.mjs`
- `npm run type-check`

Expected: PASS

### Task 7: Refactor variation list/detail/approval screens to read relational data

**Files:**
- Modify: `src/app/variations/page.tsx`
- Modify: `src/app/variations/[id]/page.tsx`
- Modify: `src/app/approve/[id]/page.tsx`

**Step 1: Write the failing test**

Add tests for rendering/project-client mapping from joined responses.

**Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --test tests/lib/relations-contract.test.mjs`
Expected: FAIL

**Step 3: Write minimal implementation**

Replace all remaining direct variation-owned client/project field assumptions with relation-backed values.

**Step 4: Run verification**

Run:
- `node --experimental-strip-types --test tests/lib/relations-contract.test.mjs`
- `npm run type-check`

Expected: PASS

### Task 8: Remove obsolete denormalized fields after backfill

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_drop_denormalized_variation_fields/*`
- Modify: affected API/UI/types files

**Step 1: Confirm backfill completed**

Run backfill in the target environment and verify all variations have `projectId`.

**Step 2: Write the failing test**

Add or update tests to ensure no contract code depends on removed fields.

**Step 3: Write minimal implementation**

Drop obsolete variation columns only after code and data no longer depend on them.

**Step 4: Run full verification**

Run:
- `npm run test:contracts`
- `node --experimental-strip-types --test tests/lib/relations-contract.test.mjs`
- `npm run type-check`
- `npm run build`

Expected: PASS
