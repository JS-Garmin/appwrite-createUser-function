    const sdk = require('node-appwrite');

    module.exports = async (context) => {
        const client = new sdk.Client();
        const users = new sdk.Users(client);

        try {
            client
                .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT || '')
                .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID || '')
                .setKey(process.env.APPWRITE_FUNCTION_API_KEY || '');

            const payload = JSON.parse(context.req.body);
            const { name, email, password, role } = payload;

            if (!name || !email || !password || !role) {
                throw new Error('Missing required fields.');
            }

            // Step 1: Create the user
            const newUser = await users.create(sdk.ID.unique(), email, null, password, name);

            // Step 2 (COMPLETELY NEW LOGIC): Update the user's labels with the role.
            await users.updateLabels(newUser.$id, [role]);
            
            return context.res.json({ success: true, message: 'User created and labeled successfully.' });

        } catch (error) {
            context.error(error.toString());
            return context.res.json({ success: false, message: `Server Error: ${error.toString()}` });
        }
    };
    
