    const sdk = require('node-appwrite');
    
    module.exports = async (context) => {
        const client = new sdk.Client();
        const users = new sdk.Users(client);
    
        try {
            client
                .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT || '')
                .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID || '')
                .setKey(process.env.APPWRITE_FUNCTION_API_KEY || '');
    
            // List all users
            const userList = await users.list();
    
            // Map users to the desired format
            const result = userList.users.map(user => {
                const role = Array.isArray(user.labels) && user.labels.length > 0
                    ? user.labels[0]
                    : 'User';
                return {
                    name: user.name,
                    role: role
                };
            });
            
            // Return a success object with the data
            return context.res.json({ success: true, data: result });
    
        } catch (error) {
            context.error(error.toString());
            // Return a clear failure object
            return context.res.json({ success: false, message: `Server Error: ${error.toString()}` });
        }
    };
    
