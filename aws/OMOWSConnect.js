const AWS = require("aws-sdk");
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  console.log("OMOWSConnect Lambda RUNS!");

  const connectionId = event.requestContext.connectionId;
  const userId = event.queryStringParameters.userId;
  const prompts = JSON.parse(event.queryStringParameters.prompts);
  const gameHistory = JSON.parse(event.queryStringParameters.gameHistory);

  console.log(gameHistory);

  const params = {
    TableName: "OMOUserQueue",
    Item: {
      user: userId,
      connectionId: connectionId,
      prompts: prompts,
      gameHistory: gameHistory,
    },
  };

  try {
    console.log("params");
    console.log(params);
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
