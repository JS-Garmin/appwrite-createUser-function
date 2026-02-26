    const sdk = require('node-appwrite');
    
    module.exports = async function (req, res) {
      const log = req.log;
      const error = req.error;
    
      log("--- EXECUTION STARTED (v_final_debug) ---");
    
      const apiKey = req.variables['APPWRITE_FUNCTION_API_KEY'];
      const projectId = req.variables['APPWRITE_FUNCTION_PROJECT_ID'];
    
      if (!apiKey || !projectId) {
        const errorMessage = "FATAL: Environment variables (API Key or Project ID) are missing on the server!";
        error(errorMessage);
        return res.json({ error: errorMessage }, 500);
      }
    
      log(`Env-Vars found. Project: ${projectId}. Initializing client...`);
      const client = new sdk.Client();
      const users = new sdk.Users(client);
    
      try {
        client
          .setEndpoint(req.variables['APPWRITE_FUNCTION_ENDPOINT'] || 'https://cloud.appwrite.io/v1')
          .setProject(projectId)
          .setKey(apiKey);
    
        log("Client initialized. Attempting to call users.list()...");
        const userList = await users.list();
          //Test
    
        log(`SDK call successful. RAW RESPONSE: ${JSON.stringify(userList)}`);
    
        if (userList && userList.hasOwnProperty('users')) {
          log(`Success! Found ${userList.total} users. Sending valid JSON response.`);
          res.json(userList);
        } else {
          const criticalError = "CRITICAL! SDK response is invalid. It does not contain a 'users' property.";
          error(criticalError);
          res.json({ error: criticalError }, 500);
        }
    
      } catch (e) {
        const exceptionMessage = "FATAL! An exception was caught in the function: " + e.message;
        error(exceptionMessage);
        res.json({ error: exceptionMessage }, 500);
      }
    };
    
