import {
  isBetterTable,
  isStoryTable,
  rollBetterTable,
  rollStoryTable,
} from "./better-table-util.js";

export function isWorldTable(str) {
  return str.startsWith("@RollTable[");
}

export function isCompendiumTable(str) {
  return str.startsWith("@Compendium[");
}

export async function rollTable(table) {
  if (isBetterTable(table)) {
    return joinResults(await rollBetterTable(table));
  } else if (isStoryTable(table)) {
    return await rollStoryTable(table);
  } else {
    return joinResults(table.roll().results);
  }
}

/**
 * Joins the results of a table roll together with spaces
 * @param {Array.<object>} results
 */
function joinResults(results) {
  return results.map((r) => r.text).join(" ");
}
