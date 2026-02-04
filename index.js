    const sdk = require('node-appwrite');

    module.exports = async function (req, res) {
      const client = new sdk.Client();
      const users = new sdk.Users(client);
      const teams = new sdk.Teams(client);

      if (
        !process.env.APPWRITE_FUNCTION_ENDPOINT ||
        !process.env.APPWRITE_FUNCTION_API_KEY ||
        !process.env.APPWRITE_FUNCTION_PROJECT_ID
      ) {
        console.warn("Environment variables are not set. Function cannot use Appwrite SDK.");
        res.json({ success: false, message: 'Environment variables not set.' });
        return;
      }

      client
        .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT)
        .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
        .setKey(process.env.APPWRITE_FUNCTION_API_KEY);

      try {
        const payload = JSON.parse(req.payload);
        const { name, email, password, role } = payload;

        if (!name || !email || !password || !role) {
          res.json({ success: false, message: 'Missing required fields: name, email, password, role.' });
          return;
        }

        // 1. Create the user
        const newUser = await users.create(
          sdk.ID.unique(),
          email,
          null, // phone
          password,
          name
        );

        // 2. Find the team ID for the given role
        const teamList = await teams.list([sdk.Query.equal('name', [role])]);
        
        if (teamList.teams.length === 0) {
          res.json({ success: false, message: `Team with role '${role}' not found.` });
          return;
        }
        const teamId = teamList.teams[0].$id;

        // 3. Add the user to the team
        await teams.createMembership(
          teamId,
          ['member'], // roles
          email
        );

        res.json({ success: true, message: 'User created successfully.', userId: newUser.$id });

      } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
      }
    };
    
