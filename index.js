    const sdk = require('node-appwrite');
    
    module.exports = async (context) => {
        const client = new sdk.Client();
        const users = new sdk.Users(client);
        const teams = new sdk.Teams(client);
    
        try {
            client
                .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT || '')
                .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID || '')
                .setKey(process.env.APPWRITE_FUNCTION_API_KEY || '');
    
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
    
            // 2. Find the team ID
            const teamList = await teams.list([sdk.Query.equal('name', [role])]);
            
            if (teamList.teams.length === 0) {
                return context.res.json({ success: false, message: `Team '${role}' not found.` });
            }
            const teamId = teamList.teams[0].$id;
    
            // 3. Add user to the team
            await teams.createMembership(
                teamId,
                ['member'],
                'http://localhost/dummy-url', // url
                undefined, // email
                newUser.$id // userId
            );
    
            return context.res.json({ success: true, message: 'User created successfully.' });
    
        } catch (error) {
            // THIS IS THE NEW PART: Return the detailed error to the app.
            context.error(error.toString());
            return context.res.json({ success: false, message: `Server Error: ${error.toString()}` });
        }
    };
    
