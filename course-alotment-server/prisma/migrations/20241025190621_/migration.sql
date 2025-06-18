/*
  Warnings:

  - You are about to drop the column `courseTitle` on the `teachers` table. All the data in the column will be lost.
  - You are about to drop the column `creditHours` on the `teachers` table. All the data in the column will be lost.
  - You are about to drop the column `semester` on the `teachers` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `teachers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `courses` ADD COLUMN `Pre_Reqs` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `teachers` DROP COLUMN `courseTitle`,
    DROP COLUMN `creditHours`,
    DROP COLUMN `semester`,
    DROP COLUMN `status`;
