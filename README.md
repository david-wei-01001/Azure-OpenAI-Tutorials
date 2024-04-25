# Azure-OpenAI-Tutorials

## Steps to Run

- go to **Azure Service -> Azure Cosmos DB**

- Create

- find **Azure Cosmos DB for MongoDB** and Create a **vCore Cluster**

- Populate the data as needed, make sure in **Networking -> Connectivity Method** select **Public Access**

- Remember the **Admin Username**, **Password**, and **DB name**

- Once deployed, go to your newly created resource, and find **Connection Strings** on the left pannel

- Copy the connection string

- In **.env** file, past your connection string, and replace the necessary credentials with your **Admin Username**, **Password**, and **DB name**

  ```Bash
  MONGODB_URI=mongodb+srv://<user>:<password>@<db>.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000
  ```

### Sometimes you need to set up Network information to connect

- go to your newly created resource, and find **Overview** on the left pannel

- Look for **Connectivity Method**, make sure it says **Public Access** and click on it

- In **Public access** select **Add Current Client IP Address**

If you have any questions, please consult the [following question on stackoverflow](https://stackoverflow.com/questions/78373503/mongoserverselectionerror-server-selection-timed-out-after-30000-ms) and review the last answer.


## Set Up MSLearn OpenAI
