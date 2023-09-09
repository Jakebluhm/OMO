import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import CreateRoom from "./routes/CreateRoom";
import Room from "./routes/Room";
import IntermediateComponent from "./routes/Intermediate";

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact component={CreateRoom} />
        <Route
          path="/room/:roomID"
          render={(props) => (
            <Room key={props.match.params.roomID} {...props} />
          )}
        />
        <Route path="/intermediate" component={IntermediateComponent} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
