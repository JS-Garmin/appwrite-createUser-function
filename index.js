    const sdk = require('node-appwrite');
    
    module.exports = async (context) => {
        const client = new sdk.Client();
        const users = new sdk.Users(client);
        const teams = new sdk.Teams(client);
    
        if (
            !process.env.APPWRITE_FUNCTION_ENDPOINT ||
            !process.env.APPWRITE_FUNCTION_API_KEY ||
            !process.env.APPWRITE_FUNCTION_PROJECT_ID
        ) {
            context.error("Environment variables are not set.");
            return context.res.json({ success: false, message: 'Environment variables not set.' });
        }
    
        client
            .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT)
            .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
            .setKey(process.env.APPWRITE_FUNCTION_API_KEY);
    
        try {
            const payload = JSON.parse(context.req.body);
            const { name, email, password, role } = payload;
    
            if (!name || !email || !password || !role) {
                return context.res.json({ success: false, message: 'Missing required fields.' });
            }
    
            const newUser = await users.create(
                sdk.ID.unique(),
                email,
                null,
                password,
                name
            );
    
            const teamList = await teams.list([sdk.Query.equal('name', [role])]);
            
            if (teamList.teams.length === 0) {
                return context.res.json({ success: false, message: `Team '${role}' not found.` });
            }
            const teamId = teamList.teams[0].$id;
    
            // THE FINAL, CORRECTED CALL: The userId parameter was in the wrong position.
            await teams.createMembership(
                teamId,
                ['member'],
                'http://localhost/dummy-url', // url (required but not used)
                undefined,                  // email (not used for direct add)
                newUser.$id                 // userId
            );
    
            return context.res.json({ success: true, message: 'User created successfully.' });
    
        } catch (error) {
            context.error(error);
            return context.res.json({ success: false, message: error.message });
        }
    };
    
