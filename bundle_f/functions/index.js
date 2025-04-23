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
  
    const otsikko = `${paiva}._${kuukausi}`;
    const url = `https://fi.wikipedia.org/wiki/${otsikko}`;
  
    try {
      const vastaus = await fetch(url);
      const html = await vastaus.text();
      const $ = cheerio.load(html);
      const tapahtumat = [];
  
      // Etsi <span> elementti, jonka id on "Tapahtumia"
      const span = $('span#Tapahtumia');
  
      if (span.length === 0) {
        return res.json({ tapahtumat: ["Ei löytynyt tapahtumia."] });
      }
  
      // Etsi spanin vanhempi <h2> elementti
      const h2 = span.closest('h2');
  
      // Etsi seuraava <ul> elementti h2:n jälkeen
      let seuraava = h2.next();
      while (seuraava.length && seuraava[0].name !== 'ul') {
        seuraava = seuraava.next();
      }
  
      if (seuraava.length === 0) {
        return res.json({ tapahtumat: ["Ei löytynyt tapahtumia."] });
      }
  
      // Kerää kaikki <li> elementit
      seuraava.find('li').each((_, li) => {
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
