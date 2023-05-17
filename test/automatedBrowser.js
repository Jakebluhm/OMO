const { Builder, By, Key, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

async function simulateClient(name, identity) {
  let options = new chrome.Options();
  options.addArguments("--headless");
  options.addArguments("--log-level=3");

  let driver = await new Builder()
    .forBrowser("chrome")
    //.setChromeOptions(options)
    .build();

  let hasQuit = false; // add a flag to keep track of whether the driver has been quit

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
        await driver.quit();
        hasQuit = true; // set the flag to true when the driver is quit
        throw new Error(`Page did not redirect to room within 10 seconds`);
      } else {
        throw e; // rethrow any other error
      }
    }
  } finally {
    if (!hasQuit) {
      // only quit the driver if it hasn't already been quit
      await driver.quit();
    }
  }
}

(async function runTest() {
  await Promise.all([
    simulateClient("Tim Cook", 0),
    simulateClient("Steve Jobs", 1),
    simulateClient("Elon Musk", 0),
  ]);
})();
