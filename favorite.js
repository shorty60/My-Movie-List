const BASE_URL = "https://movie-list.alphacamp.io"
const INDEX_URL = BASE_URL + "/api/v1/movies/"
const POSTER_URL = BASE_URL + "/posters/"

const dataPanel = document.querySelector("#data-panel")
const movies = JSON.parse(localStorage.getItem("favoriteMovies"))

function renderMovieList(datas) {
  let rawHTML = " "
  // processing
  datas.forEach((data) => {
    rawHTML += `<div class="col-sm-3">
          <div class="mb-2">
            <div class="card">
              <img
                src="${POSTER_URL + data.image}"
                class="card-img-top"
                alt="Movie Poster"
              />
              <div class="card-body">
                <h5 class="card-title">${data.title}</h5>
              </div>
              <div class="card-footer">
                <button
                  type="button"
                  class="btn btn-primary btn-show-movie"
                  data-bs-toggle="modal"
                  data-bs-target="#movie-modal"
                  data-id="${data.id}"
                >
                  More
                </button>
                <button class="btn btn-danger btn-romove-favorite" data-id="${
                  data.id
                }">X</button>
              </div>
            </div>
          </div>
        </div>`
  })
  dataPanel.innerHTML = rawHTML
}

function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title")
  const modalImage = document.querySelector("#movie-model-image")
  const modalDate = document.querySelector("#movie-modal-date")
  const modalDescription = document.querySelector("#movie-modal-description")

  axios.get(INDEX_URL + String(id)).then((response) => {
    const data = response.data.results
    modalTitle.textContent = data.title
    modalImage.innerHTML = `<img
                  src="${POSTER_URL + data.image}"
                  alt="movie-poster"
                  class="img-fuid"
                />`
    modalDate.textContent = "Release Date: " + data.release_date
    modalDescription.textContent = data.description
  })
}

function removeFavorite(id) {
  if (!movies || !movies.length) return //如果是null沒有內容或是空陣列，則直接return
  const index = movies.findIndex((movie) => movie.id === id)
  if (index === -1) return

  movies.splice(index, 1)

  localStorage.setItem("favoriteMovies", JSON.stringify(movies))
  renderMovieList(movies)
}

dataPanel.addEventListener("click", function onPanelClick(event) {
  const target = event.target
  if (target.matches(".btn-show-movie")) {
    showMovieModal(Number(target.dataset.id))
  } else if (target.matches(".btn-romove-favorite")) {
    removeFavorite(Number(target.dataset.id))
  }
})

renderMovieList(movies)
