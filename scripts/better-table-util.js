export function isBetterTable(table) {
  return (
    table.data.flags &&
    table.data.flags["better-rolltables"] &&
    table.data.flags["better-rolltables"]["table-type"] == "better"
  );
}

export function isStoryTable(table) {
  return (
    table.data.flags &&
    table.data.flags["better-rolltables"] &&
    table.data.flags["better-rolltables"]["table-type"] == "story"
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
