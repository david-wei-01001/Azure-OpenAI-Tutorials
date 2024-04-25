# Azure-OpenAI-Tutorials

## Setup

- go to **Azure Service -> Azure Cosmos DB**

- Create

- find **Azure Cosmos DB for MongoDB** and Create a **vCore Cluster**

- Populate the data as needed, make sure in **Networking -> Connectivity Method** select **Public Access**

- Remember the **Admin Username**, **Password**, and **DB name**

- Once deployed, go to your newly created resource, and find **Connection Strings** on the left pannel

- Copy the connection string

- Now, in **Azure OpenAI Studio -> Deployments** there should be at least two deployments, one for embedding using models like **text-embedding-ada-002**, and another for chat completion using models like **gpt-35-turbo-16k**, Record the **Deployment Name** of each model

- Go to **.env** and populate all the credentials:

  ```Bash
  ADMIN_USERNAME=<Azure Cosmos DB Username>
  PASSWORD=<Azure Cosmos DB Password>
  DB=<Azure Cosmos DB Name>
  AZURE_OPENAI_API_INSTANCE_NAME=<OpenAI Service Name>
  AZURE_OPENAI_API_KEY=<azure_openai_api_key>
  AZURE_OPENAI_API_DEPLOYMENT_NAME=<completions>
  AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME=<embeddings>
  AZURE_OPENAI_API_VERSION=2023-09-01-preview
  ```

### Sometimes you need to set up Network information to connect

- go to your newly created resource, and find **Overview** on the left pannel

- Look for **Connectivity Method**, make sure it says **Public Access** and click on it

- In **Public access** select **Add Current Client IP Address**

If you have any questions, please consult the [following question on Stackoverflow](https://stackoverflow.com/questions/78373503/mongoserverselectionerror-server-selection-timed-out-after-30000-ms) and review the last answer.

## Run

### Node.js

- Open the **first_cosmos_db_application/NodeJS** in VSCode

- Open terminal

- Execute:
  ```Bash
  npm install
  node setup.js
  node vectorSearch.js
  npm start
  ```

## Files

- **setup.js** contains all the completed code from lab 7 and lab 8, enables connections to Cosmos DB, and loads the necessary data.

- **vectorSearch.js** contains all the completed code from lab 9, You can follow the 4 steps (by uncommenting the code to reproduce).

- **LangChainSearch.js** contains all the completed code from lab 10, You can follow the 3 steps (by uncommenting the code to reproduce).


## Set Up MSLearn OpenAI

- Labfiles contains all the lab codes to play with

- Instructions provide the detailed instructions of all exercises to perform.



