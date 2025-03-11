/*
  Warnings:

  - You are about to alter the column `hours` on the `Reservation` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE `Reservation` MODIFY `hours` DECIMAL(10, 2) NOT NULL;
