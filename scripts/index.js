function startAGHN() {
  Hooks.on("preCreateToken", (scene, tokenData) => {
    if (tokenData.name.startsWith("@RollTable[")) {
      // get the table by its ID
      const endIndex = tokenData.name.indexOf("]");
      const table_id = tokenData.name.substring(11, endIndex);
      const table = game.tables.entities.find((t) => t._id === table_id);

      if (table) {
        const roll = table.roll();
        // join all the results together with spaces
        const resultsArr = roll.results.map((r) => r.text);
        tokenData.name = resultsArr.join(" ");
      }
    }
  });
}

Hooks.on("ready", startAGHN);
