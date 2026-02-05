const sdk = require('node-appwrite');

module.exports = async (context) => {
    const client = new sdk.Client();
    const users = new sdk.Users(client);

    try {
        client.setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT || '')
            .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID || '')
            .setKey(process.env.APPWRITE_FUNCTION_API_KEY || '');

        const payload = JSON.parse(context.req.body);

        // NEUE LOGIK: Prüfen, ob ein Nutzer gelöscht werden soll
        if (payload.deleteUserId) {
            // Sicherheitscheck: Superadmin kann sich nicht selbst löschen
            if (payload.deleteUserId === context.req.headers['x-appwrite-user-id']) {
                throw new Error("Superadmin cannot delete themselves.");
            }
            await users.delete(payload.deleteUserId);
            return context.res.json({ success: true, message: 'User deleted.' });
        }

        // Bisherige Logik zum Erstellen eines Nutzers
        const { name, email, password, role } = payload;

        if (!name || !email || !password || !role) {
            throw new Error('Missing fields for user creation.');
        }

        const newUser = await users.create(sdk.ID.unique(), email, null, password, name);
        await users.updateLabels(newUser.$id, [role]);
        
        return context.res.json({ success: true, message: 'User created.' });

    } catch (error) {
        context.error(error.toString());
        return context.res.json({ success: false, message: `Server Error: ${error.toString()}` });
    }
};
