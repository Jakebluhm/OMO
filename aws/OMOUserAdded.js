// const AWS = require("aws-sdk");
// const dynamodb = new AWS.DynamoDB();
// const docClient = new AWS.DynamoDB.DocumentClient();
// const { v1: uuid } = require("uuid");

// Add the sendURLToClient function
// async function sendURLToClient(connectionId, uuid, promptId) {
//   console.log("------ sendURLToClient");
//   console.log("connectionId");
//   console.log(connectionId);
//   const apiGateway = new AWS.ApiGatewayManagementApi({
//     apiVersion: "2018-11-29",
//     endpoint:
//       "https://1myegfct68.execute-api.us-east-1.amazonaws.com/production",
//   });
//   try {
//     await apiGateway
//       .postToConnection({
//         ConnectionId: connectionId,
//         Data: JSON.stringify({ action: "sendURL", uuid, promptId }),
//       })
//       .promise();
//   } catch (error) {
//     console.error("Error sending URL to client:", error);
//   }
// }

// exports.handler = async (event, context) => {
//   const tableName = "OMOUserQueue";
//   console.log("event");
//   console.log(event);
//   console.log("context");
//   console.log(context);

//   try {
//     for (const record of event.Records) {
//       try {
//         const scanParams = {
//           TableName: tableName,
//         };
//         const allUsers = await docClient.scan(scanParams).promise();
//         const users = allUsers.Items;

//         // Get the item from the DynamoDB stream record
//         const keys = record.dynamodb.Keys;
//         const getItemParams = {
//           TableName: tableName,
//           Key: keys,
//         };
//         const item = await dynamodb.getItem(getItemParams).promise();

//         console.log("item");
//         console.log(item);

//         if (item) {
//           console.log("Item retrieved:", item);
//           const user = AWS.DynamoDB.Converter.unmarshall(item.Item);

//           console.log("user");
//           console.log(user);

//           console.log("users");
//           console.log(users);

//           // Call the matchmaking function
//           const match = findMatch(users);
//           if (match) {
//             console.log("Match found:", match);

//             // Handle the match, send a unique URL to matched users
//             // Remove matched users from the OMOUserQueue table
//             const matchedUsers = match.matches;
//             console.log("matchedUsers");
//             console.log(matchedUsers);

//             // Payload
//             const promptId = match.promptId;
//             const uniqueUUID = `${uuid()}`;

//             for (const matchedUser of matchedUsers) {
//               // Remove user from the OMOUserQueue table
//               const deleteParams = {
//                 TableName: tableName,
//                 Key: { user: matchedUser.user },
//               };

//               // Send signal with unique URL to each matched user
//               await sendURLToClient(
//                 matchedUser.connectionId,
//                 uniqueUUID,
//                 promptId
//               );

//               await docClient.delete(deleteParams).promise();
//             }
//           }
//         } else {
//           console.log("Item not found");
//         }
//       } catch (err) {
//         console.error("Error handling stream record:", err);
//       }
//     }
//   } catch (error) {
//     console.error(error);
//   }
// };
// Matchmaking function
function findMatch(users) {
  console.log("----------Inside findMatch-------------");

  let promptsMap = {};

  if (Array.isArray(users)) {
    users.forEach((u) => {
      console.log(u.prompts);
    });
  } else {
    console.log("No users found");
  }
  for (const otherUser of users) {
    for (const promptStr of otherUser.prompts) {
      const prompt = JSON.parse(promptStr);
      const promptId = Object.keys(prompt)[0];
      if (!promptsMap.hasOwnProperty(promptId)) {
        promptsMap[promptId] = { 0: [], 1: [] };
      }
      promptsMap[promptId][prompt[promptId]].push(otherUser);
    }
  }

  for (const [promptId, usersMap] of Object.entries(promptsMap)) {
    if (
      (usersMap[0].length === 1 && usersMap[1].length >= 2) ||
      (usersMap[1].length === 1 && usersMap[0].length >= 2)
    ) {
      const uniqueUser =
        usersMap[0].length === 1 ? usersMap[0][0] : usersMap[1][0];
      const matchingUsers =
        usersMap[0].length === 1
          ? usersMap[1].slice(0, 2)
          : usersMap[0].slice(0, 2);

      // Check if uniqueUser has played with the two matchingUsers before
      let alreadyPlayed = false;
      if (uniqueUser.gameHistory) {
        for (const history of uniqueUser.gameHistory) {
          console.log("Ignore prev game logic");
          console.log(
            "Checking: " +
              history.promptId +
              " (" +
              typeof history.promptId +
              ") === " +
              promptId +
              " (" +
              typeof promptId +
              ") and matchedUsers UUIDs " +
              matchingUsers[0].user +
              " " +
              matchingUsers[1].user +
              " against: " +
              JSON.stringify(history.uuids)
          );

          const firstCondition =
            history.uuids[0] === matchingUsers[0].user &&
            history.uuids[1] === matchingUsers[1].user;
          const secondCondition =
            history.uuids[0] === matchingUsers[1].user &&
            history.uuids[1] === matchingUsers[0].user;

          if (
            String(history.promptId) === String(promptId) &&
            (firstCondition || secondCondition)
          ) {
            console.log("GAME IGNORED, ALREADY PLAYED");
            alreadyPlayed = true;
            break;
          }
        }
      }

      if (alreadyPlayed) {
        continue;
      }

      return {
        matches: [uniqueUser].concat(matchingUsers),
        promptId: promptId,
      };
    }
  }

  console.log("----------returning from findMatch-------------");
  return null;
}
exports.findMatch = findMatch;
