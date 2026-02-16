    const sdk = require('node-appwrite');
    
    module.exports = async function (req, res) {
      // Benutze die von Appwrite bereitgestellten Logging-Funktionen
      const log = req.log;
      const error = req.error;
    
      log("Function execution started.");
    
      const client = new sdk.Client();
      const users = new sdk.Users(client);
    
      const apiKey = req.variables['APPWRITE_FUNCTION_API_KEY'];
      const endpoint = req.variables['APPWRITE_FUNCTION_ENDPOINT'] || 'https://cloud.appwrite.io/v1';
      const projectId = req.variables['APPWRITE_FUNCTION_PROJECT_ID'];
    
      if (!apiKey || !projectId) {
        error("FATAL: API Key or Project ID environment variables are not set!");
        return res.json({ error: "Function environment variables are not set." }, 500);
      }
      
      log("Environment variables found. Initializing client.");
    
      try {
        client
          .setEndpoint(endpoint)
          .setProject(projectId)
          .setKey(apiKey);
        
        log("Client initialized. Attempting to list users...");
        
        const userList = await users.list();
        
        log("Successfully listed users. Total found: " + userList.total);
        
        res.json(userList);
      } catch (e) {
        error("FATAL: Caught an error during execution: " + e.message);
        res.json({ error: e.message }, 500);
      }
    };
    
