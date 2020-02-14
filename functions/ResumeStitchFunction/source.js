exports = async function() {
  accessToken = await getAccessToken();
  stitchApps = await getStitchApps(accessToken);
  triggers = await getAllTriggers(accessToken, stitchApps);
  resume = await resumeAllTriggers(accessToken, triggers);
  
  return resume;
}

async function getAccessToken() {
    const baseStitchURL = context.values.get("StitchApiUrl");
    const ManagedProjectPublicKey = context.values.get("ManagedProjectPublicKey");
    const ManagedProjectPrivateKey = context.values.get("ManagedProjectPrivateKey");
    
  accessTokenResponse = await context.http.post({
    url: baseStitchURL+"/auth/providers/mongodb-cloud/login",
    body: {"username":ManagedProjectPublicKey,"apiKey":ManagedProjectPrivateKey},
    encodeBodyAsJSON: true
  });
    
  access_token = EJSON.parse(accessTokenResponse.body.text()).access_token;
  return access_token;
}

async function getStitchApps(token) {
    const baseStitchURL = context.values.get("StitchApiUrl");
    const ManagedProjectID = context.values.get("ManagedProjectID");
  stitchResponse = await context.http.get({
    url: baseStitchURL+"/groups/"+ManagedProjectID+"/apps",
    headers: {
      "Authorization": ["Bearer "+token],
    }
  });
  
  atlasResponse = await context.http.get({
    url: baseStitchURL+"/groups/"+ManagedProjectID+"/apps?product=atlas",
    headers: {
      "Authorization": ["Bearer "+token],
    }
  });
    
  stitchApps = EJSON.parse(stitchResponse.body.text());
  atlasApps = EJSON.parse(atlasResponse.body.text());
  
  return stitchApps.concat(atlasApps);
}

async function getAllTriggers(token, apps) {
    const baseStitchURL = context.values.get("StitchApiUrl");
    const ManagedProjectID = context.values.get("ManagedProjectID");

    let collectedTriggers = [];
    for(let i=0; i<apps.length; i++) {
        response = await context.http.get({
            url: baseStitchURL+"/groups/"+ManagedProjectID+"/apps/"+apps[i]._id+"/triggers",
            headers: {
                "Authorization": ["Bearer "+token],
            }
        });

        if(response.statusCode == 200) {
            triggers = EJSON.parse(response.body.text());

            for(let j=0; j<triggers.length; j++) {
                triggers[j].appId = apps[i]._id
            }

            collectedTriggers = collectedTriggers.concat(triggers);
        }
    }
    return collectedTriggers;
}

async function resumeAllTriggers(token, triggers) {
    const baseStitchURL = context.values.get("StitchApiUrl");
    const ManagedProjectID = context.values.get("ManagedProjectID");

    for(let i=0; i<triggers.length; i++) {
        if(triggers[i].error) {
            await context.http.put({
                url: baseStitchURL+"/groups/"+ManagedProjectID+"/apps/"+triggers[i].appId+"/triggers/"+triggers[i]._id+"/resume",
                headers: {
                    "Authorization": ["Bearer "+token],
                },
                body: {},
                encodeBodyAsJSON: true
            });
            console.log("Resumed: "+triggers[i].name)
        }
    }
    return true;
}