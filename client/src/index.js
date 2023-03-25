import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

import * as AWS from "aws-sdk";

AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: "us-east-1:f698415d-522d-41c4-bfca-2cbc75de02ed",
  RoleArn: "arn:aws:iam::426938983711:role/Cognito_DynamoPoolUnauth",
});

AWS.config.update({
  region: "us-east-1",
});

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
