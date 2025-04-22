const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get("/tapahtumat", async (req, res) => {
    const nyt = new Date();
    const kuukausi = nyt.getMonth() + 1;
    const paiva = nyt.getDate();

    const url = `https://fi.wikipedia.org/api/rest_v1/page/summary/${kuukausi}_${paiva}`;

    try {
        const vastaus = await fetch(url);
        const data = await vastaus.json();
        res.json({ tapahtumat: data.extract || "Ei löytynyt tapahtumia." });
    } catch (err) {
        res.status(500).json({ error: "Virhe haettaessa tietoa" });
    }
});

app.listen(PORT, () => {
    console.log(`Palvelin käynnissä portissa ${PORT}`);
});
