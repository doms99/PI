const {Builder, By, Key, until} = require('selenium-webdriver');

const driver = new Builder().forBrowser("chrome").build();

describe("access board as different roles", () => {

    beforeEach(function (done) {
        jest.setTimeout(30000)
        driver
            .navigate()
            .to("http://agilnaplatformareact.herokuapp.com/")
            .then(() => done())
    });

    test("open board as management", async function (done)  {
        await driver.findElement(By.xpath("//*[text()='Login']")).click();
        await driver.findElement(By.id("nest-messages_username")).sendKeys("uprava")
        await driver.findElement(By.id("nest-messages_password")).sendKeys("uprava")
        await driver.findElement(By.xpath("//*[text()='Submit']")).click()
        await driver.wait(until.urlIs("http://agilnaplatformareact.herokuapp.com/"))
        await driver.findElement(By.xpath("//*[text()='Teams']")).click()
        await driver.wait(until.elementLocated(By.xpath("//*[text()='Board']")))
        await driver.findElement(By.xpath("//*[text()='Board']")).click()
        await driver.wait(until.urlContains("board"))
        await driver.findElement(By.xpath("//*[text()='Logout']")).click()
        await done()
    }, 30000);

    // test("open board as leader", async function (done)  {
    //     await driver.findElement(By.xpath("//*[text()='Login']")).click();
    //     await driver.findElement(By.id("nest-messages_username")).sendKeys("voditelj23")
    //     await driver.findElement(By.id("nest-messages_password")).sendKeys("voditelj23")
    //     await driver.findElement(By.xpath("//*[text()='Submit']")).click()
    //     await driver.wait(until.elementLocated(By.xpath("//*[text()='Board']")))
    //     await driver.findElement(By.xpath("//*[text()='Board']")).click()
    //     await done()
    // }, 30000);
    //
    // test("open board as engineer", async function (done)  {
    //     await driver.findElement(By.xpath("//*[text()='Login']")).click();
    //     await driver.findElement(By.id("nest-messages_username")).sendKeys("inzenjer4")
    //     await driver.findElement(By.id("nest-messages_password")).sendKeys("inzenjer4")
    //     await driver.findElement(By.xpath("//*[text()='Submit']")).click()
    //     await driver.wait(until.elementLocated(By.xpath("//*[text()='Board']")))
    //     await driver.findElement(By.xpath("//*[text()='Board']")).click()
    //     await done()
    // }, 30000);

    test("add task", async function (done)  {
        await driver.findElement(By.xpath("//*[text()='Login']")).click();
        await driver.findElement(By.id("nest-messages_username")).sendKeys("voditelj23")
        await driver.findElement(By.id("nest-messages_password")).sendKeys("voditelj23")
        await driver.findElement(By.xpath("//*[text()='Submit']")).click()
        await driver.wait(until.elementLocated(By.xpath("//*[text()='Board']")))
        await driver.findElement(By.xpath("//*[text()='Board']")).click()
        await driver.wait(until.elementLocated(By.xpath("//*[text()='Add']")))
        await driver.findElement(By.xpath("//*[text()='Add']")).click()
        await driver.findElement(By.css(".ant-input")).sendKeys("test task")
        await driver.findElement(By.xpath("//*[text()='Save']")).click()
        await driver.wait(until.alertIsPresent());
        await driver.switchTo().alert().dismiss()
        await driver.wait(until.elementLocated(By.xpath("//*[text()='Cancel']"))).click()
        await driver.wait(until.urlContains("board"))
        await driver.findElement(By.xpath("//*[text()='Logout']")).click()
        await done()
    }, 30000);

    afterAll(function (done) {
        driver.quit().then(() => done());
    });
});