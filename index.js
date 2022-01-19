const puppeteer = require('puppeteer');
const fs = require("fs");
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { executablePath } = require('puppeteer');
//puppeteer.use(StealthPlugin())
//puppeteer.use(require('puppeteer-extra-plugin-anonymize-ua')())

async function getOrders(){

    const browser = await getBrowser();
    const initialPage = await getInitialPage();
    await navigateToMyPurchases();
    await browser.close();

    console.log("We got the data")

    async function getBrowser() {
        //const browser_path = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
        //const options = { executablePath: browser_path, headless: false, product: 'chrome' }
        const browser = await puppeteer.launch({headless: false});
        return browser;
    }

    async function getInitialPage() {

        const page = (await browser.pages())[0];
        await page.goto('https://www.kingsoopers.com/signin/');
        page.on('response', checkRequest)
        return page;
    }

    async function navigateToMyPurchases(){
        await initialPage.type("#SignIn-emailInput", "jon.the.bon.bon@gmail.com")
        await initialPage.type("#SignIn-passwordInput", "hFvGf6uV_P#FwyF")
    
        await Promise.all([initialPage.click("#SignIn-submitButton"), initialPage.waitForNavigation()])
    
        await initialPage.goto('https://www.kingsoopers.com/mypurchases');
    }
}

async function checkRequest(interceptedRequest) {
    const desired_api_request = "https://www.kingsoopers.com/mypurchases/api/v1/receipt/details";
    if(interceptedRequest.url() == desired_api_request){
        console.log('Ajax request made to desired api:', interceptedRequest.url());
        const purchaseHistory = await interceptedRequest.json();
        console.log(purchaseHistory);
        writeJsonToDisk(purchaseHistory);
    }
}

async function writeJsonToDisk(purchaseHistory){
    const history = JSON.stringify(purchaseHistory)
    const time = new Date().toDateString();
    
    await fs.writeFile(`./orders/order-${time}`, history, (err) => {
        if (err)
          console.log(err);
        else {
          console.log("File written successfully\n");
        }
      });
}

getOrders();