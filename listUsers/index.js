    const sdk = require('node-appwrite');

    module.exports = async (context) => {
        const client = new sdk.Client();
        const users = new sdk.Users(client);

        try {
            client
                .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT || '')
                .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID || '')
                .setKey(process.env.APPWRITE_FUNCTION_API_KEY || '');

            // NEW LOGIC: List all users from the project
            const userList = await users.list();

            // NEW LOGIC: Map all users and their labels to the format the app expects
            const result = userList.users.map(user => {
                // Find the role from the labels array, default to 'User'
                // This will now correctly read the label from your 'superuser'
                const role = Array.isArray(user.labels) && user.labels.length > 0
                    ? user.labels[0]
                    : 'User';
                return {
                    name: user.name,
                    role: role
                };
            });
            
            // Return the formatted list
            return context.res.json(result);

        } catch (error) {
            context.error(error.toString());
            // Return an empty list in case of an error to prevent the app from crashing
            return context.res.json([]);
        }
    };
    
