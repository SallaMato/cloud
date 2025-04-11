require('dotenv').config(); //1.lataa env tiedoston käyttöön
//2. Lisätään kirjastot käyttöön
const axios = require('axios');//HTTP pyynnöt
const fs = require('fs'); //Tiedostojen lukeminen
const path = require('path'); //Polkujen käsittely

//3.Ladataan ympäristömuuttujat ja asetetaan arvot

const subscriptionKey =process.env.AZURE_KEY;
const endpoint = process.env.AZURE_ENDPOINT;

//4.kuvan polku ja tiedoston käsittely

const imagePath = path.join(__dirname, 'kuva.jpg');
const imageData = fs.readFileSync(imagePath);

//5. API pyynnön valmistelu

const url= `${endpoint}/vision/v3.2/analyze`;
const params = {
    visualFeatures: 'Description,Tags,Objects',
};

// HTTP pyynnön tekeminen Azurelle
const headers = {
    'Ocp-Apim-Subscription-Key': subscriptionKey, //Asure api avaimen lisäys
    'Content-Type': 'application/octet-stream', //Lähetetään kuva binäärimuodossa
};

//Lähetetään kuva Azurelle
axios
    .post(url, imageData, { headers: headers, params: params})
    .then(response => {
        //Tulostetaan azurelta saatu vastaus
        console.log('Analyysitulokset:');
        console.dir(response.data, { depth: null });
    })

    .catch(error => {
        console.error('Virhe API-kutsussa:', error.message);
    });