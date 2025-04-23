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

        // Etsitään <h2> joka sisältää ID:n "Tapahtumia"
        const tapahtumatOtsikko = $("h2#Tapahtumia");

        if (tapahtumatOtsikko.length === 0) {
            return res.json({ tapahtumat: ["Ei löytynyt tapahtumia."] });
        }

        // Etsitään seuraava <ul>-elementti, joka sisältää tapahtumat
        const tapahtumaLista = tapahtumatOtsikko.nextAll("ul").first();

        // Käydään lista läpi ja lisätään jokainen tapahtuma
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
