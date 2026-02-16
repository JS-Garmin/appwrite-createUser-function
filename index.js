    const sdk = require('node-appwrite');
    
    module.exports = async function (req, res) {
      const log = req.log;
      const error = req.error;
    
      log("--- EXECUTION STARTED (v_debug_final) ---");
    
      const client = new sdk.Client();
      const users = new sdk.Users(client);
    
      const apiKey = req.variables['APPWRITE_FUNCTION_API_KEY'];
      const projectId = req.variables['APPWRITE_FUNCTION_PROJECT_ID'];
    
      if (!apiKey || !projectId) {
        error("FATAL: Environment variables (API Key or Project ID) are missing!");
        return res.json({ error: "Function is not configured on server." }, 500);
      }
    
      log("Env-Vars found. Initializing Appwrite client.");
    
      try {
        client
          .setEndpoint(req.variables['APPWRITE_FUNCTION_ENDPOINT'] || 'https://cloud.appwrite.io/v1')
          .setProject(projectId)
          .setKey(apiKey);
    
        log("Client initialized. Attempting to call users.list()...");
        const userList = await users.list();
    
        // THIS IS THE MOST IMPORTANT LOG:
        log("SDK call successful. RAW RESPONSE: " + JSON.stringify(userList));
    
        if (userList && userList.hasOwnProperty('users')) {
          log(`Success! Found ${userList.total} users. Sending valid JSON response.`);
          res.json(userList);
        } else {
          error("CRITICAL! SDK response is invalid. It does not contain a 'users' property.");
          res.json({ error: "Internal server error: Invalid SDK response." }, 500);
        }
    
      } catch (e) {
        error("FATAL! An exception was caught in the function: " + e.message);
        res.json({ error: e.message }, 500);
      }
    };
    
    
