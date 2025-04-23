const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const cheerio = require("cheerio");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get("/tapahtumat", async (req, res) => {
    const nyt = new Date();
    const kuukausi = nyt.toLocaleString("fi-FI", { month: "long" }).toLowerCase(); // esim. "huhtikuu"
    const paiva = nyt.getDate(); // esim. 23

    const otsikko = `${paiva}._${kuukausi}`; // esim. "23._huhtikuuta"
    const url = `https://fi.wikipedia.org/wiki/${otsikko}`;

    try {
        const vastaus = await fetch(url);
        const html = await vastaus.text();
        const $ = cheerio.load(html);
        const tapahtumat = [];

        // Etsi otsikko "Tapahtumat", joka on yleensä <span id="Tapahtumat">
        const tapahtumatAnchor = $('span#Tapahtumat').closest('h2');

        if (!tapahtumatAnchor.length) {
            return res.json({ tapahtumat: ["Tapahtumia ei löytynyt."] });
        }

        // Haetaan kaikki <ul>-elementit, jotka seuraavat tätä otsikkoa
        let seuraava = tapahtumatAnchor.next();
        while (seuraava.length && seuraava[0].tagName !== 'h2') {
            if (seuraava[0].tagName === 'ul') {
                seuraava.find('li').each((_, li) => {
                    tapahtumat.push($(li).text());
                });
            }
            seuraava = seuraava.next();
        }

        if (tapahtumat.length === 0) {
            tapahtumat.push("Ei löytynyt tapahtumia.");
        }

        res.json({ tapahtumat });
    } catch (err) {
        console.error("Virhe:", err);
        res.status(500).json({ error: "Virhe haettaessa tietoa." });
    }
});

app.listen(PORT, () => {
    console.log(`Palvelin käynnissä portissa ${PORT}`);
});
