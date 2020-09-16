const puppeteer = require('puppeteer-core');
const listenCrash = require('./listenCrash');
const servicesStatus = require('./servicesStatus');
const { loggerServer } = require('./log');
const { CHROME_PATH, USER_DATA_DIR, EXTENSIONS_DIR } = require('./constants');
const event = require('./events');

const options = {
  headless: false,
  executablePath: CHROME_PATH,
  args: [
    '--autoplay-policy=no-user-gesture-required',
    '--enable-usermedia-screen-capturing',
    '--allow-http-screen-capture',
    '--remote-debugging-port=9222',
    '--whitelisted-extension-id=cnlcagjlokccajjeehpfccjlkgflmmgj',
    `--load-extension=${EXTENSIONS_DIR}`,
    `--disable-extensions-except=${EXTENSIONS_DIR}`,
    '--disable-infobars',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-background-timer-throttling',
    `--window-size=1920,1080`,
    '--unsafely-treat-insecure-origin-as-secure=http://127.0.0.1',
    `--user-data-dir=${USER_DATA_DIR}`,
  ]
};

module.exports = async () => {
  const browser = await puppeteer.launch(options);

  browser.on('targetcreated', (target)=>{
    target.page()
    .then(page=>{
      if(!page) return;

      // 录制页才会执行, 并获得监听停止能力
      page.exposeFunction('listenStop', ()=>{

        event.onRecordStop(()=>{
          page.evaluate(()=>{
            window.rebirth && window.rebirth.stop();
          })
        })

      })

      // 执行初始化, 开始录制, 并启动监听停止
      page.evaluate(()=>{
        // 等待插件告知
        window.addEventListener('message',(e=>{
          // 确定是录制页面
          if (!e.data || !e.data.isRecordingPage) return;
          window.listenStop();
          // 可以开始录制
          if(e.data.hasReady){
            window.rebirth && window.rebirth.init();
            window.rebirth && window.rebirth.start();
          }
        }), false)
      })

    })
  })

  const pages = await browser.pages();
  const page = pages[0];
  await page.goto('http://127.0.0.1');
  loggerServer.info('chrome open');
  listenCrash();

  // Normal shutdown
  page.on('close', () => {
    loggerServer.info('chrome close');
    servicesStatus.setChromeClose = true;
  });

  page.on('error', () => {
    loggerServer.error('chrome main page is crash');
    servicesStatus.setChromeError = true;
  });
};
