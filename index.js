const sdk = require('node-appwrite');

module.exports = async (context) => {
    const client = new sdk.Client();
    const users = new sdk.Users(client);

    try {
        client
            .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT)
            .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
            .setKey(process.env.APPWRITE_FUNCTION_API_KEY);

        const userList = await users.list({ limit: 100 });

        const result = userList.users.map(user => ({
            id: user.$id,
            name: user.name,
            email: user.email,
            role: Array.isArray(user.labels) && user.labels.length > 0
                ? user.labels[0]
                : 'User'
        }));

        return context.res.send(
            JSON.stringify(result),
            200,
            { 'Content-Type': 'application/json' }
        );

    } catch (error) {
        context.error(error);
        return context.res.send('[]', 500);
    }
};
