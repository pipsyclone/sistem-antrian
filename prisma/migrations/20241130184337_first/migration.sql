-- CreateTable
CREATE TABLE "queuerunning" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "queuerunning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "queue" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'waiting'
);

-- CreateIndex
CREATE UNIQUE INDEX "queuerunning_createdAt_key" ON "queuerunning"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "queue_createdAt_key" ON "queue"("createdAt");

-- AddForeignKey
ALTER TABLE "queue" ADD CONSTRAINT "queue_id_fkey" FOREIGN KEY ("id") REFERENCES "queuerunning"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
