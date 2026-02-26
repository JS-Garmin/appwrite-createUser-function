const sdk = require('node-appwrite');

module.exports = async ({ req, res, log, error }) => {
  const client = new sdk.Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_FUNCTION_API_KEY);

  const users = new sdk.Users(client);
  let payload = {};
  if (req.body) {
    try {
      payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch (e) { log("Kein JSON im Body"); }
  }

  try {
    // 1. LABELS AKTUALISIEREN (Asphalt Zugriff)
    if (payload.updateUserId && payload.labels) {
      log(`Update Labels für ${payload.updateUserId}: ${payload.labels}`);
      await users.updateLabels(payload.updateUserId, payload.labels);
      return res.json({ success: true });
    }

    // 2. LÖSCHEN
    if (payload.deleteUserId) {
      await users.delete(payload.deleteUserId);
      return res.json({ success: true });
    }

    // 3. ANLEGEN
    if (payload.email && payload.password) {
      const newUser = await users.create(sdk.ID.unique(), payload.email, undefined, payload.password, payload.name);
      if (payload.role) await users.updateLabels(newUser.$id, [payload.role.toLowerCase()]);
      return res.json({ success: true, userId: newUser.$id });
    }

    // 4. AUFLISTEN
    const response = await users.list();
    return res.json(response);

  } catch (err) {
    error(err.message);
    return res.json({ success: false, error: err.message }, 500);
  }
};
