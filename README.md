# Azure-OpenAI-Tutorials

## Setup

- go to **Azure Service -> Azure Cosmos DB**

- Create

- find **Azure Cosmos DB for MongoDB** and Create a **vCore Cluster**

- Populate the data as needed, make sure in **Networking -> Connectivity Method** select **Public Access**

- Remember the **Admin Username**, **Password**, and **DB name**

- Once deployed, go to your newly created resource, and find **Connection Strings** on the left pannel

- Copy the connection string

- In **.env** file, past your connection string, and replace the necessary credentials with your **Admin Username**, **Password**, and **DB name**

- Then, replace the **<openai-service-name>**, **<azure_openai_api_key>** with the respective info from **[Azure OpenAI](https://oai.azure.com) -> Settings -> Resources**

  ```Bash
  MONGODB_URI=mongodb+srv://<user>:<password>@<db>.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000
  AOAI_ENDPOINT=https://<openai-service-name>-openai.openai.azure.com/
  AOAI_KEY=<azure_openai_api_key>
  ```

- Now, in **Azure OpenAI Studio -> Deployments** there should be at least two deployments, one for embedding using models like **text-embedding-ada-002**, and another for chat completion using models like **gpt-35-turbo-16k**, Record the **Deployment Name** of each model

- Go to **index.js** and replace the **embeddings** and **completions** with the respective names recorded:

  ```Bash
  const embeddingsDeploymentName = "<embeddings>";
  const completionsDeploymentName = "<completions>";
  ```

### Sometimes you need to set up Network information to connect

- go to your newly created resource, and find **Overview** on the left pannel

- Look for **Connectivity Method**, make sure it says **Public Access** and click on it

- In **Public access** select **Add Current Client IP Address**

If you have any questions, please consult the [following question on stackoverflow](https://stackoverflow.com/questions/78373503/mongoserverselectionerror-server-selection-timed-out-after-30000-ms) and review the last answer.

## Run

### Node.js

- Open the **first_cosmos_db_application/NodeJS** in VSCode

- Open terminal

- Execute:
  ```Bash
  npm install
  node setup.js
  npm start
  ```

## Files

- **setup.js** contains all the completed code from lab 7 and lab 8, enables connections to Cosmos DB, and loads the necessary data.


## Set Up MSLearn OpenAI

- Labfiles contains all the lab codes to play with

- Instructions provide the detailed instructions of all exercises to perform.



