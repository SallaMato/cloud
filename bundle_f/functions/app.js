document.getElementById("hae").addEventListener("click", async () => {
    try {
        const response = await fetch("https://<TÄHÄN-YOUR-RENDER-URL>.onrender.com/tapahtumat");
        const data = await response.json();
        document.getElementById("tulokset").innerHTML = data.tapahtumat;
    } catch (error) {
        console.error("Virhe haettaessa tapahtumia", error);
    }
});
