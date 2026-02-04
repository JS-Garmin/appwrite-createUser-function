const sdk = require('node-appwrite');

module.exports = async function (req, res) {
    const client = new sdk.Client();
    const teams = new sdk.Teams(client);

    if (!process.env.APPWRITE_FUNCTION_ENDPOINT || !process.env.APPWRITE_FUNCTION_API_KEY || !process.env.APPWRITE_FUNCTION_PROJECT_ID) {
        return res.json({ success: false, message: 'Environment variables not set.' });
    }

    client
        .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT)
        .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
        .setKey(process.env.APPWRITE_FUNCTION_API_KEY);

    try {
        const teamList = await teams.list();
        const userRoleMap = new Map();
        const rolePrecedence = { 'Superadmin': 3, 'Admin': 2, 'User': 1 };

        for (const team of teamList.teams) {
            const teamMembers = await teams.listMemberships(team.$id);
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
        res.json(result);

    } catch (error) {
        console.error(error);
        res.json([]); // Return empty list on error
    }
};
