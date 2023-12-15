const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

function search(query) {
  console.log("chiamata", query);

  if (!query) {
    searchResults.innerHTML = "";
    return;
  }

  const apiUrl = `https://deezerdevs-deezer.p.rapidapi.com/search?q=${query}`;
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": token,
      "X-RapidAPI-Host": "deezerdevs-deezer.p.rapidapi.com",
    },
  };

  fetch(apiUrl, options)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Errore nella risposta della rete");
      }
      return response.json();
    })
    .then((data) => displayResults(data))
    .catch((error) => {
      console.error("Errore durante la fetch:", error);
      searchResults.innerHTML = "Errore durante la ricerca.";
    });
}

function displayResults(data) {
  const results = data && data.data ? data.data : [];
  const html = results
    .map(
      (result) => `
        <div class="mt-2">
          <a href="album.html?albumId=${result.album.id}">
            <span><img src="${result.album.cover_small}" alt="${result.title} - ${result.artist.name}" /></span>
            <span>${result.title} - ${result.artist.name}</span>
          </a>
        </div>
`
    )
    .join("");

  searchResults.innerHTML = html || "Nessun risultato trovato.";
}

searchInput.addEventListener(
  "input",
  debounce(() => {
    const query = searchInput.value.trim();
    search(query);
  }, 500)
); // Aggiunge un ritardo prima della ricerca per ridurre le richieste

// Funzione Debounce per ridurre le chiamate durante la digitazione
function debounce(func, wait) {
  let timeout;
  return function () {
    const context = this,
      args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}
