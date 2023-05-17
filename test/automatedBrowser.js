const { Builder, By, Key, until } = require("selenium-webdriver");

async function simulateClient(name, identity) {
  let driver = await new Builder().forBrowser("chrome").build();
  try {
    await driver.get("https://omo.social/");
    await driver.findElement(By.name("displayName")).sendKeys(name, Key.RETURN);
    //await driver.wait(until.titleIs("webdriver - Google Search"), 1000);

    if (identity === 0) {
      // Get all buttons that have a name starting with 'identityA'
      let buttonsA = await driver.findElements(
        By.xpath("//button[starts-with(@name, 'identityA')]")
      );

      for (let button of buttonsA) {
        // Perform actions with button
        await button.click();
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    if (identity === 1) {
      // Get all buttons that have a name starting with 'identityB'
      let buttonsB = await driver.findElements(
        By.xpath("//button[starts-with(@name, 'identityB')]")
      );

      for (let button of buttonsB) {
        // Perform actions with button
        await button.click();
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log("Starting Search");
    await driver.findElement(By.name("confirmButton")).click();

    try {
      let urlSubstring = "room"; // replace with a part of your expected redirected URL
      await driver.wait(until.urlContains(urlSubstring), 10000);
    } catch (e) {
      if (e.name === "TimeoutError") {
        throw new Error(
          `Page did not redirect to ${urlSubstring} within 10 seconds`
        );
      } else {
        throw e; // rethrow any other error
      }
    }
  } finally {
    await driver.quit();
  }
}

(async function runTest() {
  await Promise.all([
    simulateClient("Tim Cook", 0),
    simulateClient("Steve Jobs", 0),
    simulateClient("Elon Musk", 1),
  ]);
})();
