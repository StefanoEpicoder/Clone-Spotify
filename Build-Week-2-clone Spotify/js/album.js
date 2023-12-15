const urlParams = new URLSearchParams(window.location.search);
const albumId = urlParams.get("albumId");
const audio = document.getElementById("myAudio");
const dataPlayer = document.getElementById("dataPlayer");
const dataPlayerMini = document.getElementById("playerMiniData");
const allPlayButtons = document.getElementsByClassName("playButtonClass");
const trackDuration = document.getElementById("trackDuration");
const timeProgress = document.getElementById("timeProgress");

window.addEventListener("DOMContentLoaded", () => {
	audio.addEventListener("timeupdate", updateProgress);

	// Aggiungo comportamento di tutti i tasti play
	addPlayPauseEvents();
});

function loadAlbumDetails() {
	if (!albumId) {
		console.error("ID dell'album mancante");
		return;
	}

	const url = `https://deezerdevs-deezer.p.rapidapi.com/album/${albumId}`;
	const options = {
		method: "GET",
		headers: {
			"X-RapidAPI-Key": token,
			"X-RapidAPI-Host": "deezerdevs-deezer.p.rapidapi.com",
		},
	};

	fetch(url, options)
		.then((response) => {
			if (!response.ok) {
				throw new Error("Errore nella risposta della rete");
			}
			return response.json();
		})
		.then((albumDetails) => {
			document.getElementById("albumTitle-desktop").textContent =
				albumDetails.title;
			document.getElementById("albumTitle-mobile").textContent =
				albumDetails.title;
			document.getElementById("albumCover").src = albumDetails.cover_xl;
			document.getElementById("artistPicture").src =
				albumDetails.artist.picture;
			document.getElementById("artistPicture").alt =
				albumDetails.artist.name;
			document.getElementById("artistName").textContent =
				albumDetails.artist.name;
			document.getElementById(
				"artistName"
			).href = `artist.html?artistId=${albumDetails.artist.id}`;
			document.getElementById("year").textContent = new Date(
				albumDetails.release_date
			).getFullYear();
			document.getElementById(
				"numOfSongs"
			).textContent = `${albumDetails.tracks.data.length} brani  —`;
			document.getElementById("durationOfTrackList").textContent =
				formatAlbumDuration(albumDetails.tracks.data);
			pickColor(albumDetails);

			const tracksHtml = albumDetails.tracks.data
				.map(
					//trovato map / join per elaborare lista di oggetti, ogni traccia viene trasformata in questo caso in un div e join dopo unisce tutti gli elementi si sarebbe potuto fare tranquillamente con forEach
					(track, index) => `
                            <div class="row mt-4 track-row">
                              <div class="col-1 d-none d-sm-block">
                                <div class="d-flex align-items-center track-index">
                                  <p class="text-white me-3 mt-3 mb-0 index-number">${
										index + 1
									}</p>
                                  <button class="btn play-button fs-2 text-white playButtonClass" onclick=""><i class="bi bi-play-circle-fill fs-2"></i></button>
                                </div>
                              </div>
                              <div class="col-11 col-sm-4 ps-0">
                                <div>
                                  <p class="text-white mb-0 ps-4 ps-sm-0">${
										track.title
									}</p>
                                  <p class="text-white mb-0 ps-4 ps-sm-0">${
										track.artist.name
									}</p>
                                </div>
                              </div>
                              <div class="col-1 d-sm-none">
                                <div class="d-flex justify-content-end align-items-center">
                                  <i class="bi bi-three-dots-vertical text-secondary pe-1 mt-2" style="font-size: 20px"></i>
                                </div>
                              </div>
                              <div class="col-3 d-none d-sm-block">
                                <div class="d-flex justify-content-end align-items-center">
                                  <p class="text-white text-end pe-2 mb-0 mt-3">${track.rank.toLocaleString()}</p>
                                </div>
                              </div>
                              <div class="col-4 d-none d-sm-block">
                                <div class="d-flex justify-content-end align-items-center">
                                  <p class="text-white text-end me-3 mb-0 mt-3">${formatTrackDuration(
										track.duration
									)}</p>
                                </div>
                              </div>
                            </div>
  `
				)
				.join("");

			document.getElementById("tracksContainer").innerHTML = tracksHtml;

			// const playButtons =
			// 	document.getElementsByClassName("playButtonClass");
			// for (let i = 0; i < playButtons.length; i++) {
			// 	let trackData = albumDetails.tracks.data[i];
			// 	playButtons[i].addEventListener("click", (trackData) => {
			// 		if (audio.src !== trackData.preview) {
			// 			riempiDataPlayer(trackData);
			// 		} else {
			// 			togglePlayPause();
			// 		}
			// 	});
			// }

			// Carica i dettagli della prima canzone nel mini player se ci sono tracce
			if (albumDetails.tracks.data.length > 0) {
				riempiDataPlayer(albumDetails.tracks.data[0]);
			}
		})
		.catch((error) => {
			console.error("Errore durante la fetch:", error);
		});
}

function formatAlbumDuration(tracks) {
	const totalSeconds = tracks.reduce((acc, track) => acc + track.duration, 0);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;
	return `${hours ? `${hours} h ` : ""}${minutes} min ${seconds} sec`;
}

function formatTrackDuration(durationInSeconds) {
	const minutes = Math.floor(durationInSeconds / 60);
	const seconds = durationInSeconds % 60;
	return ` ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

loadAlbumDetails();

//////////////////////////////////////////////////////////////

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

//////////////////////////////////////////////////////////////

const pickColor = (track) => {
	const colorThief = new ColorThief();

	const imageUrl = track.cover_medium;

	const img = new Image();
	img.crossOrigin = "Anonymous";
	img.addEventListener("load", async function () {
		try {
			const dominantColor = await colorThief.getColor(img);

			console.log("Colore Dominante:", dominantColor);

			createGradient(dominantColor);
		} catch (error) {
			console.error("Errore durante l'estrazione del colore:", error);
		}
	});

	img.src = imageUrl;
};

function createGradient(dominantColor) {
	const rgbaColor = `rgba(${dominantColor.join(", ")})`;

	const gradient = document.getElementById("albumGradient");
	gradient.style.background = `linear-gradient(
    180deg,
    ${rgbaColor} 25%,
    rgba(0, 0, 0, 1) 100%
  )`;

	const gradient2 = document.getElementById("albumWrapper");
	gradient2.style.backgroundColor = `${rgbaColor}`;
}

function updateProgress(event) {
	const progressBar = document.getElementById("progressBar");

	let duration = event.currentTarget.duration;

	let currentTime = event.currentTarget.currentTime;

	const progressPercent = (currentTime / duration) * 100;
	progressBar.value = progressPercent;
	timeProgress.innerHTML = formatTrackDuration(Math.floor(currentTime));
	trackDuration.innerHTML = formatTrackDuration(Math.floor(duration));
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function playSong() {
	audio.play();
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function pauseSong() {
	audio.pause();
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function addPlayPauseEvents() {
	for (const button of allPlayButtons) {
		button.addEventListener("click", togglePlayPause);
	}
}
