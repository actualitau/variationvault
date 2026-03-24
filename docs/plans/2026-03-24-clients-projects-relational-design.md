# Clients and Projects Relational Design

## Goal

Replace the current denormalized client/project fields on `Variation` with a relational model where:
- a `Client` owns many `Project` records
- a `Project` owns many `Variation` records
- the UI creates variations by selecting a client, then selecting or creating a project under that client

## Why This Change

The current schema stores client and project information directly on each variation. That makes lookup workflows awkward and creates data drift:
- the same client can be re-entered with slightly different names, emails, or phones
- the same site/project can be recreated multiple times
- reporting by client or project is harder than it needs to be
- future features such as project timelines, client dashboards, and reusable project metadata become harder

The relational model fixes the source-of-truth problem. Variations remain the versioned estimate/approval record, but their ownership becomes explicit.

## Recommended Model

### Client

Primary business contact record.

Suggested fields:
- `id`
- `name`
- `email`
- `phone`
- `company` optional
- `createdAt`
- `updatedAt`

### Project

Physical or business job/site record tied to a client.

Suggested fields:
- `id`
- `clientId`
- `code` or `projectId` style identifier
- `name`
- `address`
- `suburb`
- `state`
- `postcode`
- `createdAt`
- `updatedAt`

### Variation

Versioned estimate/approval artifact tied to a project.

Suggested changes:
- replace current free-text `projectId`, `projectName`, `clientName`, `clientEmail`, `clientPhone`, `address`, `suburb`, `state`, `postcode`
- add relational `projectId` foreign key
- keep estimate-specific fields such as `description`, `measurements`, `items`, `totalLabor`, `totalMaterials`, `tax`, `total`, `status`, `approvalStatus`, `pdfUrl`, `version`

## Snapshot Strategy

Recommended approach:
- use `Client` and `Project` as the primary source of truth
- keep historical estimate-specific content on `Variation`
- do not duplicate client/project text on `Variation` unless required for audit/export stability

If snapshotting becomes necessary later for historical PDFs after project/client edits, add explicit snapshot fields then rather than retaining the current denormalized structure by default.

## API Shape

Add lookup endpoints:
- `GET /api/clients`
- `POST /api/clients`
- `GET /api/projects?clientId=...`
- `POST /api/projects`

Refactor variation creation:
- `POST /api/variations` should accept `projectId` plus variation-specific estimate fields

Variation read responses should include joined relations:
- `project`
- `project.client`
- existing `versionHistory`
- existing `approvals`

## UI Flow

### Variation Creation

Recommended flow:
1. Select an existing client or create one inline
2. Select an existing project for that client or create one inline
3. Enter variation-specific estimate details
4. Save variation against that project

This keeps data entry fast while maintaining normalization.

### List and Detail Views

Variation list/detail screens should render:
- project code/name from the linked project
- client name/email/phone from the linked client
- address from the linked project
- variation estimate and approval fields from the variation itself

## Migration Approach

Use a staged migration:
1. Add `Client` and `Project` models
2. Add `projectId` relation to `Variation`
3. Backfill clients and projects from existing variation rows
4. Update app/API to read from relations
5. Remove obsolete denormalized columns after code is fully migrated

This avoids a risky flag day migration.

## Error Handling

Important validation rules:
- client must exist before project creation unless created inline
- project must belong to the selected client
- variation creation must reject mismatched client/project relationships

## Testing

Tests should cover:
- backfill grouping rules for existing rows
- project lookup filtered by client
- variation creation using project foreign key
- joined variation responses
- UI contract mapping from relational API responses

## Recommendation

Implement full normalization now:
- `Client`
- `Project`
- `Variation -> Project`

This is the cleanest path and matches the intended lookup workflow without preserving the current duplication problem.
