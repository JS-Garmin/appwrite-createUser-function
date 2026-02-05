    const sdk = require('node-appwrite');

    module.exports = async (context) => {
        const client = new sdk.Client();
        const users = new sdk.Users(client);

        try {
            client
                .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT || '')
                .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID || '')
                .setKey(process.env.APPWRITE_FUNCTION_API_KEY || '');

            // Step 1 (COMPLETELY NEW LOGIC): List all users from the project.
            const userList = await users.list();

            // Step 2 (COMPLETELY NEW LOGIC): Format the users for the app.
            const result = userList.users.map(user => {
                const role = Array.isArray(user.labels) && user.labels.length > 0
                    ? user.labels[0]
                    : 'User'; // Default role if no label is found
                return {
                    name: user.name,
                    role: role
                };
            });
            
            return context.res.json({ success: true, data: result });

        } catch (error) {
            context.error(error.toString());
            return context.res.json({ success: false, message: `Server Error: ${error.toString()}` });
        }
    };
    
