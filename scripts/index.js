function AllGoblinsHaveNames() {
  /**
   * Gets the result from a roll table. Synchronous.
   * @param {string} displayName
   * @resturn {Array.<object>} the result of the roll
   */
  function getRollTableResult(displayName) {
    // get the table by its ID
    const endIndex = displayName.indexOf("]");
    const table_id = displayName.substring(11, endIndex);
    const table = game.tables.entities.find((t) => t._id === table_id);

    if (table) {
      const roll = table.roll();
      return roll.results;
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

    const results = table.roll().results;
    if (!results || !results.length) {
      throw new Error(`Couldn't roll table id ${idParts[2]} in pack ${packId}`);
    }
    return results;
  }

  // TODO: Pending BetterTables compatibility
  // function isBetterTable(table) {
  //   return (
  //     table.data.flags &&
  //     table.data.flags["better-rolltables"] &&
  //     table.data.flags["better-rolltables"]["table-type"] == "better"
  //   );
  // }
  // async function rollBetterTable(table) {
  //   const result = await game.betterTables.getBetterTableRoll(table);
  //   return result;
  // }

  /**
   * Joins the results of a table roll together with spaces
   * @param {Array.<object>} results
   */
  function joinResults(results) {
    return results.map((r) => r.text).join(" ");
  }

  /**
   * ------------------------------------------------------------------------------
   * Initialize the All Goblins Have NAmes module
   */

  // since rolls on @RollTables are synchronous, we can update the name before the
  // token is created.
  Hooks.on("preCreateToken", (scene, tokenData) => {
    const displayName = tokenData.name.trim();

    // RollTable
    if (displayName.startsWith("@RollTable[")) {
      const results = getRollTableResult(displayName);
      tokenData.name = joinResults(results);
    }
  });

  // since rolls on @Compendium tables are asynchronous, we  must update the name
  // after the token is created
  Hooks.on("createToken", async (scene, tokenData) => {
    const displayName = tokenData.name.trim();

    // @Compendium
    if (displayName.startsWith("@Compendium[")) {
      try {
        const result = await getCompendiumTableResult(displayName);
        const token = canvas.tokens.get(tokenData._id);
        if (!token) {
          throw new Error("Couldn't find token to update.");
        } else {
          token.update({ name: joinResults(result) });
        }
      } catch (e) {
        console.warn("[All Goblins Have Names]: " + e.message);
      }
    }
  });
}

Hooks.on("ready", AllGoblinsHaveNames);
