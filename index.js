const puppeteer = require('puppeteer-extra');
const fs = require("fs");
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { executablePath } = require('puppeteer');
puppeteer.use(StealthPlugin())
puppeteer.use(require('puppeteer-extra-plugin-anonymize-ua')())

const path = require('path');

const start = async (delete_) => {
  if(delete_){
    deleteOldOrders();
  }  
  const browser = await getBrowser();
  const initialPage = await getInitialPage();
  await navigateToMyPurchases();  

  const orderDetailsLinks = await initialPage.$$eval('a[data-testid="order-details-link"]', async (anchors) =>{
    return anchors.map(anchor => anchor.href);
  });

  var newPagePromises = new Array();
  orderDetailsLinks.forEach(()=>{
    newPagePromises.push(browser.newPage())
  })
  const orderPages = await Promise.all(newPagePromises);  

  var pageGotoPromises = [];
  orderPages.forEach((orderPage, index) => {
    pageGotoPromises.push(orderPage.goto(orderDetailsLinks[index],{waitUntil: 'domcontentloaded'} ))
  })

  await Promise.all(pageGotoPromises)

  var orderSelectPromises = new Array()
  orderPages.forEach((orderPage) => {
    orderSelectPromises.push(orderPage.$$('div.PH-ProductCard-container.w-full.p-16'))
    console.log(orderSelectPromises)
  })  
  const orders = await Promise.all(orderSelectPromises)
  orders.forEach((order, num)=>{
    var itemString = "";
    order.forEach((item)=> {
      itemString +=`${item}+\n`
    })
    fs.write(`./orders/order-${num}`, itemString)
  })
  await browser.close();

  //HELPER CLOSURES:

  const getBrowser = async () => {
    const browser_path = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
    const options = {executablePath: browser_path, headless: false}
    const browser = await puppeteer.launch(options);
    return browser;
  }
  
  const getInitialPage = async () => {
    
    const page = (await browser.pages())[0];
    /*page.on('dialog', async dialog => {
      console.log(dialog.message());
      await dialog.dismiss();
    });*/
  
    await page.goto('https://www.kingsoopers.com/signin/');
  }

  const navigateToMyPurchases = async () => {
    
  await initialPage.type("#SignIn-emailInput", "jon.the.bon.bon@gmail.com")
  await initialPage.type("#SignIn-passwordInput", "hFvGf6uV_P#FwyF")

  await Promise.all([initialPage.click("#SignIn-submitButton"), initialPage.waitForNavigation()])

  await initialPage.goto('https://www.kingsoopers.com/mypurchases');
  }
}



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