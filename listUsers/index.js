    const fetch = require('node-fetch');

    module.exports = async (context) => {
        try {
            const endpoint = process.env.APPWRITE_FUNCTION_ENDPOINT;
            const projectId = process.env.APPWRITE_FUNCTION_PROJECT_ID;
            const apiKey = process.env.APPWRITE_FUNCTION_API_KEY;

            if (!endpoint || !projectId || !apiKey) {
                throw new Error("Missing environment variables.");
            }

            // NEUE LOGIK: Direkter, sauberer API-Aufruf ohne SDK
            const response = await fetch(`${endpoint}/users`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Appwrite-Project': projectId,
                    'X-Appwrite-Key': apiKey,
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to fetch users: ${response.statusText} - ${errorText}`);
            }

            const userList = await response.json();

            const result = userList.users.map(user => {
                const role = Array.isArray(user.labels) && user.labels.length > 0
                    ? user.labels[0]
                    : 'User';
                return {
                    name: user.name,
                    role: role,
                };
            });

            return context.res.json({ success: true, data: result });

        } catch (error) {
            context.error(error.toString());
            return context.res.json({ success: false, message: `Server Error: ${error.toString()}` });
        }
    };
    
