const puppeteer = require('puppeteer-extra');
const fs = require("fs");
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { executablePath } = require('puppeteer');
puppeteer.use(StealthPlugin())
puppeteer.use(require('puppeteer-extra-plugin-anonymize-ua')())

const start = async (delete_) => {
  if(delete_){
    deleteOldOrders();
  }  
  //const options = {executablePath: 'C:\Program Files (x86)\Google\Chrome\Application', headless: false}
  const browser = await puppeteer.launch();
  const page = (await browser.pages())[0];

  page.on('dialog', async dialog => {
    console.log(dialog.message());
    await dialog.dismiss();
	});

  await page.goto('https://www.kingsoopers.com/signin/');

  //await page.screenshot({ path: './screenshots/initialLogin.png' })

  await page.type("#SignIn-emailInput", "jon.the.bon.bon@gmail.com")
  await page.type("#SignIn-passwordInput", "hFvGf6uV_P#FwyF")
  //await page.screenshot({ path: './screenshots/loginafterTyping.png' })

  const res = await Promise.all([page.click("#SignIn-submitButton"), page.waitForNavigation()])

  //await page.screenshot({ path: './screenshots/afterNav.png' })

  await page.goto('https://www.kingsoopers.com/mypurchases');

  const links = await page.$$eval('a[data-testid="order-details-link"]', async (anchors) =>{
    return anchors.map(anchor => anchor.href);
  });
  var newPagePromises = new Array();
  links.forEach(()=>{
    newPagePromises.push(browser.newPage())
  })

  const emptyPages = await Promise.all(newPagePromises);  

  var pageGotoPromises = [];
  emptyPages.forEach((orderPage, index) => {
    pageGotoPromises.push(orderPage.goto(links[index],{waitUntil: 'domcontentloaded'} ))
  })

  const orderPages = await Promise.all(pageGotoPromises)

  var orderSelectPromises = new Array()
  orderPages.forEach((orderPage) => {
    orderSelectPromises.push(orderPage.$$('div.PH-ProductCard-container.w-full.p-16'))
    console.log(orderSelectPromises)
  })  
  const orders = await Promise.all(orderSelectPromises)
  orders.forEach((order, num)=>{
    var orderString = JSON.stringify(order)
    fs.write(`./orders/orders/order-${num}`, orderString)
  })
  await browser.close();
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