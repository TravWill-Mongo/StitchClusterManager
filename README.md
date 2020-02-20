# Stitch Cluster Manager:
This will create a new Stitch App called "AtlasClusterManager" with the purpose of pausing/resuming other clusters as needed. The core of this Stitch App is made up of 3 functions. Pause Clusters, Resume Clusters and Resume Stitch Triggers. The first two functions are self explanatory, but it's worth diving deeper into the third.

Stitch Triggers are developed on top of the Change Streams introduced in 3.6. A limitation of Change Streams is that they will suspend their connection when an "Invalidate" event occurs. Coincidentally, pausing a cluster will ultimately "Invalidate" all associated Change Streams and Triggers. In addition to the Stitch Triggers that exist inside of the Stitch App, it is possible to have "Atlas Triggers", which are those accessible from the main Atlas View. To fix the suspended Triggers, you can either manually navigate to each trigger and enable them with a click of a button. Or you can automate this with the function provided!

### Example Use Cases:
- Developers who only test during certain days and hours
- SA's who only resume a cluster for a demo, and want the piece of mind that it will auto pause later that day.

### Prequisites:
- Existing Atlas Project
    - M10+ Cluster (The cluster that will be managed by the process)
- Atlas Information Required:
    - Project ID
    - Public and Private API Keys (w/ Permissions "Project Owner" and "Project Cluster Manager")
- Stitch CLI: https://docs.mongodb.com/stitch/deploy/stitch-cli-reference/#installation

### Known Limitations:
- The following scenarios are when a cluster cannot be paused:
    - Cluster is a shared Tier (M0, M2, or M5)
    - Clusters are leveraging local NVMes
    - Cluster was resumed less than 60 minutes prior

### Installation:
This process should take roughly 15 minutes to complete.

1. Download this repo, uncompress, and CD to repo folder
```sh
git clone https://github.com/TravWill-Mongo/StitchClusterManager.git
cd ./StitchClusterManager
```
2. From your Terminal, Perform the following steps:
```sh
# 1. Login to Stitch CLI
stitch-cli login --api-key=my-api-key --private-api-key=my-private-api-key

# 2. Run the initial Import of the Stitch App
# Notes: 
#    An error is expected due to the lack of existing Secrets.
#    The first import will create an empty Stitch App for us to create the secrets on.
stitch-cli import --project-id=ProjectID

# 3. Create the initial Secrets for the Public and Private API Keys
# Note: 
#    These can be updated from the Atlas UI Later. We just need the secrets to exist for the import to succeed.
stitch-cli secrets add --name=ManagedProjectPublicKeySecret --value=SuperSecretValue!
stitch-cli secrets add --name=ManagedProjectPrivateKeySecret --value=SuperSecretValue!

# 4. Re-Import the Stitch App, now that the secrets exist
stitch-cli import --project-id=ProjectID --strategy=replace
```
3. From the Stitch App, Navigate to "Values & Secrets"
    - Under the "Values" Tab, you will need to update the following:
        - ManagedProjectID: This value was previously used on the import command.
        - ManagedClusters: This is an Array of strings, that identify the name of the clusters in your project. Multiple clusters can be added as needed.
    - Under the "Secrets" Tab, you will need to update the following:
        - ManagedProjectPublicKeySecret: This value was previously used on the import command.
        - ManagedProjectPrivateKeySecret: This value was previously used on the import command.

4. Review and Deploy Changes
5. Test Pause/Resume Functions

### Additional Settings:
- You can adjust the Time and Frequency of your triggers as needed. Defaults are set to 7am CST for Resume and 7pm CST for Pause.
- If you rarely use your cluster, and only want it to Pause the same day you manually resume it. Simply "Disable" the Resume Triggers.
- If you do not have any Triggers/Change Streams associated to the cluster that is being managed, you can disable the "ResumeStitchTrigger"

### Special Thanks:
- Richard Arnold for the inspiration of exploring infrastructure as code
- Brian Legend for this article: https://www.mongodb.com/blog/post/atlas-cluster-automation-using-scheduled-triggers

### Disclaimer:
This stitch app is not battle tested, nor regularely maintained, and does not include a warranty! Feel free to update and contribute as needed!
