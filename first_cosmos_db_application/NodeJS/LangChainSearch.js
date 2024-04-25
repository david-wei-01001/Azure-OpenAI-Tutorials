require('dotenv').config();
const { MongoClient } = require('mongodb');

// Import the necessary LangChain packages
const { AzureCosmosDBVectorStore,
    AzureCosmosDBSimilarityType
} = require("@langchain/community/vectorstores/azure_cosmosdb");
const { OpenAIEmbeddings, ChatOpenAI } = require("@langchain/openai");

// To support the LangChain LCEL RAG chain
const { PromptTemplate }  = require("@langchain/core/prompts");
const { RunnableSequence, RunnablePassthrough } = require("@langchain/core/runnables");
const { StringOutputParser } = require("@langchain/core/output_parsers");

// For LangChain agent
const { DynamicTool } = require("@langchain/core/tools");
const { AgentExecutor } = require("langchain/agents");
const { MessagesPlaceholder, ChatPromptTemplate } = require("@langchain/core/prompts");
const { convertToOpenAIFunction } = require("@langchain/core/utils/function_calling");
const { OpenAIFunctionsAgentOutputParser } = require("langchain/agents/openai/output_parser");
const { formatToOpenAIFunctionMessages } = require("langchain/agents/format_scratchpad");

// set up the MongoDB client
const connectionStringStart = "mongodb+srv://";
const connectionStringEnd = ".mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000";

const dbClient = new MongoClient(connectionStringStart + process.env.ADMIN_USERNAME + ":" + process.env.PASSWORD + "@" + process.env.DB + connectionStringEnd);

// Initialize the connection to the vector store that points to the Products collection and associated index
const azureCosmosDBConfig = {
    client: dbClient,
    databaseName: "cosmic_works",
    collectionName: "products",
    indexName: "VectorSearchIndex",
    embeddingKey: "contentVector",
    textKey: "_id"
}
const vectorStore = new AzureCosmosDBVectorStore(new OpenAIEmbeddings(), azureCosmosDBConfig);

// set up the OpenAI chat model
const chatModel = new ChatOpenAI();

async function main() {
    try {
        await dbClient.connect();
        console.log("Connected to MongoDB");

        // Step 1: Perform a vector search using the vector store
        // const results = await vectorStore.similaritySearch(
        //     "What yellow products do you have?", 
        //     AzureCosmosDBSimilarityType.CosineSimilarity, 
        //     3
        // );
        // console.log(results);

        // Step 2: Perform a vector search using the vectorStore object and output the results
        // console.log(await ragLCELChain("What yellow products do you have?"));

        // Step 3: Create and interact witl LangChain Agent
       // In buildAgentExecutor, uncomment "returnIntermediateSteps: true" to output the intermediate steps of the agent that includes the function calls and their outputs
        const agentExecutor = await buildAgentExecutor();
        // console.log(await executeAgent(agentExecutor, "What yellow products do you have?"));
        console.log(await executeAgent(agentExecutor, "What is the name of the product that has the SKU TI-R982?"));

    } catch (err) {
        console.error(err);
    } finally {
        await dbClient.close();
        console.log('Disconnected from MongoDB');
    }
}

function formatDocuments(docs) {
    // Prepares the product list for the system prompt.  
    let strDocs = "";
    for (let index = 0; index < docs.length; index++) {
        let doc = docs[index];
        let docFormatted = { "_id": doc.pageContent };
        Object.assign(docFormatted, doc.metadata);

        // Build the product document without the contentVector and tags
        if ("contentVector" in docFormatted) {
            delete docFormatted["contentVector"];
        }
        if ("tags" in docFormatted) {
            delete docFormatted["tags"];
        }

        // Add the formatted product document to the list
        strDocs += JSON.stringify(docFormatted, null, '\t');

        // Add a comma and newline after each item except the last
        if (index < docs.length - 1) {
            strDocs += ",\n";
        }
    }
    // Add two newlines after the last item
    strDocs += "\n\n";
    return strDocs;
}

async function ragLCELChain(question) { 
    // A system prompt describes the responsibilities, instructions, and persona of the AI.
    // Note the addition of the templated variable/placeholder for the list of products and the incoming question.
    const systemPrompt = `
        You are a helpful, fun and friendly sales assistant for Cosmic Works, a bicycle and bicycle accessories store. 
        Your name is Cosmo.
        You are designed to answer questions about the products that Cosmic Works sells.

        Only answer questions related to the information provided in the list of products below that are represented
        in JSON format.

        If you are asked a question that is not in the list, respond with "I don't know."

        Only answer questions related to Cosmic Works products, customers, and sales orders.

        If a question is not related to Cosmic Works products, customers, or sales orders,
        respond with "I only answer questions about Cosmic Works"

        List of products:
        {products}

        Question:
        {question}
    `;

    // Use a retriever on the Cosmos DB vector store
    const retriever = vectorStore.asRetriever();

    // Initialize the prompt
    const prompt = PromptTemplate.fromTemplate(systemPrompt);

    // The RAG chain will populate the variable placeholders of the system prompt
    // with the formatted list of products based on the documents retrieved from the vector store.
    // The RAG chain will then invoke the LLM with the populated prompt and the question.
    // The response from the LLM is then parsed as a string and returned.
    const ragChain  = RunnableSequence.from([
        {
            products: retriever.pipe(formatDocuments),
            question: new RunnablePassthrough()
        },
        prompt,
        chatModel,
        new StringOutputParser()
    ]);

    return await ragChain.invoke(question);
}

async function buildAgentExecutor() {
    // A system prompt describes the responsibilities, instructions, and persona of the AI.
    // Note the variable placeholders for the list of products and the incoming question are not included.
    // An agent system prompt contains only the persona and instructions for the AI.
    const systemMessage = `
            You are a helpful, fun and friendly sales assistant for Cosmic Works, a bicycle and bicycle accessories store.
    
            Your name is Cosmo.
    
            You are designed to answer questions about the products that Cosmic Works sells, the customers that buy them, and the sales orders that are placed by customers.
    
            If you don't know the answer to a question, respond with "I don't know."
            
            Only answer questions related to Cosmic Works products, customers, and sales orders.
            
            If a question is not related to Cosmic Works products, customers, or sales orders,
            respond with "I only answer questions about Cosmic Works"          
        `;

    // Create vector store retriever chain to retrieve documents and formats them as a string for the prompt.
    const retrieverChain = vectorStore.asRetriever().pipe(formatDocuments);

    // Define tools for the agent can use, the description is important this is what the AI will 
    // use to decide which tool to use.

    // A tool that retrieves product information from Cosmic Works based on the user's question.
    const productsRetrieverTool = new DynamicTool({
        name: "products_retriever_tool",
        description: `Searches Cosmic Works product information for similar products based on the question. 
                    Returns the product information in JSON format.`,
        func: async (input) => await retrieverChain.invoke(input),
    });

    // A tool that will lookup a product by its SKU. Note that this is not a vector store lookup.
    const productLookupTool = new DynamicTool({
        name: "product_sku_lookup_tool",
        description: `Searches Cosmic Works product information for a single product by its SKU.
                    Returns the product information in JSON format.
                    If the product is not found, returns null.`,
        func: async (input) => {
            const db = dbClient.db("cosmic_works");
            const products = db.collection("products");
            const doc = await products.findOne({ "sku": input });            
            if (doc) {                
                //remove the contentVector property to save on tokens
                delete doc.contentVector;
            }
            return doc ? JSON.stringify(doc, null, '\t') : null;
        },
    });

    // Generate OpenAI function metadata to provide to the LLM
    // The LLM will use this metadata to decide which tool to use based on the description.
    const tools = [productsRetrieverTool, productLookupTool];
    const modelWithFunctions = chatModel.bind({
        functions: tools.map((tool) => convertToOpenAIFunction(tool)),
    });

    // OpenAI function calling is fine-tuned for tool using therefore you don't need to provide instruction.
    // All that is required is that there be two variables: `input` and `agent_scratchpad`.
    // Input represents the user prompt and agent_scratchpad acts as a log of tool invocations and outputs.
    const prompt = ChatPromptTemplate.fromMessages([
        ["system", systemMessage],
        ["human", "{input}"],
        new MessagesPlaceholder(variable_name="agent_scratchpad")
    ]);

    // Define the agent and executor
    // An agent is a type of chain that reasons over the input prompt and has the ability
    // to decide which function(s) (tools) to use and parses the output of the functions.
    const runnableAgent = RunnableSequence.from([  
        {  
            input: (i) => i.input,  
            agent_scratchpad: (i) => formatToOpenAIFunctionMessages(i.steps),  
        },  
        prompt,  
        modelWithFunctions,  
        new OpenAIFunctionsAgentOutputParser(),
    ]);

    // An agent executor can be thought of as a runtime, it orchestrates the actions of the agent
    // until completed. This can be the result of a single or multiple actions (one can feed into the next).
    // Note: If you wish to see verbose output of the tool usage of the agent, 
    //       set returnIntermediateSteps to true
    const executor = AgentExecutor.fromAgentAndTools({
        agent: runnableAgent,
        tools,
        // returnIntermediateSteps: true
    });

    return executor;
}

// Helper function that executes the agent with user input and returns the string output
async function executeAgent(agentExecutor, input) {
    // Invoke the agent with the user input
    const result = await agentExecutor.invoke({input});
    
    // Output the intermediate steps of the agent if returnIntermediateSteps is set to true
    if (agentExecutor.returnIntermediateSteps) {
        console.log(JSON.stringify(result.intermediateSteps, null, 2));
    }
    // Return the final response from the agent
    return result.output;
}

main().catch(console.error);