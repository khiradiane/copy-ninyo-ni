class SearchView {
  _searchInput = document.querySelector("#search-input");
  _maxRentInput = document.querySelector("#max-rent");
  _form = document.querySelector("#search-form");
  _countEl = document.querySelector(".search__count");

  addSearchHandler(handler) {
    this._searchInput.addEventListener("input", (e) => {
      handler(e.target.value);
    });
  }

  addMaxRentHandler(handler) {
    this._maxRentInput.addEventListener("input", (e) => {
      handler(e.target.value);
    });
  }

  addFormHandler() {
    this._form.addEventListener("submit", (e) => e.preventDefault());
  }

  renderCount(count) {
    this._countEl.textContent = `${count} listing${count === 1 ? "" : "s"}`;
  }

  
}

export default new SearchView();
