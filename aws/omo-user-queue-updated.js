const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB();
const docClient = new AWS.DynamoDB.DocumentClient();
const { v1: uuid } = require("uuid");

// Add the sendURLToClient function
async function sendURLToClient(connectionId, uuid, promptId) {
  console.log("------ sendURLToClient");
  console.log("connectionId");
  console.log(connectionId);
  const apiGateway = new AWS.ApiGatewayManagementApi({
    apiVersion: "2018-11-29",
    endpoint:
      "https://1myegfct68.execute-api.us-east-1.amazonaws.com/production",
  });
  try {
    await apiGateway
      .postToConnection({
        ConnectionId: connectionId,
        Data: JSON.stringify({ action: "sendURL", uuid, promptId }),
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
            const matchedUsers = [user, ...match.matches];
            console.log("matchedUsers");
            console.log(matchedUsers);

            // Payload
            const promptId = match.promptId;
            const uniqueUUID = `${uuid()}`;

            for (const matchedUser of matchedUsers) {
              // Remove user from the OMOUserQueue table
              const deleteParams = {
                TableName: tableName,
                Key: { user: matchedUser.user },
              };

              // Send signal with unique URL to each matched user
              await sendURLToClient(
                matchedUser.connectionId,
                uniqueUUID,
                promptId
              );

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
  const potentialMatches = [];

  let commonPromptId = null;

  for (const otherUser of users) {
    if (otherUser.user !== user.user) {
      for (const prompt of user.prompts) {
        const promptId = Object.keys(prompt)[0];
        const otherUserPrompt = otherUser.prompts.find(
          (p) => Object.keys(p)[0] === promptId
        );
        if (otherUserPrompt && otherUserPrompt[promptId] === prompt[promptId]) {
          potentialMatches.push(otherUser);
          commonPromptId = promptId;
          break;
        }
      }
    }
  }

  if (potentialMatches.length >= 2) {
    return { matches: potentialMatches.slice(0, 2), promptId: commonPromptId };
  }
  return null;
}