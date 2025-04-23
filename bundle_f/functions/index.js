const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const cheerio = require("cheerio");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get("/tapahtumat", async (req, res) => {
    const nyt = new Date();
    const kuukausi = nyt.toLocaleString("fi-FI", { month: "long" }).toLowerCase();
    const paiva = nyt.getDate();

    const otsikko = `${paiva}._${kuukausi}`; // esim. "23._huhtikuuta"
    const url = `https://fi.wikipedia.org/wiki/${otsikko}`;

    try {
        const vastaus = await fetch(url);
        const html = await vastaus.text();

        const $ = cheerio.load(html);
        const tapahtumat = [];

        // Etsi oikea <h2>, jonka sisällä on span.mw-headline ja teksti "Tapahtumia"
        let tapahtumatOtsikko = null;

        $("h2").each((_, el) => {
            const otsikkoTeksti = $(el).find("span.mw-headline").text().trim();
            if (otsikkoTeksti === "Tapahtumia") {
                tapahtumatOtsikko = $(el);
                return false; // break loop
            }
        });

        if (!tapahtumatOtsikko) {
            return res.json({ tapahtumat: ["Ei löytynyt tapahtumia."] });
        }

        // Etsi seuraava <ul>-lista
        const tapahtumaLista = tapahtumatOtsikko.nextAll("ul").first();

        tapahtumaLista.find("li").each((_, li) => {
            tapahtumat.push($(li).text());
        });

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
