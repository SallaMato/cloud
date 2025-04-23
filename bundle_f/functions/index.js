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

        // Etsitään <h2> jonka otsikkoteksti on "Tapahtumat"
        const otsikkoElem = $("h2").filter((_, elem) => {
            return $(elem).text().toLowerCase().includes("tapahtumat");
        }).first();

        const tapahtumaLista = otsikkoElem.nextAll("ul").first();
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
