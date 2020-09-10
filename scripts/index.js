function startAGHN() {
  Hooks.on("preCreateToken", (scene, tokenData) => {
    const displayName = tokenData.name.trim();
    if (displayName.startsWith("@RollTable[")) {
      // get the table by its ID
      const endIndex = displayName.indexOf("]");
      const table_id = displayName.substring(11, endIndex);
      const table = game.tables.entities.find((t) => t._id === table_id);

      if (table) {
        const roll = table.roll();
        // join all the results together with spaces
        const resultsArr = roll.results.map((r) => r.text);
        tokenData.name = resultsArr.join(" ");
      } else {
        ui.notifications.error(
          "Can't find a table that matches " + displayName
        );
      }
    }
  });
}

Hooks.on("ready", startAGHN);
