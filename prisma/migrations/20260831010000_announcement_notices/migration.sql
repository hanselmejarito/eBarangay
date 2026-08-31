-- CreateEnum
CREATE TYPE "NoticeChannelStatus" AS ENUM ('SENT', 'RECORDED', 'SKIPPED');

-- CreateTable
CREATE TABLE "AnnouncementNotice" (
    "id" TEXT NOT NULL,
    "announcementId" TEXT NOT NULL,
    "residentId" TEXT NOT NULL,
    "email" TEXT,
    "mobile" TEXT,
    "emailStatus" "NoticeChannelStatus" NOT NULL,
    "smsStatus" "NoticeChannelStatus" NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnnouncementNotice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AnnouncementNotice_announcementId_residentId_key" ON "AnnouncementNotice"("announcementId", "residentId");

-- CreateIndex
CREATE INDEX "AnnouncementNotice_residentId_readAt_idx" ON "AnnouncementNotice"("residentId", "readAt");

-- AddForeignKey
ALTER TABLE "AnnouncementNotice" ADD CONSTRAINT "AnnouncementNotice_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "Announcement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnouncementNotice" ADD CONSTRAINT "AnnouncementNotice_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "Resident"("id") ON DELETE CASCADE ON UPDATE CASCADE;
