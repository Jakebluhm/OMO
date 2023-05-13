const { Builder, By, Key, until } = require("selenium-webdriver");

(async function example() {
  let driver = await new Builder().forBrowser("chrome").build();
  try {
    await driver.get("https://omo.social/");
    //await driver.findElement(By.name("q")).sendKeys("webdriver", Key.RETURN);
    //await driver.wait(until.titleIs("webdriver - Google Search"), 1000);
    await new Promise((resolve) => setTimeout(resolve, 5000));
  } finally {
    await driver.quit();
  }
})();
