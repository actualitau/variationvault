CREATE TABLE "clients" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "company" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "projects" (
  "id" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "suburb" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "postcode" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "variations"
ADD COLUMN "project_ref_id" TEXT;

CREATE INDEX "clients_email_idx" ON "clients"("email");
CREATE INDEX "projects_clientId_idx" ON "projects"("clientId");
CREATE INDEX "variations_project_ref_id_idx" ON "variations"("project_ref_id");

ALTER TABLE "projects"
ADD CONSTRAINT "projects_clientId_fkey"
FOREIGN KEY ("clientId") REFERENCES "clients"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "variations"
ADD CONSTRAINT "variations_project_ref_id_fkey"
FOREIGN KEY ("project_ref_id") REFERENCES "projects"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
