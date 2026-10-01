import { listings } from "./data.js";

export const state = {
  listings: listings,
  filtered: listings,
  searchTerm: "",
  maxRent: "",
};

export const applyFilters = () => {
  const query = state.searchTerm.toLowerCase().trim();
  const maxRent = state.maxRent;

  state.filtered = state.listings.filter((listing) => {
    const matchesQuery =
      query === "" ||
      listing.name.toLowerCase().includes(query) ||
      listing.barangay.toLowerCase().includes(query);

    const matchesRent =
      maxRent === "" || listing.monthlyRent <= Number(maxRent);

    return matchesQuery && matchesRent;
  });
};

export const setSearchTerm = (term) => {
  state.searchTerm = term;
  applyFilters();
};

export const setMaxRent = (value) => {
  state.maxRent = value;
  applyFilters();
};
