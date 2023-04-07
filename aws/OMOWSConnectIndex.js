const AWS = require("aws-sdk");
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const connectionId = event.requestContext.connectionId;
  const userId = event.queryStringParameters.userId;
  const prompts = JSON.parse(event.queryStringParameters.prompts);

  const params = {
    TableName: "OMOUserQueue",
    Item: {
      user: userId,
      connectionId: connectionId,
      prompts: prompts,
    },
  };

  try {
    await dynamoDb.put(params).promise();
    return { statusCode: 200, body: "Connected." };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: "Failed to connect: " + JSON.stringify(error),
    };
  }
};
