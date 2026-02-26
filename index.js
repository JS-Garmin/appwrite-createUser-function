const sdk = require('node-appwrite');

module.exports = async ({ req, res, log, error }) => {
  const client = new sdk.Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_FUNCTION_API_KEY);

  const users = new sdk.Users(client);

  try {
    // Nur users.list() aufrufen, keine Parameter übergeben!
    const response = await users.list();
    return res.json(response);
  } catch (err) {
    error("SDK Error: " + err.message);
    return res.json({ error: err.message }, 500);
  }
};
