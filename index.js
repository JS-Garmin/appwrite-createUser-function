const sdk = require('node-appwrite');

module.exports = async ({ req, res, log, error }) => {
  const client = new sdk.Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1') 
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_FUNCTION_API_KEY);

  const users = new sdk.Users(client);

  try {
    log("Abrufen gestartet...");
    const response = await users.list();
    return res.json(response);
  } catch (err) {
    error("Fehler: " + err.message);
    return res.json({ error: err.message }, 500);
  }
};
