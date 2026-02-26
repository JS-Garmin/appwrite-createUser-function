const sdk = require('node-appwrite');

module.exports = async ({ req, res, log, error }) => {
  log("--- EXECUTION STARTED ---");

  // Umgebungsvariablen über process.env abrufen
  const apiKey = process.env['APPWRITE_FUNCTION_API_KEY'];
  const projectId = process.env['APPWRITE_FUNCTION_PROJECT_ID'];
  const endpoint = process.env['APPWRITE_FUNCTION_ENDPOINT'] || 'https://cloud.appwrite.io/v1';

  if (!apiKey || !projectId) {
    const msg = "FATAL: API Key oder Project ID fehlen in den Env-Vars!";
    error(msg);
    return res.json({ error: msg }, 500);
  }

  const client = new sdk.Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);

  const users = new sdk.Users(client);

  try {
    log("Lade Benutzerliste...");
    const userList = await users.list();
    
    log(`Erfolg! ${userList.total} Benutzer gefunden.`);
    return res.json(userList);
  } catch (e) {
    error("Fehler: " + e.message);
    return res.json({ error: e.message }, 500);
  }
};
