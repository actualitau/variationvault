ALTER TABLE "variations" DROP CONSTRAINT IF EXISTS "variations_project_ref_id_fkey";
DROP INDEX IF EXISTS "variations_project_ref_id_idx";

ALTER TABLE "variations"
DROP COLUMN IF EXISTS "projectName",
DROP COLUMN IF EXISTS "clientName",
DROP COLUMN IF EXISTS "clientEmail",
DROP COLUMN IF EXISTS "clientPhone",
DROP COLUMN IF EXISTS "address",
DROP COLUMN IF EXISTS "suburb",
DROP COLUMN IF EXISTS "state",
DROP COLUMN IF EXISTS "postcode";

ALTER TABLE "variations"
DROP COLUMN IF EXISTS "project_ref_id";

ALTER TABLE "variations"
ADD CONSTRAINT "variations_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "projects"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
