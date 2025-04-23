const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const cheerio = require("cheerio");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get("/tapahtumat", async (req, res) => {
    // Testataan kiinteällä päivämäärällä: 23. huhtikuuta
    const otsikko = "23._huhtikuuta";
    const url = `https://fi.wikipedia.org/wiki/${otsikko}`;

    try {
        const vastaus = await fetch(url);
        const html = await vastaus.text();

        const $ = cheerio.load(html);
        const tapahtumat = [];

        // Etsitään <h2> jonka sisältö on "Tapahtumat"
        const otsikkoElem = $("h2").filter((_, elem) => {
            return $(elem).text().trim().toLowerCase().includes("tapahtumat");
        }).first();

        if (!otsikkoElem.length) {
            return res.json({ tapahtumat: ["Tapahtumat-osiota ei löytynyt."] });
        }

        // Haetaan seuraavat <ul> elementit sen jälkeen
        let seuraava = otsikkoElem.next();
        while (seuraava.length && seuraava[0].tagName !== "h2") {
            if (seuraava[0].tagName === "ul") {
                seuraava.find("li").each((_, li) => {
                    tapahtumat.push($(li).text().trim());
                });
                break; // Haetaan vain ensimmäinen tapahtumalista
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
