    const sdk = require('node-appwrite');
    
    module.exports = async (context) => {
        const client = new sdk.Client();
        const teams = new sdk.Teams(client);
    
        if (!process.env.APPWRITE_FUNCTION_ENDPOINT || !process.env.APPWRITE_FUNCTION_API_KEY || !process.env.APPWRITE_FUNCTION_PROJECT_ID) {
            context.error('Environment variables not set.');
            return context.res.json([]);
        }
    
        client
            .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT)
            .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
            .setKey(process.env.APPWRITE_FUNCTION_API_KEY);
    
        try {
            context.log("Starting user list generation...");
            const teamList = await teams.list();
            context.log(`Found ${teamList.total} teams.`);
    
            const userRoleMap = new Map();
            const rolePrecedence = { 'Superadmin': 3, 'Admin': 2, 'User': 1 };
    
            for (const team of teamList.teams) {
                context.log(`Processing team: ${team.name}`);
                const teamMembers = await teams.listMemberships(team.$id);
                context.log(`- Found ${teamMembers.total} members.`);
    
                for (const member of teamMembers.memberships) {
                    const userId = member.userId;
                    const userName = member.userName;
                    const currentRole = team.name;
    
                    if (userRoleMap.has(userId)) {
                        const existingRole = userRoleMap.get(userId).role;
                        if ((rolePrecedence[currentRole] || 0) > (rolePrecedence[existingRole] || 0)) {
                            userRoleMap.set(userId, { name: userName, role: currentRole });
                        }
                    } else {
                        userRoleMap.set(userId, { name: userName, role: currentRole });
                    }
                }
            }
            
            const result = Array.from(userRoleMap.values());
            context.log(`Finished. Returning ${result.length} users.`);
            return context.res.json(result);
    
        } catch (error) {
            context.error("An error occurred in listUsers function:");
            context.error(error);
            return context.res.json([]);
        }
    };
    
