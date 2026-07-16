-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Person" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "treeId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "birthDate" DATETIME,
    "birthPlace" TEXT,
    "deathDate" DATETIME,
    "deathPlace" TEXT,
    "isRemembranceNode" BOOLEAN NOT NULL DEFAULT false,
    "photoUrl" TEXT,
    "bio" TEXT,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "x" INTEGER NOT NULL DEFAULT 0,
    "y" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Person_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES "Tree" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Person" ("bio", "birthDate", "birthPlace", "createdAt", "deathDate", "deathPlace", "firstName", "id", "isRemembranceNode", "lastName", "metadata", "photoUrl", "treeId") SELECT "bio", "birthDate", "birthPlace", "createdAt", "deathDate", "deathPlace", "firstName", "id", "isRemembranceNode", "lastName", "metadata", "photoUrl", "treeId" FROM "Person";
DROP TABLE "Person";
ALTER TABLE "new_Person" RENAME TO "Person";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
