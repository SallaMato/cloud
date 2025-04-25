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
            const browser = await chromium.launch({ headless: true });
            const page = await browser.newPage();
            try {
                console.log(`Avaa: ${url}`);
                await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
                await page.waitForTimeout(5000); // Odota JS-renderöinti
       
               
       
                let lines = [];
       
                if (url.includes("jamix.cloud")) {
                    // JAMIX: uusi valitsin joka sisältää kaikki päivän ruuat
                    const selector = '#main-view > div > div > div.v-slot.v-slot-main-view__content.v-slot-borderless.v-align-center.v-align-middle > div > div.v-panel-content.v-panel-content-main-view__content.v-panel-content-borderless.v-scrollable > div';
               
                    await page.waitForSelector(selector, { timeout: 15000 });
               
                    const content = await page.locator(selector).innerText();
                    const linesRaw = content.split('\n').map(line => line.trim()).filter(Boolean);
               
                    lines = linesRaw;
               
 
                } else if (url.includes("mealdoo.com")) {
                    console.log("Haetaan Mealdoo-sivulta:", url);
               
                    // Otetaan screenshotti, debugia varten
                    await page.screenshot({ path: 'mealdoo.png', fullPage: true });
               
                    // Odotetaan että joku päivä on avattuna (mat-expanded)
                    await page.waitForSelector('mat-expansion-panel.mat-expanded .mat-expansion-panel-body', { timeout: 10000 });
               
                    const content = await page.$eval(
                        'mat-expansion-panel.mat-expanded .mat-expansion-panel-body',
                        el => el.innerText.trim()
                    );
               
                    if (!content) {
                        lines = [`Ei löytynyt ruokia osoitteesta: ${url}`];
                    } else {
                        lines = content
                            .split('\n')
                            .map(line => line.trim())
                            .filter(Boolean);
                    }
               
               
               
               
               
               
               
                } else {
                    lines = ['Tuntematon sivusto: ei osattu käsitellä.'];
                }
       
                await browser.close();
       
                if (!lines.length) return [`Lähde: ${url}`, 'Ei löytynyt tietoa tältä päivältä.', ''];
                const title = url.includes("jamix.cloud")
                    ? (url.includes("k=49") ? "📍 Foodoo" : "📍 Vanilla") // Esimerkki: tunnisteet urlista
                    : (url.includes("julinia") ? "📍 Julinia" : "📍 Lipasto");
 
                const today = new Date();
                const day = today.getDate().toString().padStart(2, '0');
                const month = (today.getMonth() + 1).toString().padStart(2, '0');
                const year = today.getFullYear();
                const dateStr = `${day}.${month}.${year}`;
 
                const pretty = [`${title} (${dateStr})`, ...lines.map(line => `- ${line}`)];
 
                return pretty;
 
       
            } catch (error) {
                console.error(`Virhe haettaessa: ${url}`);
                console.error(error.message);
                await browser.close();
                return [`Virhe haettaessa ${url}: ${error.message}`];
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