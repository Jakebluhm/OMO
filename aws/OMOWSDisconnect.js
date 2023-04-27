const AWS = require("aws-sdk");
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  console.log("OMOWSDisconnect Lambda RUNS!");
  console.log("Event:", JSON.stringify(event)); // Print the event data

  const connectionId = event.requestContext.connectionId;

  // Query the table to find the item with the given connectionId
  const queryParams = {
    TableName: "OMOUserQueue",
    FilterExpression: "connectionId = :connectionId",
    ExpressionAttributeValues: {
      ":connectionId": connectionId,
    },
  };

  let userId;
  try {
    const queryResult = await dynamoDb.scan(queryParams).promise();
    if (queryResult.Items.length > 0) {
      userId = queryResult.Items[0].user;
    } else {
      console.error("User not found for connectionId:", connectionId);
      return { statusCode: 404, body: "User not found." };
    }
  } catch (error) {
    console.error("Error querying for user:", error);
    return {
      statusCode: 500,
      body: "Failed to find user: " + JSON.stringify(error),
    };
  }

  // Delete the item using the retrieved partition key (UUID)
  const deleteParams = {
    TableName: "OMOUserQueue",
    Key: {
      user: userId,
    },
  };

  try {
    console.log("deleteParams:", deleteParams);
    await dynamoDb.delete(deleteParams).promise();
    return { statusCode: 200, body: "Disconnected." };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      statusCode: 500,
      body: "Failed to disconnect: " + JSON.stringify(error),
    };
  }
};
