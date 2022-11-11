export function isBetterTable(table) {
  return (
    table.flags &&
    table.flags["better-rolltables"] &&
    table.flags["better-rolltables"]["table-type"] == "better"
  );
}

export function isStoryTable(table) {
  return (
    table.flags &&
    table.flags["better-rolltables"] &&
    table.flags["better-rolltables"]["table-type"] == "story"
  );
}

export async function rollBetterTable(table) {
  const result = await game.betterTables.getBetterTableResults(table);
  return result;
}

export async function rollStoryTable(table) {
  const result = await game.betterTables.getStoryResults(table);
  return result.storyHtml;
}
