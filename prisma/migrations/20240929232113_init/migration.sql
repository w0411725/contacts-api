-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Assignment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "className" TEXT NOT NULL,
    "classProf" TEXT NOT NULL,
    "assignName" TEXT NOT NULL,
    "submission" TEXT NOT NULL,
    "compStatus" BOOLEAN NOT NULL,
    "dueDate" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Assignment" ("assignName", "className", "classProf", "compStatus", "createdAt", "dueDate", "id", "submission") SELECT "assignName", "className", "classProf", "compStatus", "createdAt", "dueDate", "id", "submission" FROM "Assignment";
DROP TABLE "Assignment";
ALTER TABLE "new_Assignment" RENAME TO "Assignment";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
