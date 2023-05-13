const { Builder, By, Key, until } = require("selenium-webdriver");

(async function example() {
  let driver = await new Builder().forBrowser("chrome").build();
  try {
    await driver.get("https://omo.social/");
    await driver
      .findElement(By.name("displayName"))
      .sendKeys("Tim Cook", Key.RETURN);
    //await driver.wait(until.titleIs("webdriver - Google Search"), 1000);

    // Get all buttons that have a name starting with 'identityA'
    let buttonsA = await driver.findElements(
      By.xpath("//button[starts-with(@name, 'identityA')]")
    );

    // Get all buttons that have a name starting with 'identityB'
    let buttonsB = await driver.findElements(
      By.xpath("//button[starts-with(@name, 'identityB')]")
    );

    for (let button of buttonsA) {
      // Perform actions with button

      await button.click();
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    for (let button of buttonsB) {
      // Perform actions with button
    }

    console.log("Starting Search");
    await driver.findElement(By.name("confirmButton")).click();

    await new Promise((resolve) => setTimeout(resolve, 5000));
  } finally {
    await driver.quit();
  }
})();
