//Luodaan node.js web-kehys express
const express = require ('express');

//Luodaan express sovellus, jossa express sovellus ja app on palvelvin

const app = express();

//määritellään reitti

app.get('/', (req, res) => {
    res.send('Hello world from Render!');
});

//Määritetään portti, jos render määrittää portin, käytämme sitä, jos ei käytetään porttia 3000
const PORT = process.env.PORT || 3000;
//app.lis.. käynnistää palvelimen
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
