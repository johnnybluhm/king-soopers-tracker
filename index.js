const puppeteer = require('puppeteer-extra');
const fs = require("fs");
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { executablePath } = require('puppeteer');
puppeteer.use(StealthPlugin())
puppeteer.use(require('puppeteer-extra-plugin-anonymize-ua')())

const start = async (delete_) => {
    if (delete_) {
        deleteOldOrders();
    }
    var context = {
        browser : null,
        intialPage : null,
    }
    const browser = await getBrowser();
    const initialPage = await getInitialPage();
    const purchasesPage = await navigateToMyPurchases();

    const orderDetailsLinks = await getOrderPageLinks()
    
    const orderPages = await createOrderPages();

    await navigateOrderPagesToOrderDetails();

    const orders = await getOrders();

    writeOrdersToDisk();

    await browser.close();

    //HELPER CLOSURES:
    async function getBrowser() {
        const browser_path = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
        //const options = { executablePath: browser_path, headless: false }
        const browser = await puppeteer.launch({headless:false});
        return browser;
    }

    async function getInitialPage() {

        const page = (await browser.pages())[0];
        /*page.on('dialog', async dialog => {
          console.log(dialog.message());
          await dialog.dismiss();
        });*/
    
        await page.goto('https://www.kingsoopers.com/signin/');
    
        return page;
    }

    async function navigateToMyPurchases(){

        await initialPage.type("#SignIn-emailInput", "jon.the.bon.bon@gmail.com")
        await initialPage.type("#SignIn-passwordInput", "hFvGf6uV_P#FwyF")
    
        await Promise.all([initialPage.click("#SignIn-submitButton"), initialPage.waitForNavigation()])
    
        await initialPage.goto('https://www.kingsoopers.com/mypurchases');
    
        return initialPage;
    }

    async function getOrderPageLinks() {
        return await purchasesPage.$$eval('a[data-testid="order-details-link"]', async (anchors) => {
            return await anchors.map(anchor => anchor.href);
        });
    }
    
    async function createOrderPages(){
    
        var newPagePromises = new Array();
        orderDetailsLinks.forEach(() => {
            newPagePromises.push(browser.newPage())
        })
    
        return await Promise.all(newPagePromises);
    }
    
    async function navigateOrderPagesToOrderDetails(){
    
        var pageGotoPromises = [];
        orderPages.forEach((orderPage, index) => {
            pageGotoPromises.push(orderPage.goto(orderDetailsLinks[index], { waitUntil: 'load' }))
        })
    
        return await Promise.all(pageGotoPromises)
    }
    
    async function getOrders(){
    
        var orderSelectPromises = new Array()
        orderPages.forEach((orderPage) => {
            orderSelectPromises.push(orderPage.$$('div.PH-ProductCard-container.w-full.p-16'))
        })
    
        return await Promise.all(orderSelectPromises)
    }
    
    async function writeOrdersToDisk(){
    
        orders.forEach(async (order, num) => {
            var itemString = "";

            order.forEach(async (item) => {
                var elementJson = await item.jsonValue();
                var elementString = elementJson.toString();

                itemString += `${elementString}+\n`
            })

            await fs.writeFile(`./orders/order-${num}`, itemString, (err)=> {
                if(err){
                    console.log(itemString)
                    console.log(err)
                }
            })
        })
    }
}//start

const deleteOldOrders = () => {
    const dir = "orders"
    try {
        fs.rmdirSync(dir, { recursive: true });
        console.log(`${dir} dir deleted!`);
        fs.mkdirSync("orders")
        console.log(`fresh ${dir} dir created!`);
    } catch (err) {
        console.error(`Error while deleting ${dir}.`);
    }
}

start(true)