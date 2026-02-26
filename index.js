const sdk = require('node-appwrite');

module.exports = async ({ req, res, log, error }) => {
  const apiKey = process.env['APPWRITE_FUNCTION_API_KEY'];
  const projectId = process.env['APPWRITE_FUNCTION_PROJECT_ID'];
  const endpoint = process.env['APPWRITE_FUNCTION_ENDPOINT'] || 'https://fra.cloud.appwrite.io/v1';

  if (!apiKey || !projectId) {
    return res.json({ error: "Environment variables missing" }, 500);
  }

  const client = new sdk.Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);

  const users = new sdk.Users(client);

  try {
    const userList = await users.list();
    return res.json(userList);
  } catch (e) {
    error(e.message);
    return res.json({ error: e.message }, 500);
  }
};
