const puppeteer = require('puppeteer');


const start = async () => {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  //await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36')
  await page.goto('https://www.kingsoopers.com/signin/');
  await page.screenshot({ path: 'initialLogin.png' })

  await page.type("#SignIn-emailInput", "jon.the.bon.bon@gmail.com")
  await page.type("#SignIn-passwordInput", "hFvGf6uV_P#FwyF")
  await page.screenshot({ path: 'loginWithLogin.png' })
  await Promise.all([page.click("#SignIn-submitButton"), page.waitForNavigation({waitUntil: 'networkidle2'})]).catch((e)=>{
    console.log(e);
  })
  

  await page.screenshot({ path: 'afterLogin.png' })
  //await browser.close();
}

const google = async () => {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  //await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36')
  await page.goto('https://www.google.com');
  await page.screenshot({ path: 'initialgoogle.png' })

  await page.type("input.gLFyf.gsfi", "jon.the.bon.bon@gmail.com")
  await page.screenshot({ path: 'googleTyped.png' })
  await Promise.all([page.click("input.gNO89b"), page.waitForNavigation({waitUntil: 'networkidle2'})])
  await page.screenshot({ path: 'afterLogin.png' })
  //await browser.close();
}

//google();
start();