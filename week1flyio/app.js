
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app= express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

app.get('/weather', async (req, res) => {
 

    try {
        const city = req.query.city;
        if (!city) {
            console.log("Error: City is required");
            return res.status(400).json({error: 'City is required'});
            
        }

        const apiKey = process.env.API_KEY;
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        console.log("Fetching weather data from:", url);
        const response = await axios.get(url);
        console.log("API Response:", response.data);

        res.json({
            city: response.data.name,
            temperature: response.data.main.temp,
            description: response.data.weather[0].description,
        });
    } catch (error) {
        console.error("Error fetching weather data:", error.message);
        res.status(500).json({error: 'Could not fetch weather data'});
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    

});

//Yksinkertainen reitti
// app.get('/', (req, res) =>{
//     res.send ('Hello World!');
// });

// app.listen(port, () => {
//     console.log(`Sovellus kuuntelee portissa ${port}`);

// });