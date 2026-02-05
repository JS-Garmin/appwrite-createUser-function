    var sdk = require('node-appwrite');
    
    module.exports = async (context) => {
        var client = new sdk.Client();
        var users = new sdk.Users(client);
        var teams = new sdk.Teams(client);
    
        try {
            client
                .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT || '')
                .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID || '')
                .setKey(process.env.APPWRITE_FUNCTION_API_KEY || '');
    
            var payload = JSON.parse(context.req.body);
            var name = payload.name;
            var email = payload.email;
            var password = payload.password;
            var role = payload.role;
    
            if (!name || !email || !password || !role) {
                throw new Error('Missing required fields.');
            }
    
            // Step 1: Create the user
            var newUser = await users.create(sdk.ID.unique(), email, null, password, name);
    
            // Step 2: Find the team ID
            var teamList = await teams.list([sdk.Query.equal('name', [role])]);
            if (teamList.teams.length === 0) {
                throw new Error(`Team '${role}' not found.`);
            }
            var teamId = teamList.teams[0].$id;
    
            // Step 3 (NEW APPROACH): Create an invitation for the user's email.
            var invitation = await teams.createMembership(
                teamId,
                email,
                ['member'],
                'http://localhost/accept' // Dummy URL
            );
    
            // Step 4 (ENTIRELY NEW COMMAND): As an admin, force-accept the invitation.
            await teams.updateMembershipStatus(
                teamId,
                invitation.$id,
                newUser.$id,
                invitation.secret
            );
            
            return context.res.json({ success: true, message: 'User created and added to team successfully.' });
    
        } catch (error) {
            context.error(error.toString());
            return context.res.json({ success: false, message: `Server Error: ${error.toString()}` });
        }
    };
    
