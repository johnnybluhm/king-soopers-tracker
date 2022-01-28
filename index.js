const puppeteer = require('puppeteer');
const fs = require("fs");

var req_count = 0;
main();
async function main(){
    try{
        await getOrders();
        console.log(req_count)
    } 
    catch (err ){
        async () => {
            console.log(err)
            await browser.close();
        }
    }
}


async function getOrders(){

    const browser = await getBrowser();
    const initialPage = await setUpPage(browser);

    await navigateToMyPurchases();
    await browser.close();
    console.log("We got the data")

    async function navigateToMyPurchases(){
        await initialPage.type("#SignIn-emailInput", "jon.the.bon.bon@gmail.com")
        await initialPage.type("#SignIn-passwordInput", "hFvGf6uV_P#FwyF")
    
        await Promise.all([initialPage.click("#SignIn-submitButton"), initialPage.waitForNavigation()])
    
        await initialPage.goto('https://www.kingsoopers.com/mypurchases');
    }
}//getOrders

async function getBrowser() {
    //const browser_path = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
    //const options = { executablePath: browser_path, headless: false, product: 'chrome' }
    let settings = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--lang=en-US'
    ]
    const browser = await puppeteer.launch({headless: false, defaultViewport: null, args: settings});
    return browser;
}

async function setUpPage(browser) {

    const userAgent = 'Mozilla/5.0 (X11; Linux x86_64)'+
    'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36';

    const page = (await browser.pages())[0];
    page.on('response', checkRequestAndWriteToDisk);
    await page.setUserAgent(userAgent);

    await page.goto('https://www.kingsoopers.com/mypurchases');
    return page;
}

async function checkRequestAndWriteToDisk(interceptedRequest) {
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

async function logRequest(interceptedRequest) {

    console.log('Request made:', interceptedRequest.url());
    req_count++;
}

