const BASE_URL = "https://movie-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/movies/";
const POSTER_URL = BASE_URL + "/posters/";
const MOVIES_PER_PAGE = 12;

const movies = [];
let filterMovies = [];
let isCard = true; //立flag存取狀態改變: 是卡片還是清單顯示?
let currentPage = 1; //設global variable存取現在頁面，當切換顯示模式時抓取此頁碼

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#paginator");
const changeList = document.querySelector("#change-list");
const favortieMovies = JSON.parse(localStorage.getItem("favoriteMovies")) || []; //取出local stoerage裡面儲存的電影清單陣列，如果找不到，就賦值一個空陣列

function renderMovieList(datas) {
  for (data of datas) {
    favortieMovies.forEach((movie) => {
      if (data.id === movie.id) {
        data.addFavorite = "added-favorite";
        return;
      }
    });
  }
  console.log(datas);
  if (!isCard) {
    renderListView(datas);
  } else {
    renderCardView(datas);
  }
}

//電影清單兩種模式-模式1: render卡片畫面
function renderCardView(dataArr) {
  let rawHTML = ``;
  let addedFavorite = "";
  for (data of dataArr) {
    if (favortieMovies.some((movie) => movie.id === data.id))
      addedFavorite = "added-favorite";
    else addedFavorite = "";

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
                <button class="btn btn-info btn-add-favorite ${addedFavorite}" data-id="${
      data.id
    }">+</button>
              </div>
            </div>
          </div>
        </div>`;
  }

  dataPanel.innerHTML = rawHTML;
}

//電影清單兩種模式-模式2: render清單畫面
function renderListView(dataArr) {
  let rawHTML = `<table class="table table-hover" id="list-table">`;
  dataArr.forEach((data) => {
    if (favortieMovies.some((movie) => movie.id === data.id))
      addedFavorite = "added-favorite";
    else addedFavorite = "";
    rawHTML += `
        <tr>
          <td colspan="3"><h5 class="card-title">${data.title}</h5></td>
          <td>
            <button
              type="button"
              class="btn btn-primary btn-show-movie"
              data-bs-toggle="modal"
              data-bs-target="#movie-modal"
              data-id="${data.id}"
            >
              More
            </button>
            <button class="btn btn-info btn-add-favorite ${addedFavorite}" data-id="${data.id}">
              +
            </button>
          </td>
        </tr>
      `;
  });
  rawHTML += `</table>`;
  dataPanel.innerHTML = rawHTML;
}

// 傳入page render對應畫面
function getMovieByPage(page) {
  const startIndex = (page - 1) * MOVIES_PER_PAGE;
  const endIndex = startIndex + MOVIES_PER_PAGE;
  let data = filterMovies.length ? filterMovies : movies;

  return data.slice(startIndex, endIndex);
}

function renderPaginator(amount) {
  const numOfPages = Math.ceil(amount / MOVIES_PER_PAGE);
  let rawHTML = `<li class="page-item active"><a class="page-link" href="#" data-page="1">1</a></li>`;
  for (let page = 2; page <= numOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
  }
  paginator.innerHTML = rawHTML;
}

function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");

  axios.get(INDEX_URL + String(id)).then((response) => {
    const data = response.data.results;

    modalTitle.textContent = data.title;
    modalImage.innerHTML = `<img
                  src="${POSTER_URL + data.image}"
                  alt="movie-poster"
                  class="img-fuid"
                />`;
    modalDate.textContent = "Release Date: " + data.release_date;
    modalDescription.textContent = data.description;
  });
}

function addToFavorite(id) {
  const movie = movies.find((movie) => movie.id === id);
  if (favortieMovies.some((movie) => movie.id === id)) {
    return alert("此電影已經在收藏清單中");
  }
  movie.addFavorite = "added-favorite";
  favortieMovies.push(movie);
  localStorage.setItem("favoriteMovies", JSON.stringify(favortieMovies));
}

dataPanel.addEventListener("click", function onPanelClick(event) {
  const target = event.target;
  if (target.matches(".btn-show-movie")) {
    showMovieModal(Number(target.dataset.id));
  } else if (target.matches(".btn-add-favorite")) {
    addToFavorite(Number(target.dataset.id));
    target.classList.add("added-favorite");
  }
});

searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault();

  const keyword = searchInput.value.trim().toLowerCase();
  filterMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );

  if (!filterMovies.length) {
    searchInput.value = "";
    return alert(`Cannot find movie with keyword: ${keyword}`);
  }
  renderPaginator(filterMovies.length);
  renderMovieList(getMovieByPage(1));
});

paginator.addEventListener("click", function onPaginatorClick(event) {
  const target = event.target;
  if (target.tagName !== "A") return;

  const pageIcon = target.parentElement;
  currentPage = Number(target.dataset.page);
  const cleanActive = document.querySelector("#paginator .active");
  if (cleanActive) {
    cleanActive.classList.remove("active");
  }
  pageIcon.classList.add("active");

  renderMovieList(getMovieByPage(currentPage));
});

//改變list and card view: 事件監聽器
changeList.addEventListener("click", function onChangeButtonClick(event) {
  const target = event.target;
  if (target.tagName !== "I") return;
  const cleanIcon = document.querySelector(".icon-active");
  cleanIcon.classList.remove("icon-active"); //清除所有active icon
  target.classList.add("icon-active"); //點擊icon強調

  //改flag狀態
  if (target.matches(".list-icon")) {
    isCard = false;
  } else {
    isCard = true;
  }

  renderMovieList(getMovieByPage(currentPage));
});

axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results);
    renderPaginator(movies.length);
    renderMovieList(getMovieByPage(1));
  })
  .catch((error) => console.log(error));
