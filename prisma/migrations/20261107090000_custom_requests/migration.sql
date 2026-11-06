-- CreateTable
CREATE TABLE "CustomRequest" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fabric" TEXT,
    "description" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "contactedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CustomRequest_contactedAt_createdAt_idx" ON "CustomRequest"("contactedAt", "createdAt");
