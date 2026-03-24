# Relational Rollout Checklist

## Purpose

Safe rollout order for migrating existing production data from legacy variation-owned client/project fields to the new relational `Client` and `Project` model.

## Order

1. Apply the transitional schema that adds:
   - `clients`
   - `projects`
   - `variations.project_ref_id`
2. Generate Prisma client and deploy application code that:
   - writes both legacy fields and `project_ref_id`
   - reads relation-backed data where available
3. Run:
   - `npm run db:backfill-relations`
4. Verify every variation is linked:
   - `SELECT COUNT(*) FROM variations WHERE project_ref_id IS NULL;`
   - expected result: `0`
5. Verify sample data manually:
   - clients deduped correctly
   - projects linked to the right client
   - variations point at the right project
6. Only after verification, prepare the follow-up migration that drops:
   - legacy variation client fields
   - legacy variation address fields
   - legacy variation project name/code duplication if no longer required

## Final Cleanup

After verification of the transitional rollout:
1. Apply `202603240002_drop_legacy_variation_fields`
2. Deploy the relational-only application code

## Notes

- The transitional release uses `variations.project_ref_id` during backfill.
- The final release removes the legacy variation-owned client/project fields and uses `variations.projectId` as the only project foreign key.
