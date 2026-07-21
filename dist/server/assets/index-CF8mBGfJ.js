import { T as TSS_SERVER_FUNCTION, c as createServerFn } from "../server.js";
import { PrismaClient } from "@prisma/client";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "react";
import "@tanstack/react-router";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
var createServerRpc = (serverFnMeta, splitImportFn) => {
  const url = "/_serverFn/" + serverFnMeta.id;
  return Object.assign(splitImportFn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const globalForPrisma = global;
const prisma = globalForPrisma.prisma || new PrismaClient();
const getTreeData_createServerFn_handler = createServerRpc({
  id: "5cb8c752510335e707b5688104581db46303f437afaebc436b245c16a1cdbe97",
  name: "getTreeData",
  filename: "src/routes/index.tsx"
}, (opts) => getTreeData.__executeServer(opts));
const getTreeData = createServerFn({
  method: "GET"
}).handler(getTreeData_createServerFn_handler, async () => {
  const tree = await prisma.tree.findFirst({
    select: {
      id: true,
      name: true
    }
  });
  if (!tree) {
    throw new Error("No family tree found in database. Please run seed script.");
  }
  const focusPerson = await prisma.person.findFirst({
    where: {
      treeId: tree.id
    },
    orderBy: {
      birthDate: "asc"
    }
  });
  if (!focusPerson) {
    throw new Error("Focused person not found");
  }
  const allPeople = await prisma.person.findMany({
    where: {
      treeId: tree.id
    }
  });
  const allRelationships = await prisma.relationship.findMany({
    where: {
      treeId: tree.id
    }
  });
  const formattedPeople = allPeople.map((p) => {
    const spouseRel = allRelationships.find((r) => r.type === "spouse" && (r.personId1 === p.id || r.personId2 === p.id));
    let spouseName = "None";
    if (spouseRel) {
      const spouseId = spouseRel.personId1 === p.id ? spouseRel.personId2 : spouseRel.personId1;
      const spouseObj = allPeople.find((x) => x.id === spouseId);
      if (spouseObj) {
        spouseName = `${spouseObj.firstName} ${spouseObj.lastName || ""}`;
      }
    }
    return {
      ...p,
      spouse: spouseName,
      birthDate: p.birthDate ? new Date(p.birthDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      }) : "Unknown",
      deathDate: p.deathDate ? new Date(p.deathDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      }) : null
    };
  });
  return {
    treeId: tree.id,
    treeName: tree.name,
    focusPerson: formattedPeople.find((x) => x.id === focusPerson.id) || formattedPeople[0],
    people: formattedPeople,
    relationships: allRelationships
  };
});
export {
  getTreeData_createServerFn_handler
};
