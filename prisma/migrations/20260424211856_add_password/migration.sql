/*
  Warnings:

  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- Step 1: Add the column as nullable
ALTER TABLE "User" ADD COLUMN "password" TEXT;

-- Step 2: Update existing rows with a default hashed password
UPDATE "User" SET "password" = '$2b$10$60U/PSVfjWj3zH4ZyYllW.6jvXWPZImG1AKZnP2FEoMEkrPt1eObO' WHERE "password" IS NULL;

-- Step 3: Make the column NOT NULL
ALTER TABLE "User" ALTER COLUMN "password" SET NOT NULL;
