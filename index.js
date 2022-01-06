const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin())

const start = async () => {
  /*const args = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-infobars',
    '--window-position=0,0',
    '--ignore-certifcate-errors',
    '--ignore-certifcate-errors-spki-list',
    '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"'
  ];
  const options = {
    args,
    headless: false
  };

  const browser = await puppeteer.launch(options);*/
  const browser = await puppeteer.launch({headless: false});
  const page = (await browser.pages())[0];

  /*page.on('request', async () => {
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36')
  })*/

  //await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36')
  await page.goto('https://www.kingsoopers.com/signin/');

  await page.screenshot({ path: './images/initialLogin.png' })

  await page.type("#SignIn-emailInput", "jon.the.bon.bon@gmail.com")
  await page.type("#SignIn-passwordInput", "hFvGf6uV_P#FwyF")
  await page.screenshot({ path: './images/loginafterTyping.png' })

  await Promise.all([page.click("#SignIn-submitButton"), page.waitForNavigation()])

  await page.screenshot({ path: './images/afterNav.png' })
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

//google();
start();