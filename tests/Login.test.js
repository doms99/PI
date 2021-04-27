const {Builder, By, Key, until} = require('selenium-webdriver');

const driver = new Builder().forBrowser("chrome").build();

describe("login test", () => {

    beforeEach(function(done) {
        jest.setTimeout(30000)
        driver
            .navigate()
            .to("http://agilnaplatformareact.herokuapp.com/")
            .then(() => done());
    });

    test("simple login", async function(done) {
        await driver.findElement(By.xpath("//*[text()='Login']")).click();
        await driver.wait(until.urlContains("login"));
        await driver.findElement(By.id("nest-messages_username")).sendKeys("uprava")
        await driver.findElement(By.id("nest-messages_password")).sendKeys("uprava")
        await driver.findElement(By.xpath("//*[text()='Submit']")).click()
        await done()
    });

    test("incorrect password", async function(done) {
        await driver.findElement(By.xpath("//*[text()='Login']")).click();
        await driver.wait(until.urlContains("login"));
        await driver.findElement(By.id("nest-messages_username")).sendKeys("uprava")
        await driver.findElement(By.id("nest-messages_password")).sendKeys("incorrect_password")
        await driver.findElement(By.xpath("//*[text()='Submit']")).click()
        await driver.wait(until.alertIsPresent());
        await driver.switchTo().alert().dismiss()
        await done()
    });

    test("failed login", async function(done) {
        await driver.findElement(By.xpath("//*[text()='Login']")).click();
        await driver.wait(until.urlContains("login"));
        await driver.findElement(By.id("nest-messages_username")).sendKeys("non-existing")
        await driver.findElement(By.id("nest-messages_password")).sendKeys("user")
        await driver.findElement(By.xpath("//*[text()='Submit']")).click()
        await driver.wait(until.alertIsPresent());
        await driver.switchTo().alert().dismiss()
        await done()
    });

    afterAll(function(done) {
        driver.quit().then(() => done());
    });
});