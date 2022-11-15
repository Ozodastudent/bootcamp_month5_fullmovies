// calling elements from html file
const elMovieList = document.querySelector(".list");
const elForm = document.querySelector(".form");
const elFormSearchInput = document.querySelector(".search_input");
const selectEl = document.querySelector(".form_select_element");
const selectOptionEl = document.querySelector(".form_select_option");
const fromYearInput = elForm.querySelector(".js-min-year");
const toYearInput = elForm.querySelector(".js-max-year");
const sortSelectEL = elForm.querySelector(".js-sort-movies");
const bookmarkListEl = document.querySelector(".bookmark_list");
const genres = [];

const localBookMark = JSON.parse(localStorage.getItem("bookmark"));
const bookmarkArr = localBookMark || [];

// MODAL
const elModal = document.querySelector(".modal");
const modalTitle = elModal.querySelector(".modal-title");
const modalIframe = elModal.querySelector(".modal-iframe");
modalIframe.classList.add("modal_img");
const modalRating = elModal.querySelector(".modal-rating");
const modalYear = elModal.querySelector(".modal-year");
const modalRuntime = elModal.querySelector(".modal-runtime");
const modalCategories = elModal.querySelector(".modal-categories");
const modalSummary = elModal.querySelector(".modal-summary");
const modalLink = elModal.querySelector(".modal-imdb-link");

// getduration
function getDuration(time) {
  const hours = Math.floor(time / 60);
  const minuts = Math.floor(time % 60);
  return `${hours} hrs ${minuts} min  `;
}

// genres section
function getGenres() {
  fullMovies.forEach((item) => {
    item.categories.forEach((genre) => {
      if (!genres.includes(genre)) {
        genres.push(genre);
      }
    });
  });
  genres.sort();
}
// rendering genres
function renderGenres() {
  const genresFragment = document.createDocumentFragment();
  genres.forEach((item) => {
    const newSelectOption = document.createElement("option");
    newSelectOption.textContent = item;
    newSelectOption.value = item;
    genresFragment.appendChild(newSelectOption);
  });
  selectEl.appendChild(genresFragment);
}

function renderMovies(kino, regex = "") {
  elMovieList.innerHTML = "";
  const elMovieTemp = document.querySelector(".js-movie-template").content;
  const elMovieFragment = new DocumentFragment();
  kino.forEach((item) => {
    const elCloneMovie = elMovieTemp.cloneNode(true);
    elCloneMovie.querySelector(".movie-img").src = item.poster_md;
    if (regex.source != "(?:)" && regex) {
      elCloneMovie.querySelector(".movie-title").innerHTML = item.title.replace(
        regex,
        `<mark class="bg-warning">${regex.source.toLowerCase()}</mark>`
      );
    } else {
      elCloneMovie.querySelector(".movie-title").textContent = item.title;
    }
    elCloneMovie.querySelector(".movie-rating").textContent = item.imdb_rating;
    elCloneMovie.querySelector(".movie-year").textContent = item.movie_year;
    elCloneMovie.querySelector(".movie-runtime").textContent = getDuration(
      item.runtime
    );
    elCloneMovie.querySelector(".movie-categories").textContent =
      item.categories.join(", ");
    elCloneMovie.querySelector(".movie-btn").dataset.id = item.imdb_id;
    elCloneMovie.querySelector(".bookmark_btn").dataset.id = item.imdb_id;
    elMovieFragment.appendChild(elCloneMovie);
  });
  elMovieList.appendChild(elMovieFragment);
}

// modal function
function renderModalInfo(topilganKino) {
  modalTitle.textContent = topilganKino.title;
  modalIframe.src = topilganKino.yt_iframe;
  modalRating.textContent = topilganKino.imdb_rating;
  modalYear.textContent = topilganKino.movie_year;
  modalRuntime.textContent = getDuration(topilganKino.runtime);
  modalCategories.textContent = topilganKino.categories.join(", ");
  modalSummary.textContent = topilganKino.summary;
  modalLink.href = topilganKino.imdb_id_link;
}

// bookmark function
function bookmarkedFunc(markedItem, element) {
  element.innerHTML = "";
  const bookmarkFragment = document.createDocumentFragment();
  markedItem.forEach((item) => {
    const bookmarkItem = document.createElement("li");
    bookmarkItem.classList.add("card");
    bookmarkItem.classList.add("bookmark_list_item");
    const bookmarkImg = document.createElement("img");
    bookmarkImg.src = `https://i3.ytimg.com/vi/${item.yt_id}/mqdefault.jpg `;
    const markTitle = document.createElement("h5");
    markTitle.style.paddingTop = "20px";
    const markCategory = document.createElement("p");
    const markBtnRemove = document.createElement("button");
    markBtnRemove.type = "button";
    markTitle.textContent = item.title;
    markCategory.textContent = item.categories;
    markBtnRemove.textContent = "Remove";
    markBtnRemove.classList.add("remove_btn");
    markBtnRemove.dataset.id = item.imdb_id;
    bookmarkItem.appendChild(bookmarkImg);
    bookmarkItem.appendChild(markTitle);
    bookmarkItem.appendChild(markCategory);
    bookmarkItem.appendChild(markBtnRemove);
    bookmarkFragment.appendChild(bookmarkItem);
  });
  window.localStorage.setItem("bookmark", JSON.stringify(bookmarkArr));
  bookmarkListEl.appendChild(bookmarkFragment);
}
bookmarkedFunc(bookmarkArr, bookmarkListEl);

// listening lists
elMovieList.addEventListener("click", (evt) => {
  const targetElement = evt.target;
  if (targetElement.matches(".movie-btn")) {
    const btnId = targetElement.dataset.id;
    const foundMovie = fullMovies.find((movie) => movie.imdb_id === btnId);
    renderModalInfo(foundMovie);
  }
  if (targetElement.matches(".bookmark_btn")) {
    const bookmarkId = targetElement.dataset.id;
    const markedEl = fullMovies.find((mark) => mark.imdb_id === bookmarkId);
    if (!bookmarkArr.includes(markedEl)) {
      bookmarkArr.push(markedEl);
      bookmarkedFunc(bookmarkArr, bookmarkListEl);
    }
  }
});

// deleting bookmark elements
bookmarkListEl.addEventListener("click", function (evt) {
  evt.preventDefault();
  if (evt.target.matches(".remove_btn")) {
    const removeBtnId = evt.target.dataset.id;
    const removeBtnFound = bookmarkArr.findIndex(
      (item) => item.imdb_id === removeBtnId
    );
    bookmarkArr.splice(removeBtnFound, 1);
    window.localStorage.setItem("bookmark", JSON.stringify(bookmarkArr));
    bookmarkedFunc(bookmarkArr, bookmarkListEl);
  }
});

// hiding audio of the videos
elModal.addEventListener("hide.bs.modal", function () {
  modalIframe.src = "";
});

function searchMoviesRendering(search) {
  const filteredMovies = fullMovies.filter((item) => {
    const optionList =
      item.title.match(search) &&
      (selectEl.value == "all" || item.categories.includes(selectEl.value)) &&
      (fromYearInput.value == "" ||
        item.movie_year >= Number(fromYearInput.value)) &&
      (toYearInput.value == "" ||
        item.movie_year <= Number(fromYearInput.value));
    return optionList;
  });
  return filteredMovies;
}
// sorting part
function sortMovies(sortArr, sortingType) {
  if (sortingType == "a-z") {
    sortArr.sort((a, b) => {
      if (a.title.toLowerCase() > b.title.toLowerCase()) return 1;
      if (a.title.toLowerCase() < b.title.toLowerCase()) return -1;
      return 0;
    });
  }
  if (sortingType == "z-a") {
    sortArr.sort((a, b) => {
      return (
        b.title.toLowerCase().charCodeAt(0) -
        a.title.toLowerCase().charCodeAt(0)
      );
    });
  }
  if (sortingType == "oldest-latest") {
    sortArr.sort((a, b) => a.movie_year - b.movie_year);
  }

  if (sortingType == "latest-oldest") {
    sortArr.sort(function (a, b) {
      return b.movie_year - a.movie_year;
    });
  }
  if (sortingType == "low-rating") {
    sortArr.sort((a, b) => a.imdb_rating - b.imdb_rating);
  }

  if (sortingType == "high-rating") {
    sortArr.sort((a, b) => b.imdb_rating - a.imdb_rating);
  }
}
// Search part
elForm.addEventListener("submit", function (evt) {
  evt.preventDefault();
  const searchInputValue = elFormSearchInput.value.trim();
  const searchInputValueRegex = new RegExp(searchInputValue, "gi");
  const searchMovieEl = searchMoviesRendering(searchInputValueRegex);
  if (searchMovieEl.length > 0) {
    sortMovies(searchMovieEl, sortSelectEL.value);
    renderMovies(searchMovieEl, searchInputValueRegex);
  } else {
    elMovieList.innerHTML = "Not found!!!";
  }
});
getGenres();
renderGenres();
renderMovies(fullMovies.slice(0, 101));
