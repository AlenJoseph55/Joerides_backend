/*
  Warnings:

  - You are about to alter the column `hours` on the `Reservation` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Double`.

*/
-- AlterTable
ALTER TABLE `Reservation` MODIFY `hours` DOUBLE NOT NULL;
