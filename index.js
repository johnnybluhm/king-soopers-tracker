const puppeteer = require('puppeteer');
const fs = require("fs");
/*const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin())*/

const start = async () => {
  deleteOldScreenshots();
  const browser = await puppeteer.launch({headless: false});
  const page = (await browser.pages())[0];

  await page.goto('https://www.kingsoopers.com/signin/');

  //await page.screenshot({ path: './screenshots/initialLogin.png' })

  await page.type("#SignIn-emailInput", "jon.the.bon.bon@gmail.com")
  await page.type("#SignIn-passwordInput", "hFvGf6uV_P#FwyF")
  //await page.screenshot({ path: './screenshots/loginafterTyping.png' })

  const res = await Promise.all([page.click("#SignIn-submitButton"), page.waitForNavigation()])

  
  //await page.screenshot({ path: './screenshots/afterNav.png' })

  /*while(page.$("#SignIn-submitButton")!=null){
    await Promise.all([page.click("#SignIn-submitButton"), page.waitForNavigation()])
  }*/

  await page.goto('https://www.kingsoopers.com/mypurchases');

  const links = await page.$$eval('a[data-testid="order-details-link"]', (anchors) =>{
    return anchors.map(anchor => anchor.href);
  });

  links.forEach((a)=>{
    console.log(a);
  })

  console.log(links);

  await browser.close();
}

const google = async () => {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  //await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36')
  await page.goto('https://www.google.com');
  await page.screenshot({ path: 'initialgoogle.png' })

  await page.type("input.gLFyf.gsfi", "jon.the.bon.bon@gmail.com")
  await page.screenshot({ path: 'googleTyped.png' })
  await Promise.all([page.click("div.FPdoLc.lJ9FBc input.gNO89b"), page.waitForNavigation({waitUntil: 'networkidle2'})])
  await page.screenshot({ path: 'afterLogin.png' })
  //await browser.close();
}
const deleteOldScreenshots = () => {
  const dir = "screenshots"
  try {
    fs.rmdirSync(dir, { recursive: true });
    console.log(`${dir} dir deleted!`);
    fs.mkdirSync("screenshots")
    console.log(`fresh ${dir} dir created!`);
} catch (err) {
    console.error(`Error while deleting ${dir}.`);
}
}

//google();
start();