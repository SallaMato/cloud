document.getElementById("hae").addEventListener("click", async () => {
    try {
        const response = await fetch("https://historia-backend-0yu4.onrender.com/tapahtumat");
        const data = await response.json();

        document.getElementById("tulokset").innerHTML = data.tapahtumat
            .map(t => `<li>${t}</li>`)
            .join("");
    } catch (error) {
        console.error("Virhe haettaessa tapahtumia", error);
        document.getElementById("tulokset").innerHTML = "<li>Tietojen haku epäonnistui.</li>";
    }
});
