    const sdk = require('node-appwrite');
    
    module.exports = async function (req, res) {
      const client = new sdk.Client();
      const users = new sdk.Users(client);
    
      if (!req.variables['APPWRITE_FUNCTION_API_KEY']) {
        throw new Error("Function environment variables are not set.");
      }
    
      client
        .setEndpoint(req.variables['APPWRITE_FUNCTION_ENDPOINT'] || 'https://cloud.appwrite.io/v1')
        .setProject(req.variables['APPWRITE_FUNCTION_PROJECT_ID'])
        .setKey(req.variables['APPWRITE_FUNCTION_API_KEY']);
    
      try {
        const userList = await users.list();
        res.json(userList); 
      } catch (error) {
        res.json({ error: error.message }, 500);
      }
    };
    
