exports = async function() {
  // See "Values & Secrets" for definitions
  const username = context.values.get("ManagedProjectPublicKey");
  const password = context.values.get("ManagedProjectPrivateKey");
  const projectID = context.values.get("ManagedProjectID");
  const clusterNames = context.values.get("ManagedClusters");
  const body = {paused: true};
  
  const output = [];
  
  for(let n = 0; n<clusterNames.length; n++) {
    const arg = { 
      scheme: 'https', 
      host: 'cloud.mongodb.com', 
      path: 'api/atlas/v1.0/groups/' + projectID + '/clusters/' + clusterNames[n], 
      username: username, 
      password: password,
      headers: {'Content-Type': ['application/json'], 'Accept-Encoding': ['bzip, deflate']}, 
      digestAuth:true,
      body: JSON.stringify(body)
    };
    
    // The response body is a BSON.Binary object. Parse it and return.
    response = await context.http.patch(arg);
    
    result = EJSON.parse(response.body.text());
    
    output.push("Paused Cluster Details - Name: "+result.name+", Instance Size: "+result.providerSettings.instanceSizeName+", Provider: "+result.providerSettings.providerName+", Region: "+result.providerSettings.regionName);
    
  }
  return output.join("\n");
}