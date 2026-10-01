import * as model from "./model.js";
import searchView from "./views/SearchView.js";
import resultsView from "./views/ResultsView.js";
// ELEMENTS
const resultsList = document.querySelector(".results__list");
const detailsContainer = document.querySelector(".detail");

// STATE
let selectedId = null;
let occupants = 1;
let includeTransport = false;

const SCHOOL_DAYS_PER_MONTH = 22;

const peso = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
});

const sumUtilities = ({ electricity = 0, water = 0, internet = 0 }) =>
  electricity + water + internet;

const calculateCostPerHead = (listing, people, withTransport) => {
  if (!Number.isInteger(people) || people < 1)
    throw new Error("Number of occupants must be a whole number, at least 1.");
  if (people > listing.maxOccupants)
    throw new Error(
      `This listing allows at most ${listing.maxOccupants} occupants`,
    );

  const rentPerHead = listing.monthlyRent / people;

  const utilitiesPerHead = listing.utilitiesIncluded
    ? 0
    : sumUtilities(listing.estimatedUtilities) / people;

  const transportPerHead = withTransport
    ? listing.fareOneWay * 2 * SCHOOL_DAYS_PER_MONTH
    : 0;

  return {
    rentPerHead,
    utilitiesPerHead,
    transportPerHead,
    totalPerHead: rentPerHead + utilitiesPerHead + transportPerHead,
  };
};

const results = () => {
  searchView.renderCount(model.state.filtered.length);
  resultsView.render(model.state.filtered);
};

const breakdownContent = (listing) => {
  try {
    const { rentPerHead, utilitiesPerHead, transportPerHead, totalPerHead } =
      calculateCostPerHead(listing, occupants, includeTransport);

    return `
    <p class="breakdown__line">
      <span>Rent</span><span>${peso.format(rentPerHead)}</span>
    </p>
    <p class="breakdown__line">
      <span>Utilities</span><span>${peso.format(utilitiesPerHead)}</span>
    </p>
    <p class="breakdown__line">
      <span>Transport</span><span>${peso.format(transportPerHead)}</span>
    </p>
    <p class="breakdown__total">
      <span>Per person</span><span>${peso.format(totalPerHead)}</span>
    </p>
    `;
  } catch (err) {
    return `<p class="error">${err.message}</p>`;
  }
};

const detailMarkUpGenerator = (listing) => {
  const { name, barangay, monthlyRent, maxOccupants } = listing;

  return `
   <h2 class="detail__name">${name}</h2>
          <p class="detail__where">${barangay} &middot; ${peso.format(monthlyRent)} / month</p>
  <fieldset class="splitter">
            <legend class="splitter__legend">Split the cost</legend>

            <div class="splitter__row">
              <label for="occupants-demo">Sharing with</label>
              <input
                class="field__input"
                type="number"
                id="occupants-demo"
                min="1"
                max="${maxOccupants}"
                value="${occupants}"
              />
            </div>

            <div class="splitter__row">
              <label for="transport-demo">Include daily fare</label>
              <input type="checkbox" id="transport-demo" ${includeTransport ? "checked" : ""} />
            </div>
          </fieldset>

          <div class="breakdown">
            ${breakdownContent(listing)}
          </div>        
  `;
};

const selectedListing = () =>
  model.state.listings.find((listing) => listing.id === selectedId);

const renderDetail = () => {
  if (!selectedId) {
    detailsContainer.innerHTML = `<p class="detail__empty">Select a listing to see the cost breakdown.</p>`;
    return;
  }

  const listing = selectedListing();

  if (!listing) {
    detailsContainer.innerHTML = `<p class="error">That listing could not be found.</p>`;
    return;
  }

  detailsContainer.innerHTML = detailMarkUpGenerator(listing);
};

const updateBreakdown = () => {
  const breakdown = detailsContainer.querySelector(".breakdown");
  if (!breakdown) return;

  const listing = selectedListing();
  if (!listing) return;

  breakdown.innerHTML = breakdownContent(listing);
};

// EVENT LISTENERS

resultsList.addEventListener("click", (event) => {
  const card = event.target.closest(".card");

  if (!card) return;

  selectedId = card.dataset.id;

  const listing = selectedListing();
  if (!listing) return;

  occupants = listing.maxOccupants;

  results();
  renderDetail();
});

detailsContainer.addEventListener("input", (e) => {
  if (e.target.id === "occupants-demo") {
    occupants = Number(e.target.value);
    updateBreakdown();
  }

  if (e.target.id === "transport-demo") {
    includeTransport = e.target.checked;
    updateBreakdown();
  }
});

const searchController = (term) => {
  model.setSearchTerm(term);
  results();
};

const maxRentController = (value) => {
  model.setMaxRent(value);
  results();
};

searchView.addSearchHandler(searchController);
searchView.addMaxRentHandler(maxRentController);
searchView.addFormHandler();

results();
