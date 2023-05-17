const { findMatch } = require("../aws/OMOUserAdded");

(function runTest() {
  const testUsers = [
    [
      {
        user: "31f946c0-f44e-11ed-9326-f1314720f83e",
        connectionId: "FCsOIc9YoAMCKNw=",
        prompts: ['{"0":0}', '{"1":0}', '{"2":0}'],
      },
      {
        user: "31f8d190-f44e-11ed-940e-b9003894047f",
        connectionId: "FCsOIczmoAMCEQw=",
        prompts: ['{"0":0}', '{"1":0}', '{"2":0}'],
      },
      {
        user: "31eb15f0-f44e-11ed-aa47-d7f63467c0b0",
        connectionId: "FCsOHdWrIAMCLyg=",
        prompts: ['{"0":0}', '{"1":0}', '{"2":0}'],
      },
    ],
    [
      {
        user: "31f946c0-f44e-11ed-9326-f1314720f83e",
        connectionId: "FCsOIc9YoAMCKNw=",
        prompts: ['{"0":1}', '{"1":0}', '{"2":0}'],
      },
      {
        user: "31f8d190-f44e-11ed-940e-b9003894047f",
        connectionId: "FCsOIczmoAMCEQw=",
        prompts: ['{"0":0}', '{"1":0}', '{"2":0}'],
      },
      {
        user: "31eb15f0-f44e-11ed-aa47-d7f63467c0b0",
        connectionId: "FCsOHdWrIAMCLyg=",
        prompts: ['{"0":0}', '{"1":0}', '{"2":0}'],
      },
    ],
    [
      {
        user: "31f946c0-f44e-11ed-9326-f1314720f83e",
        connectionId: "FCsOIc9YoAMCKNw=",
        prompts: ['{"0":0}', '{"1":1}', '{"2":0}'],
      },
      {
        user: "31f8d190-f44e-11ed-940e-b9003894047f",
        connectionId: "FCsOIczmoAMCEQw=",
        prompts: ['{"0":0}', '{"1":1}', '{"2":0}'],
      },
      {
        user: "31eb15f0-f44e-11ed-aa47-d7f63467c0b0",
        connectionId: "FCsOHdWrIAMCLyg=",
        prompts: ['{"0":0}', '{"1":0}', '{"2":0}'],
      },
    ],
  ];

  console.log("Running OMOUserAddedTest");

  const expectedTestResults = [false, true, true];
  testUsers.forEach((users, index) => {
    var result = null;
    const matchResult = findMatch(users);
    console.log("Test result " + (index + 1) + " :");
    console.log(matchResult);

    if (matchResult == null) {
      result = false;
    } else {
      result = true;
    }

    if (result != expectedTestResults[index]) {
      throw new Error(`Incorrect return value from findMatch lambda function`);
    }
  });
})();
