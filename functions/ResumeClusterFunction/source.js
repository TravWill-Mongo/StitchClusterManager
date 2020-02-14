exports = async function() {
  // See "Values & Secrets" for definitions
  const username = context.values.get("ManagedProjectPublicKey");
  const password = context.values.get("ManagedProjectPrivateKey");
  const projectID = context.values.get("ManagedProjectID");
  const clusterNames = context.values.get("ManagedClusters");
  const body = {paused: false};
  
  const output = [];
  
  for(let n in clusterNames) {
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
    
    output.push(EJSON.parse(response.body.text()));
    
  }
  

  return output.join("\n");
}