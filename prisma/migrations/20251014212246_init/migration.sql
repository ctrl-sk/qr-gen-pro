-- CreateTable
CREATE TABLE "qr_codes" (
    "id" TEXT NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "shortUrl" TEXT NOT NULL,
    "qrData" TEXT NOT NULL,
    "scanCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "gradientColors" TEXT,
    "logoData" TEXT,
    "dotType" TEXT DEFAULT 'dots',
    "cornerEyeType" TEXT DEFAULT 'extra-rounded',
    "cornerEyeColor" TEXT DEFAULT '#CF4500',
    "dotColor" TEXT DEFAULT '#141413',
    "cornerSquareColor" TEXT DEFAULT '#323231',
    "cornerSquareType" TEXT DEFAULT 'extra-rounded',

    CONSTRAINT "qr_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scans" (
    "id" TEXT NOT NULL,
    "qrCodeId" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "qr_codes_shortUrl_key" ON "qr_codes"("shortUrl");

-- AddForeignKey
ALTER TABLE "scans" ADD CONSTRAINT "scans_qrCodeId_fkey" FOREIGN KEY ("qrCodeId") REFERENCES "qr_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
