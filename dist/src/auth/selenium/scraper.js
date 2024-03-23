"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeProfile = void 0;
const selenium_webdriver_1 = require("selenium-webdriver");
let SELENIUM_DRIVER;
let curTitle;
async function GetSeleniumReady() {
    if (SELENIUM_DRIVER)
        return;
    if (!process.env.LINKEDIN_USERNAME || !process.env.LINKEDIN_PASSWORD) {
        throw new Error("Couldn't Scrap the linkedin profile, Please provide your LinkedIn username and password in the .env file");
    }
    try {
        console.log('Starting Scraping LinkedIn Profile Session...');
        const host = 'localhost';
        const chromeOptions = {
            detach: true,
        };
        const capabilities = selenium_webdriver_1.Capabilities.chrome().set('goog:chromeOptions', chromeOptions);
        SELENIUM_DRIVER = await new selenium_webdriver_1.Builder()
            .withCapabilities(capabilities)
            .forBrowser('chrome')
            .usingServer(`http://${host}:4444/wd/hub`)
            .build();
    }
    catch (e) {
        console.log('Ending Starting Selenium Session With Error...');
        console.error('error in starting selenium session:', e);
        console.log('Make sure that:');
        console.log('1- The Remote Docker Selenium Server is running on the host machine correctly');
        await SELENIUM_DRIVER?.quit();
        return;
    }
    try {
        console.log('Going To Login Page...');
        await SELENIUM_DRIVER.get('https://www.linkedin.com/login');
        await SELENIUM_DRIVER.manage().setTimeouts({ implicit: 5000 });
        console.log('Done');
        curTitle = await SELENIUM_DRIVER.getTitle();
        console.log('Current Page Title:', curTitle);
        console.log('Entering Credentials To Login...');
        const emailInput = await SELENIUM_DRIVER.findElement(selenium_webdriver_1.By.id('username'));
        const passwordInput = await SELENIUM_DRIVER.findElement(selenium_webdriver_1.By.id('password'));
        await emailInput.sendKeys(`${process.env.LINKEDIN_USERNAME}`);
        await passwordInput.sendKeys(`${process.env.LINKEDIN_PASSWORD}`, selenium_webdriver_1.Key.RETURN);
        await SELENIUM_DRIVER.manage().setTimeouts({ implicit: 5000 });
        console.log('Done');
        curTitle = await SELENIUM_DRIVER.getTitle();
        console.log('Current Page Title:', curTitle);
    }
    catch (e) {
        console.log('Ending LinkedIn Login With Error...');
        console.error('error in logging in to linkedin:', e);
        console.log('Make sure that:');
        console.log('1- The Provided LinkedIn username and password are correct');
        console.log("2- The linkedin Account doesn't require a security verification after login");
        await SELENIUM_DRIVER?.quit();
    }
}
async function scrapeProfile(url) {
    try {
        await GetSeleniumReady();
        console.log('Going to profile Page...');
        await SELENIUM_DRIVER.get(url);
        await SELENIUM_DRIVER.manage().setTimeouts({ implicit: 5000 });
        console.log('Done');
        curTitle = await SELENIUM_DRIVER.getTitle();
        console.log('Current Page Title:', curTitle);
        console.log('Scraping Profile Data...');
        const photoSection = await SELENIUM_DRIVER.findElement(selenium_webdriver_1.By.css('.pv-top-card--photo'));
        function getName(title) {
            return title
                .split(' | ')[0]
                .substring(title.indexOf(')') + 1)
                .trim();
        }
        const name = getName(curTitle);
        const avatar = await photoSection
            .findElement(selenium_webdriver_1.By.css('img'))
            .getAttribute('src');
        console.log('Done');
        console.log('Profile name:', name);
        console.log('Profile Personal image link:', avatar);
        console.log('Ending Scraping LinkedIn Profile Session Successfully...');
        return { name, avatar };
    }
    catch (e) {
        console.log('End Scraping LinkedIn Profile Session With Error...');
        console.error('error in scraping linkedin profile:', e);
        console.log('Make sure that:');
        console.log('1- The linkedin profile is valid And public');
    }
}
exports.scrapeProfile = scrapeProfile;
//# sourceMappingURL=scraper.js.map