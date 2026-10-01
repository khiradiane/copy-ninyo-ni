import View from "./View.js";

class DetailView extends View {
  _parentElement = document.querySelector(".detail");

  _errorMessage = "That listing could not be found.";

  _schoolDaysPerMonth = 22;

  _peso = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  });

  _occupants = 1;
  _includeTransport = false;

  _sumUtilities = ({ electricity = 0, water = 0, internet = 0 }) =>
    electricity + water + internet;

  _calculateCostPerHead = (listing) => {
    const people = this._occupants;
    const withTransport = this._includeTransport;

    if (!Number.isInteger(people) || people < 1) {
      throw new Error(
        "Number of occupants must be a whole number, at least 1.",
      );
    }

    if (people > listing.maxOccupants) {
      throw new Error(
        `This listing allows at most ${listing.maxOccupants} occupants`,
      );
    }

    const rentPerHead = listing.monthlyRent / people;

    const utilitiesPerHead = listing.utilitiesIncluded
      ? 0
      : this._sumUtilities(listing.estimatedUtilities) / people;

    const transportPerHead = withTransport
      ? listing.fareOneWay * 2 * this._schoolDaysPerMonth
      : 0;

    return {
      rentPerHead,
      utilitiesPerHead,
      transportPerHead,
      totalPerHead:
        rentPerHead + utilitiesPerHead + transportPerHead,
    };
  };

  _generateBreakdown = (listing) => {
    try {
      const {
        rentPerHead,
        utilitiesPerHead,
        transportPerHead,
        totalPerHead,
      } = this._calculateCostPerHead(listing);

      return `
        <p class="breakdown__line">
          <span>Rent</span>
          <span>${this._peso.format(rentPerHead)}</span>
        </p>

        <p class="breakdown__line">
          <span>Utilities</span>
          <span>${this._peso.format(utilitiesPerHead)}</span>
        </p>

        <p class="breakdown__line">
          <span>Transport</span>
          <span>${this._peso.format(transportPerHead)}</span>
        </p>

        <p class="breakdown__total">
          <span>Per person</span>
          <span>${this._peso.format(totalPerHead)}</span>
        </p>
      `;
    } catch (err) {
      return `<p class="error">${err.message}</p>`;
    }
  };

  _generateMarkup = () => {
    const { name, barangay, monthlyRent, maxOccupants } = this._data;

    return `
      <h2 class="detail__name">${name}</h2>

      <p class="detail__where">
        ${barangay} &middot;
        ${this._peso.format(monthlyRent)} / month
      </p>

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
            value="${this._occupants}"
          />
        </div>

        <div class="splitter__row">
          <label for="transport-demo">Include daily fare</label>

          <input
            type="checkbox"
            id="transport-demo"
            ${this._includeTransport ? "checked" : ""}
          />
        </div>
      </fieldset>

      <div class="breakdown">
        ${this._generateBreakdown(this._data)}
      </div>
    `;
  };

  render = (listing, occupants = 1, includeTransport = false) => {
    this._data = listing;
    this._occupants = occupants;
    this._includeTransport = includeTransport;

    const markup = this._generateMarkup();

    this._clear();
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  };

  updateBreakdown = (occupants, includeTransport) => {
    if (!this._data) return;

    this._occupants = occupants;
    this._includeTransport = includeTransport;

    const breakdown = this._parentElement.querySelector(".breakdown");

    if (!breakdown) return;

    breakdown.innerHTML = this._generateBreakdown(this._data);
  };

  addOccupantsHandler(handler) {
    this._parentElement.addEventListener("input", (e) => {
      if (e.target.id !== "occupants-demo") return;

      handler(Number(e.target.value));
    });
  }

  addTransportHandler(handler) {
    this._parentElement.addEventListener("change", (e) => {
      if (e.target.id !== "transport-demo") return;

      handler(e.target.checked);
    });
  }
}

export default new DetailView();