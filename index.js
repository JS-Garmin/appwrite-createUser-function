    const sdk = require('node-appwrite');
    
    module.exports = async (context) => {
        const client = new sdk.Client();
        const users = new sdk.Users(client);
        const teams = new sdk.Teams(client);
    
        if (!process.env.APPWRITE_FUNCTION_ENDPOINT || !process.env.APPWRITE_FUNCTION_API_KEY || !process.env.APPWRITE_FUNCTION_PROJECT_ID) {
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
    
            // 1. Create the user
            const newUser = await users.create(
                sdk.ID.unique(),
                email,
                null,
                password,
                name
            );
    
            // 2. Find the team ID for the given role
            const teamList = await teams.list([sdk.Query.equal('name', [role])]);
            
            if (teamList.teams.length === 0) {
                return context.res.json({ success: false, message: `Team '${role}' not found.` });
            }
            const teamId = teamList.teams[0].$id;
    
            // 3. Add the user to the team directly using their USER ID
            await teams.createMembership(
                teamId,
                ['member'],
                "http://localhost/dummy-url", // URL is required but not used for direct-add
                undefined, // email is undefined
                newUser.$id // Use the user's ID to add them directly
            );
    
            return context.res.json({ success: true, message: 'User created successfully.' });
    
        } catch (error) {
            context.error(error);
            return context.res.json({ success: false, message: error.message });
        }
    };
    
