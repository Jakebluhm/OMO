const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB();

exports.handler = async (event, context) => {
  const tableName = "OMOUserQueue";
  console.log("INSIDE HANDLER IN SERVER.JS ---- LAMBDA DYNAMO DB ETC ETC");
  // Iterate through each record in the stream event
  try {
    for (const record of event.Records) {
      try {
        // Get the item from the DynamoDB stream record
        const keys = record.dynamodb.Keys;
        const getItemParams = {
          TableName: tableName,
          Key: keys,
        };
        const item = await dynamodb.getItem(getItemParams).promise();

        // Handle the item based on its contents
        if (item) {
          console.log("Item retrieved:", item);
          // Add your logic here to handle the item
        } else {
          console.log("Item not found");
        }
      } catch (err) {
        console.error("Error handling stream record:", err);
      }
    }
  } catch (error) {
    console.error(error);
    // Expected output: ReferenceError: nonExistentFunction is not defined
    // (Note: the exact output may be browser-dependent)
  }
};
