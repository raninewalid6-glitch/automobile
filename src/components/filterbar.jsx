import { SlidersHorizontal } from "lucide-react";
import React from "react";
import { useLang } from "../lib/i18n";

function Filterbar({
  setShowFilters,
  showFilters,
  selectedCategory,
  setSelectedCategory,
  categories,
  selectedBrand,
  setSelectedBrand,
  brands,
  setPriceRange,
  priceRange
}) {
  const { t } = useLang();

  return (
    <section className="py-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4 lg:mb-0">
            <h3 className="text-lg font-semibold flex items-center">
              <SlidersHorizontal className="w-5 h-5 mr-2" />
              {t("filter.title")}
            </h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden text-red-500"
            >
              {showFilters ? t("filter.hide") : t("filter.show")}
            </button>
          </div>

          <div
            className={`grid grid-cols-1 lg:grid-cols-4 gap-4 ${
              showFilters ? "block" : "hidden lg:grid"
            } lg:block`}
          >
            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                {t("filter.category")}
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
              >
                <option value="all">{t("filter.allCategories")}</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">{t("filter.brand")}</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
              >
                <option value="all">{t("filter.allBrands")}</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                {t("filter.priceRange")}
              </label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
              >
                <option value="all">{t("filter.allPrices")}</option>
                <option value="low">{t("filter.priceLow")}</option>
                <option value="mid">{t("filter.priceMid")}</option>
                <option value="high">{t("filter.priceHigh")}</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedBrand("all");
                  setPriceRange("all");
                }}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-6 py-3 font-semibold hover:bg-white/20 transition"
              >
                {t("filter.reset")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Filterbar;
