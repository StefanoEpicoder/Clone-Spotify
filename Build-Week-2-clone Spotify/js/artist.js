const urlParams = new URLSearchParams(window.location.search);
const artistId = urlParams.get("artistId");
const url = `https://striveschool-api.herokuapp.com/api/deezer/artist/${artistId}`;
const audio = document.getElementById("myAudio");
const dataPlayer = document.getElementById("dataPlayer");
const dataPlayerMini = document.getElementById("playerMiniData");
const allPlayButtons = document.getElementsByClassName("playButtonClass");
const options = {
  method: "GET",
  headers: {},
};

// funz per caricare dati artista

function loadArtistDetails() {
  if (!artistId) {
    console.error("ID artista mancante");
    return;
  }

  fetch(url, options)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Errore nella risposta della rete");
      }
      return response.json();
    })
    .then((artistDetails) => {
      document.getElementById("artistName").textContent = artistDetails.name;
      document.getElementById("artistName2").textContent = artistDetails.name;
      document.getElementById("artistName3").textContent = artistDetails.name;
      document.getElementById("numFan").textContent = artistDetails.nb_fan.toLocaleString() + " ascoltatori mensili";
      document.getElementById("artistImg").src = artistDetails.picture;
      document.getElementById("artistImg2").src = artistDetails.picture;
      document.getElementById("artistBackground").src = artistDetails.picture_xl;
    });
}

// funz per caricare dati canzoni piu ascoltate

function loadTop5Songs() {
  fetch(url + "/top?limit=50", options)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Errore nella risposta della rete");
      }
      return response.json();
    })
    .then((tracks) => {
      console.log(tracks);
      const albumContainer = document.getElementById("albumContainer");
      const sortedTracks = tracks.data.sort((a, b) => b.rank - a.rank);
      const top5Tracks = sortedTracks.slice(0, 5);

      top5Tracks.forEach((data, index) => {
        const artistAlbum = document.createElement("div");
        artistAlbum.className = "row ms-1 align-items-center mb-2 track-row py-2";

        artistAlbum.innerHTML = `
        <div class="col-sm-12 col-md-7 col-lg-6 d-flex align-items-center fs-5 track-index">
          <span class="text-muted me-2 index-number">${index + 1}</span>
          <button class="btn play-button fs-2 text-white playButtonClass" onclick=""><i class="bi bi-play-circle-fill fs-2"></i></button>
          <img src="${data.album.cover_xl}" style="height: 60px" class="mx-2" />
          <span class="fs-6">
            ${data.title_short}<br />
            <p class="mb-0 text-muted d-block d-md-none">${data.rank.toLocaleString()}</p>
          </span>
          <a href="" class="d-block d-md-none ms-auto">
            <i class="bi bi-three-dots-vertical text-secondary fs-3"></i>
          </a>
        </div>
        <div class="col-md-2 col-lg-3 text-center">
          <p class="mb-0 text-muted d-none d-md-block">${data.rank.toLocaleString()}</p>
        </div>
        <div class="col-md-3 col-lg-3 text-end d-none d-lg-inline-block">
          <p class="mb-0 text-muted">${new Date(data.duration * 1000).toISOString().substr(14, 5)}</p>
        </div>
      `;
        const playButton = artistAlbum.querySelector(".play-button");
        playButton.addEventListener("click", () => {
          if (audio.src !== data.preview) {
            riempiDataPlayer(data);
          } else {
            togglePlayPause();
          }
        });
        albumContainer.appendChild(artistAlbum);
      });

      if (top5Tracks.length > 0) {
        riempiDataPlayer(top5Tracks[0]);
      }
    })
    .catch((error) => {
      console.error("Si è verificato un errore:", error);
    });
}

loadTop5Songs();
loadArtistDetails();

//////////////////////////////////////////////////////////////////
function riempiDataPlayer(data) {
  const previewAudioLink = data.preview;
  audio.src = data.preview;

  // vado a predisporre l'audio da riprodurre
  audio.innerHTML = `<source id="audioSource" src="${previewAudioLink}" type="audio/mp3" />`;

  // vado a riempire il player con i dati del'artista, titolo track e copertina album
  dataPlayer.innerHTML = ""; // prima lo svuoto dal riempimento fatto alla prima apertura della pagina
  dataPlayer.innerHTML = `
        
                <img
                    src="${data.album.cover_small}"
                    alt=""
                    style="height: 40px"
                />
                <div class="fs-6 px-3">
                    <a href="#"
                        ><p class="my-0 fw-bold text-white">
                            ${data.title_short}
                        </p></a
                    >
                    <a href="#"
                        ><p class="my-0">${data.artist.name}</p></a
                    >
                </div>
                <button
                    type="button"
                    class="btn text-secondary p-0"
                >
                    <i class="bi bi-heart"></i>
                </button>
    `;
  dataPlayerMini.innerHTML = ""; // prima lo svuoto dal riempimento fatto alla prima apertura della pagina
  dataPlayerMini.innerHTML = `
        
    <div class="col-7 d-flex">
    <div class="fs-6 pe-3">
        <a href="#"
            ><p class="my-0 fw-bold text-white">
            ${data.title_short}
            </p></a
        >
        <a href="#"><p class="my-0">${data.artist.name}</p></a>
    </div>
    `;
  for (const button of allPlayButtons) {
    button.addEventListener("click", togglePlayPause);
  }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// questo gruppo di funzioni gestisci i comportamenti dei tasti play, facendo distinzione tra tasti del player e tasto play nella hero section

// gestisco il comportamento in base allo stato della riproduzione
function togglePlayPause() {
  if (audio.paused) {
    audio.play();
    switchIconaPlayPause("pause");
  } else {
    audio.pause();
    switchIconaPlayPause("play");
  }
}

function switchIconaPlayPause(status) {
  for (const button of allPlayButtons) {
    if (button.getAttribute("id") === "playButtonHeroSection") {
      button.innerHTML = `<i class="bi bi-${status}-circle-fill fs-2 me-2"></i> <span>${status}</span>`;
    } else {
      button.innerHTML = `<i class="bi bi-${status}-circle-fill fs-2 text-white me-2"></i>`;
    }
  }
}
