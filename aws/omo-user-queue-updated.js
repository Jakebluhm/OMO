const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB();
const docClient = new AWS.DynamoDB.DocumentClient();
const { v1: uuid } = require("uuid");

// Add the sendURLToClient function
async function sendURLToClient(connectionId, url) {
  console.error("------ sendURLToClient");
  const apiGateway = new AWS.ApiGatewayManagementApi({
    apiVersion: "2018-11-29",
    endpoint:
      "wss://86sw6hpi28.execute-api.us-east-1.amazonaws.com/production/",
  });

  try {
    await apiGateway
      .postToConnection({
        ConnectionId: connectionId,
        Data: JSON.stringify({ action: "sendURL", url }),
      })
      .promise();
  } catch (error) {
    console.error("Error sending URL to client:", error);
  }
}

exports.handler = async (event, context) => {
  const tableName = "OMOUserQueue";
  console.log("event");
  console.log(event);
  console.log("context");
  console.log(context);

  try {
    for (const record of event.Records) {
      try {
        const scanParams = {
          TableName: tableName,
        };
        const allUsers = await docClient.scan(scanParams).promise();
        const users = allUsers.Items;

        // Get the item from the DynamoDB stream record
        const keys = record.dynamodb.Keys;
        const getItemParams = {
          TableName: tableName,
          Key: keys,
        };
        const item = await dynamodb.getItem(getItemParams).promise();

        console.log("item");
        console.log(item);

        if (item) {
          console.log("Item retrieved:", item);
          const user = AWS.DynamoDB.Converter.unmarshall(item.Item);

          console.log("user");
          console.log(user);

          console.log("users");
          console.log(users);

          // Call the matchmaking function
          const match = findMatch(user, users);
          if (match) {
            console.log("Match found:", match);

            // Handle the match, send a unique URL to matched users
            // Remove matched users from the OMOUserQueue table
            const matchedUsers = [user, ...match];
            console.log("matchedUsers");
            console.log(matchedUsers);

            const uniqueURL = `http://3.136.49.106:80/${uuid()}`;

            for (const matchedUser of matchedUsers) {
              // Remove user from the OMOUserQueue table
              const deleteParams = {
                TableName: tableName,
                Key: { user: matchedUser.user },
              };

              // Send signal with unique URL to each matched user
              await sendURLToClient(matchedUser.connectionId, uniqueURL);

              await docClient.delete(deleteParams).promise();
            }
          }
        } else {
          console.log("Item not found");
        }
      } catch (err) {
        console.error("Error handling stream record:", err);
      }
    }
  } catch (error) {
    console.error(error);
  }
};

// Matchmaking function
function findMatch(user, users) {
  // Add your matchmaking algorithm here
  // For example, find two other users with the same answer to the same question
  const potentialMatches = [];

  for (const otherUser of users) {
    if (otherUser.user !== user.user) {
      for (const prompt of user.prompts) {
        const otherUserPrompt = otherUser.prompts.find((p) => p.S === prompt.S);
        if (otherUserPrompt && otherUserPrompt.S === prompt.S) {
          potentialMatches.push(otherUser);
          break;
        }
      }
    }
  }

  if (potentialMatches.length >= 2) {
    return potentialMatches.slice(0, 2);
  }
  return null;
}
