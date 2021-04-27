const {Builder, By, Key, until} = require('selenium-webdriver');

const driver = new Builder().forBrowser("chrome").build();

describe("create and close team test", () => {
    // DO NOT RUN THESE TESTS SEPARATELY

    beforeEach(function (done) {
        jest.setTimeout(30000)
        driver
            .navigate()
            .to("https://agilnaplatformareact.herokuapp.com/")
            .then(() => done());
    });

    // DO NOT RUN THESE TESTS SEPARATELY
    test("create team", async function (done) {
        await driver.findElement(By.xpath("//*[text()='Login']")).click();
        await driver.wait(until.urlContains("login"));
        await driver.findElement(By.id("nest-messages_username")).sendKeys("systest_leader")
        await driver.findElement(By.id("nest-messages_password")).sendKeys("systest_leader_password")
        await driver.findElement(By.xpath("//*[text()='Submit']")).click()
        await driver.wait(until.elementLocated(By.xpath("//*[text()='Create team']")))
        await driver.findElement(By.xpath("//*[text()='Create team']")).click()
        await driver.findElement(By.css(".ant-input")).sendKeys("test team")
        await driver.findElement(By.xpath("//*[text()='Create']")).click()
        for (let i = 0; i < 4; i++) {
            await driver.wait(until.elementLocated(By.xpath("//*[text()='Add']")))
            await driver.findElement(By.xpath("//*[text()='Add']")).click()
        }
        await driver.findElement(By.xpath("//*[text()='Finish']")).click()
        await driver.wait(until.urlContains("board"));
        await driver.findElement(By.xpath("//*[text()='Logout']")).click()
        await done()
    });

    // DO NOT RUN THESE TESTS SEPARATELY
    test("close team", async function (done) {
        await driver.findElement(By.xpath("//*[text()='Login']")).click();
        await driver.wait(until.urlContains("login"));
        await driver.findElement(By.id("nest-messages_username")).sendKeys("systest_leader")
        await driver.findElement(By.id("nest-messages_password")).sendKeys("systest_leader_password")
        await driver.findElement(By.xpath("//*[text()='Submit']")).click()
        await driver.wait(until.elementLocated(By.xpath("//*[text()='Team']")))
        await driver.findElement(By.xpath("//*[text()='Team']")).click()
        await driver.wait(until.elementLocated(By.xpath("//*[text()='Close project']")))
        await driver.findElement(By.xpath("//*[text()='Close project']")).click()
        await driver.wait(until.elementIsVisible(driver.findElement(By.css(".ant-popover"))))
        await driver.findElement(By.xpath("//*[text()='Yes']")).click()
        await driver.wait(until.urlContains("createTeam"));
        await driver.findElement(By.xpath("//*[text()='Logout']")).click()
        await done()
    });

    test("should throw alert", async function (done) {
        await driver.findElement(By.xpath("//*[text()='Login']")).click();
        await driver.wait(until.urlContains("login"));
        await driver.findElement(By.id("nest-messages_username")).sendKeys("voditelj23")
        await driver.findElement(By.id("nest-messages_password")).sendKeys("voditelj23")
        await driver.findElement(By.xpath("//*[text()='Submit']")).click()
        await driver.wait(until.elementLocated(By.xpath("//*[text()='Calendar']")))
        await driver.findElement(By.xpath("//*[text()='Calendar']")).click()
        await driver.wait(until.elementLocated(By.xpath("//*[text()='10']")))
        await driver.findElement(By.xpath("//*[text()='10']")).click()
        await driver.wait(until.elementLocated(By.xpath("//*[text()='New meeting']")))
        await driver.findElement(By.xpath("//*[text()='New meeting']")).click()
        await driver.wait(until.elementLocated(By.css(".ant-btn-primary")))
        await driver.findElement(By.css(".ant-btn-primary")).click()
        await driver.wait(until.alertIsPresent());
        await driver.switchTo().alert().dismiss()
        await driver.findElement(By.xpath("//*[text()='Logout']")).click()
        await done()
    });

    afterAll(function (done) {
        driver.quit().then(() => done());
    });
});

