function isBetterTable(table) {
  return (
    table.data.flags &&
    table.data.flags["better-rolltables"] &&
    table.data.flags["better-rolltables"]["table-type"] == "better"
  );
}

async function rollTable(table) {
  if (isBetterTable(table)) {
    return await rollBetterTable(table);
  } else {
    return table.roll().results;
  }
}

async function rollBetterTable(table) {
  const result = await game.betterTables.getBetterTableResults(table);
  return result;
}

/**
 * Joins the results of a table roll together with spaces
 * @param {Array.<object>} results
 */
function joinResults(results) {
  return results.map((r) => r.text).join(" ");
}

/**
 * Gets the result from a roll table. Synchronous.
 * @param {string} displayName
 * @resturn {Array.<object>} the result of the roll
 */
async function getRollTableResult(displayName) {
  // get the table by its ID
  const endIndex = displayName.indexOf("]");
  const table_id = displayName.substring(11, endIndex);
  const table = game.tables.entities.find((t) => t._id === table_id);

  if (table) {
    return await rollTable(table);
  } else {
    ui.notifications.error("Can't find a table that matches " + displayName);
  }
}

/**
 * Gets the results from a compendium table. Asynchronous.
 * @param {string} displayName
 * @returns {Promise}
 */
async function getCompendiumTableResult(displayName) {
  // get the identifier
  const endIndex = displayName.indexOf("]");
  const idParts = displayName.substring(12, endIndex).split(".");

  // sanity check that it matches the expected format
  if (idParts.length !== 3) {
    throw new Error(
      `Expected format to match @Compendium[module.table.id] Got: ${displayName}`
    );
  }

  // get pack
  const packId = `${idParts[0]}.${idParts[1]}`;
  const pack = game.packs.get(packId);
  if (!pack) {
    throw new Error(`Couldn't find a compendium with id ${packId}`);
  }

  // get table
  const table = await pack.getEntity(idParts[2]);

  if (!table) {
    throw new Error(
      `Couldn't find table with id ${idParts[2]} in pack ${packId}`
    );
  }

  // check if is better table
  const results = await rollTable(table);
  if (!results || !results.length) {
    throw new Error(`Couldn't roll table id ${idParts[2]} in pack ${packId}`);
  }
  return results;
}

/**
 * ------------------------------------------------------------------------------
 * Initialize the All Goblins Have NAmes module
 */
Hooks.on("ready", () => {
  Hooks.on("preCreateToken", (scene, tokenData) => {
    const displayName = tokenData.name.trim();
    const isWorldTable = displayName.startsWith("@RollTable[");
    const isCompendiumTable = displayName.startsWith("@Compendium[");
    if (isWorldTable || isCompendiumTable) {
      // clear token name so we don't display software gore to the user
      tokenData.name = " ";
      // temporarily put it here so we can access it in our async function
      tokenData.flags._nameTable = displayName;
    }
  });
  Hooks.on("createToken", async (scene, tokenData) => {
    const tableStr = tokenData.flags._nameTable;
    if (!tableStr) {
      return;
    }
    // clean up our temporary storage
    delete tokenData.flags._nameTable;

    try {
      let resultPromise = tableStr.startsWith("@RollTable[")
        ? getRollTableResult(tableStr)
        : getCompendiumTableResult(tableStr);

      const token = canvas.tokens.get(tokenData._id);
      if (!token) {
        throw new Error("Couldn't find token to update.");
      }

      resultPromise.then((result) => {
        token.update({ name: joinResults(result) });
      });
    } catch (e) {
      console.warn("[All Goblins Have Names]: " + e.message);
    }
  });
});
