const { chromium } = require('playwright');
const axios = require('axios');
const cron = require('node-cron');
require('dotenv').config();


//Käytetään ympäristömuuttujia

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

//Lounaslinkit
 
    const urls = [
        'https://fi.jamix.cloud/apps/menu/?anro=93077&k=49&mt=111',
        'https://fi.jamix.cloud/apps/menu/?anro=93077&k=69&mt=84',
        'https://mealdoo.com/week/uniresta/julinia/ravintolajulinia?theme=light--light-green',
        'https://mealdoo.com/week/uniresta/lipasto/ravintolalipasto?theme=light--light-green'
    ];

    // Telegram viestitys

    async function sendToTelegram(message) {
        const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
        try {
            await axios.post(url, {
                chat_id: CHAT_ID,
                text: message,
                //parse_mode: 'Markdown'
            });
            console.log("Viesti lähetetty telegramiin.");
        } catch (error) {

            if (error.response) {
                console.error("❌ Telegram-virhe:", error.response.status);
                console.error("Virheviesti:", error.response.data);
            } else {
                console.error("❌ Telegram-virhe:", error.message);
            }
    }
}

    // Hae yhdestä Urlista 

    async function fetchLunchDataFromUrl(url) {
        const browser = await chromium.launch({ headless: false, slowMo: 300 });
        const page = await browser.newPage();

        try {
            console.log(`Avaa: ${url}`);
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000});

            await page.waitForTimeout(5000); // Odota JS-renderöinti
        const bodyText = await page.locator('body').innerText();
            //Odota, että ruokalista latautuu

           // await page.waitForSelector('div.layout', {timeout: 20000});
           // const browser = await chromium.launch({ headless: false, slowMo: 300 });

            //const content = await page.locator('body').innerText();

            //Hae kaikki näkyvät tekstit
            //const texts = await page.locator('div.vaadin-grid-cell-content').allTextContents();
            //const bodyText = await page.locator('body').innerText();
            await browser.close();

            const lines = bodyText
            .split('\n')
            .map(line => line.trim())
            .filter(line => line !== '');

            return [`Lähde: ${url}`, ...lines.slice(0, 10), ''];
        } catch (error) {
            console.error(`Virhe haettaessa: ${url}`);
            console.error(error.message);
            await browser.close ();
            throw error;
        }

    }


        

  

    // Haetaan kaikista

    async function fetchMultipleLunchData() {

    let allLunchData = [];

    for (let url of urls) {
        console.log(`Haetaan: ${url}`);
        try {
            const lunchData = await fetchLunchDataFromUrl(url);
            allLunchData = allLunchData.concat(lunchData);
        } catch (error) {
            allLunchData.push(`Virhe haettaessa ${url}`);
        }
        
    }
    return allLunchData;
}

//päärunko
async function run() {
    
    await sendToTelegram("Tekstiviesti toimii?");

    const data = await fetchMultipleLunchData();
    const message = data.join('\n');
    if (message.length > 4096) {
        console.error("⚠️ Viesti liian pitkä Telegramille!");
        await sendToTelegram("Viesti liian pitkä. Tarkista lounasdata.");
        return;
    }
    await sendToTelegram(message);
}


// Voi ajaa käsin tai ajastetusti

/*cron.schedule('0 9 * * *', () => {
    console.log(" Ajetaan cron");
    run();
});*/

//Tai aja heti:

run ();
