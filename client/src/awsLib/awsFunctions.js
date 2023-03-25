export const putData = (db, tableName, data) => {
  var params = {
    TableName: tableName,
    Item: data,
  };

  db.put(params, function (err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data);
    }
  });
};
