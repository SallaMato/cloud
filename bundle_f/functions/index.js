const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const cheerio = require("cheerio"); // 👈 Uusi kirjasto HTML:n käsittelyyn

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get("/tapahtumat", async (req, res) => {
    const nyt = new Date();
    const kuukausi = nyt.toLocaleString("fi-FI", { month: "long" });
    const paiva = nyt.getDate();

    // Muodostetaan otsikko Wikipedia-sivulle, esim. "23._huhtikuuta"
    const sivuotsikko = `${paiva}._${kuukausi}`;
    const url = `https://fi.wikipedia.org/w/api.php?action=parse&page=${sivuotsikko}&format=json&origin=*`;

    try {
        const vastaus = await fetch(url);
        const data = await vastaus.json();

        const html = data.parse?.text["*"];
        if (!html) {
            return res.json({ tapahtumat: ["Ei löytynyt tapahtumia."] });
        }

        const $ = cheerio.load(html);
        const tapahtumat = [];

        // Etsitään "Tapahtumat"-osion sisältö
        let tapahtumatOsa = $("span#Tapahtumat").parent().nextUntil("h2");
        tapahtumatOsa.each((_, elem) => {
            if ($(elem).is("ul")) {
                $(elem).find("li").each((_, li) => {
                    tapahtumat.push($(li).text());
                });
            }
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
