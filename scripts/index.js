import { isWorldTable, isCompendiumTable, rollTable } from "./table-utils.js";

function accessNestedRef(obj = {}, str = "", setValue) {
  const parts = str.split(".");
  return parts.reduce((o, key, i) => {
    if (setValue && i == parts.length - 1) {
      o[key] = setValue;
    }
    return o[key];
  }, obj);
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
  const table = game.tables.contents.find((t) => t.data._id == table_id);

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
  function prepareTokenFlags(tokenData) {
    const displayName = tokenData.name.trim();
    if (isWorldTable(displayName) || isCompendiumTable(displayName)) {
      // clear token name so we don't display software gore to the user
      tokenData.name = " ";
      // temporarily put it here so we can access it in our async function
      tokenData.flags._AGHN_nameTable = displayName;
    }
    // Mine biography for tables
    if (!tokenData.actorLink && tokenData.actorId) {
      let actor = game.actors.get(tokenData.actorId);
      let data = actor.data.data;

      let bio;
      // structure of simple worldbuilding system
      if (data.biography) {
        bio = data.biography;
        tokenData.flags._AGHN_bioDataPath = "data.biography";
      }
      // structure of D&D 5e NPCs and PCs
      else if (
        data.details &&
        data.details.biography &&
        data.details.biography.value
      ) {
        bio = data.details.biography.value;
        tokenData.flags._AGHN_bioDataPath = "data.details.biography.value";
      }

      // get text out of bio
      let el = document.createElement("div");
      el.innerHTML = bio;
      let bioText = el.innerText.trim();
      if (isWorldTable(bioText) || isCompendiumTable(bioText)) {
        tokenData.flags._AGHN_bioTable = bioText;
      }
    }
  }

  // Creating the token
  Hooks.on("createToken", async (tokenDocument, scene) => {
    // pick up the temporary flags we set in preCreateToken
    const tokenData = tokenDocument.data
    prepareTokenFlags(tokenData)

    const tableStr = tokenData.flags._AGHN_nameTable;
    const bioTableStr = tokenData.flags._AGHN_bioTable;
    const bioDataPath = tokenData.flags._AGHN_bioDataPath;
    // bail early if there is nothing relevant here
    if (!tableStr && !bioTableStr) return;
    // clean up our temporary storage
    delete tokenData.flags._AGHN_nameTable;
    delete tokenData.flags._AGHN_bioTable;
    delete tokenData.flags._AGHN_bioDataPath;

    try {
      // name
      if (tableStr) {
        let resultPromise = isWorldTable(tableStr)
          ? getRollTableResult(tableStr)
          : getCompendiumTableResult(tableStr);

        resultPromise.then((result) => {
          // token.update will be deprecated in 0.9.
          tokenDocument.update({ name: result });
        });
      }

      // bio
      if (bioTableStr) {
        let resultPromise = isWorldTable(bioTableStr)
          ? getRollTableResult(bioTableStr)
          : getCompendiumTableResult(bioTableStr);

        resultPromise.then((result) => {
          accessNestedRef(tokenDocument.actor.data, bioDataPath, result);
        });
      }
    } catch (e) {
      console.warn("[All Goblins Have Names]: " + e.message);
    }
  });
});
