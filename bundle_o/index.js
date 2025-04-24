//Sama kuin bundle_j github actionsia varten

const express = require ('express');
const axios = require('axios');
const dotenv = require ('dotenv');

dotenv.config();

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));

//Etusivu ja hakulomake

app.get('/', (req,res) => {
    res.render('index', { movie: null, error: null});
});

//Lomakkeen käsittely ja API pyyntö

app.post('/search', async (req, res) => {
    const title= req.body.title;
    const apiUrl= `http://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${process.env.OMDB_API_KEY}`;


    try {
        const response = await axios.get(apiUrl);

        if ( response.data.Response === "False") {
            res.render('index', {movie:null, error: 'Elokuvaa ei löytynyt.'});
        } else {
            res.render('index', {movie: response.data, error: null});
        }
    } catch (error) {
        res.render('index', { movie: null, error: 'Virhe haettaessa elokuvaa'});
    }
});

app.listen(PORT, () => {
    console.log(`Sovellus pyörii osoitteessa http://localhost:${PORT}`);
});