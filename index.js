const sdk = require('node-appwrite');

module.exports = async ({ req, res, log, error }) => {// Client frisch initialisieren
  const client = new sdk.Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_FUNCTION_API_KEY);

  const users = new sdk.Users(client);

  try {
    log("Abrufen der Benutzerliste gestartet...");
    const response = await users.list();
    log(`Erfolg: ${response.total} Benutzer gefunden.`);
    return res.json(response);
  } catch (err) {
    error("Fehler beim SDK-Aufruf: " + err.message);
    return res.json({ error: err.message }, 500);
  }
};
