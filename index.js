const sdk = require('node-appwrite');

/*
  Input:
  - (GET-Request ohne Body) -> Gibt alle Benutzer zurück.
  - (POST-Request mit Body) -> Führt eine Aktion aus:
    - { "email": "...", "password": "...", "name": "...", "role": "..." } -> Erstellt einen Benutzer.
    - { "deleteUserId": "..." } -> Löscht einen Benutzer.
    - { "updateUserId": "...", "labels": ["..."] } -> Aktualisiert die Labels eines Benutzers.
*/
module.exports = async ({ req, res, log, error }) => {
  // 1. Initialisiere den Appwrite Client
  const client = new sdk.Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_FUNCTION_API_KEY);

  const users = new sdk.Users(client);

  // 2. Parse den Request-Body, falls vorhanden
  let payload = {};
  if (req.body && typeof req.body === 'string') {
    try {
      payload = JSON.parse(req.body);
    } catch (e) {
      log("Kein gültiger JSON-Body gefunden, fahre ohne Payload fort.");
    }
  } else if (req.body) {
    payload = req.body;
  }

  try {
    // AKTION 1: LABELS (Rolle, Asphalt-Zugriff) aktualisieren
    if (payload.updateUserId && Array.isArray(payload.labels)) {
      log(`Aktualisiere Labels für Nutzer ${payload.updateUserId}: ${payload.labels.join(', ')}`);
      await users.updateLabels(payload.updateUserId, payload.labels);
      return res.json({ success: true, message: "Labels updated" });
    }

    // AKTION 2: BENUTZER LÖSCHEN
    if (payload.deleteUserId) {
      log(`Lösche Nutzer: ${payload.deleteUserId}`);
      await users.delete(payload.deleteUserId);
      return res.json({ success: true, message: "User deleted" });
    }

    // AKTION 3: NEUEN BENUTZER ANLEGEN
    if (payload.email && payload.password) {
      log(`Erstelle Nutzer: ${payload.name} (${payload.email})`);
      const newUser = await users.create(
        sdk.ID.unique(),
        payload.email,
        undefined, // phone
        payload.password,
        payload.name
      );

      // Weise die Rolle als Label zu
      if (payload.role) {
        const roleLabel = payload.role.toLowerCase();
        await users.updateLabels(newUser.$id, [roleLabel]);
        log(`Label '${roleLabel}' für neuen Nutzer gesetzt.`);
      }
      
      return res.json({ success: true, message: "User created", userId: newUser.$id });
    }

    // STANDARD-AKTION: BENUTZER AUFLISTEN
    log("Keine spezielle Aktion angefordert, rufe Benutzerliste ab...");
    const userList = await users.list();
    log(`Erfolgreich ${userList.total} Benutzer gefunden.`);
    return res.json(userList);

  } catch (err) {
    error(`Fehler in der Funktion: ${err.message}`);
    return res.json({ success: false, error: err.message }, 500);
  }
};
