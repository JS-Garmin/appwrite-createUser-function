    const sdk = require('node-appwrite');

    module.exports = async function (req, res) {
      const client = new sdk.Client();
      const users = new sdk.Users(client);
      const teams = new sdk.Teams(client);

      if (
        !req.variables['APPWRITE_FUNCTION_ENDPOINT'] ||
        !req.variables['APPWRITE_FUNCTION_API_KEY'] ||
        !req.variables['APPWRITE_FUNCTION_PROJECT_ID']
      ) {
        res.json({ success: false, message: 'Environment variables not set.' });
        return;
      }

      client
        .setEndpoint(req.variables['APPWRITE_FUNCTION_ENDPOINT'])
        .setProject(req.variables['APPWRITE_FUNCTION_PROJECT_ID'])
        .setKey(req.variables['APPWRITE_FUNCTION_API_KEY']);

      try {
        const payload = JSON.parse(req.payload);
        const { name, email, password, role } = payload;

        if (!name || !email || !password || !role) {
          res.json({ success: false, message: 'Missing required fields.' });
          return;
        }

        const newUser = await users.create(
          sdk.ID.unique(),
          email,
          null,
          password,
          name
        );

        const teamList = await teams.list([sdk.Query.equal('name', [role])]);
        
        if (teamList.teams.length === 0) {
          res.json({ success: false, message: `Team '${role}' not found.` });
          return;
        }
        const teamId = teamList.teams[0].$id;

        await teams.createMembership(
          teamId,
          ['member'],
          email
        );

        res.json({ success: true, message: 'User created.' });

      } catch (error) {
        res.json({ success: false, message: error.message });
      }
    };
    
