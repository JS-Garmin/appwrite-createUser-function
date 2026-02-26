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
    } catch (e) {
      log("Kein JSON-Payload gefunden oder Fehler beim Parsen.");
    }
  }

  try {
    // 1. LÖSCHEN
    if (payload.deleteUserId) {
      log(`Lösche Nutzer: ${payload.deleteUserId}`);
      await users.delete(payload.deleteUserId);
      return res.json({ success: true, message: "User deleted" });
    }

    // 2. ANLEGEN
    if (payload.email && payload.password) {
      log(`Erstelle Nutzer: ${payload.email}`);
      const newUser = await users.create(
        sdk.ID.unique(),
        payload.email,
        undefined, // phone
        payload.password,
        payload.name
      );
      
      // Rolle/Label zuweisen (kleingeschrieben)
      if (payload.role) {
        const roleLabel = payload.role.toLowerCase();
        log(`Weise Label zu: ${roleLabel}`);
        await users.updateLabels(newUser.$id, [roleLabel]);
      }
      
      return res.json({ success: true, message: "User created", userId: newUser.$id });
    }

    // 3. AUFLISTEN (wenn kein Payload zum Löschen/Anlegen da ist)
    log("Rufe Benutzerliste ab...");
    const response = await users.list();
    return res.json(response);

  } catch (err) {
    error("Fehler in der Funktion: " + err.message);
    return res.json({ success: false, error: err.message }, 500);
  }
};
