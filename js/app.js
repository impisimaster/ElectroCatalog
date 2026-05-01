(function () {
  function getCategoryChain(categoryId, categories) {
    const chain = [];
    let current = categories.find((category) => category.id === Number(categoryId)) || null;

    while (current) {
      chain.unshift(current);
      current = categories.find((category) => category.id === current.parentId) || null;
    }

    return chain;
  }

  function buildOptions(select, placeholder, items) {
    select.innerHTML = `<option value="">${placeholder}</option>`;

    items.forEach((item) => {
      const option = document.createElement("option");
      option.value = String(item.value ?? item.id);
      option.textContent = item.label ?? item.name;
      select.appendChild(option);
    });
  }

  function openProductDetails(productId) {
    window.location.href = `product.html?id=${productId}`;
  }

  function setupProductImageHover(card) {
    const media = card.querySelector(".product-media");
    const image = card.querySelector(".product-image");
    if (!media) {
      return;
    }

    let shouldExpandImage = false;
    const allowImageExpand = card.dataset.allowImageExpand !== "false";

    function getBaseMediaHeight() {
      const mediaWidth = media.clientWidth || card.clientWidth;
      return mediaWidth ? mediaWidth * (10 / 16) : media.getBoundingClientRect().height;
    }

    function updateImageExpansionState() {
      if (!image || !image.naturalWidth || !image.naturalHeight) {
        shouldExpandImage = false;
        card.classList.remove("is-image-expanded");
        return;
      }

      const mediaWidth = media.clientWidth;
      const mediaHeight = media.clientHeight;

      if (!mediaWidth || !mediaHeight) {
        shouldExpandImage = false;
        card.classList.remove("is-image-expanded");
        return;
      }

      const imageRatio = image.naturalWidth / image.naturalHeight;
      const mediaRatio = mediaWidth / mediaHeight;
      const coverWidth = mediaHeight * imageRatio;
      const coverHeight = mediaWidth / imageRatio;
      const isCroppedHorizontally = coverWidth - mediaWidth > 2;
      const isCroppedVertically = coverHeight - mediaHeight > 2;

      shouldExpandImage =
        allowImageExpand &&
        imageRatio > 0 &&
        mediaRatio > 0 &&
        (isCroppedHorizontally || isCroppedVertically);

      if (!shouldExpandImage) {
        card.classList.remove("is-image-expanded");
      }
    }

    if (image && !image.complete) {
      image.addEventListener("load", updateImageExpansionState, { once: true });
    }

    window.addEventListener("resize", updateImageExpansionState);
    requestAnimationFrame(updateImageExpansionState);

    card.addEventListener("mousemove", (event) => {
      if (!shouldExpandImage) {
        updateImageExpansionState();
      }

      if (!shouldExpandImage) {
        card.classList.remove("is-image-expanded");
        return;
      }

      const cardRect = card.getBoundingClientRect();
      const pointerY = event.clientY - cardRect.top;

      if (pointerY <= getBaseMediaHeight()) {
        card.classList.add("is-image-expanded");
        return;
      }

      card.classList.remove("is-image-expanded");
    });

    card.addEventListener("mouseleave", () => {
      card.classList.remove("is-image-expanded");
    });
  }

  function renderCatalog() {
    const productGrid = document.getElementById("productGrid");
    if (!productGrid) {
      return;
    }

    const searchInput = document.getElementById("searchInput");
    const categoryFilter = document.getElementById("categoryFilter");
    const subcategoryFilter = document.getElementById("subcategoryFilter");
    const manufacturerFilter = document.getElementById("manufacturerFilter");
    const minPriceFilter = document.getElementById("minPriceFilter");
    const maxPriceFilter = document.getElementById("maxPriceFilter");
    const resultsCount = document.getElementById("resultsCount");
    const emptyState = document.getElementById("emptyState");
    const resetButton = document.getElementById("resetFiltersButton");

    let categories = Store.getCategories();
    let products = Store.getProducts();

    const parentCategories = categories.filter((category) => category.parentId === null);
    const manufacturers = Array.from(new Set(products.map((product) => product.manufacturer))).sort();

    buildOptions(
      categoryFilter,
      I18n.t("common.allCategories"),
      parentCategories.map((category) => ({ id: category.id, label: I18n.translateCategoryName(category) }))
    );
    buildOptions(subcategoryFilter, I18n.t("common.allSubcategories"), []);
    buildOptions(
      manufacturerFilter,
      I18n.t("common.allManufacturers"),
      manufacturers.map((manufacturer) => ({ value: manufacturer, name: manufacturer }))
    );

    function updateStats() {
      const categoryCount = categories.length;
      const manufacturerCount = Array.from(new Set(products.map((product) => product.manufacturer))).length;

      document.getElementById("productCountStat").textContent = String(products.length);
      document.getElementById("categoryCountStat").textContent = String(categoryCount);
      document.getElementById("manufacturerCountStat").textContent = String(manufacturerCount);
    }

    function updateSubcategoryOptions() {
      const selectedParentId = Number(categoryFilter.value);
      const subcategories = categories.filter((category) => category.parentId === selectedParentId);
      const currentSubcategory = subcategoryFilter.value;

      buildOptions(
        subcategoryFilter,
        I18n.t("common.allSubcategories"),
        subcategories.map((category) => ({ id: category.id, label: I18n.translateCategoryName(category) }))
      );

      if (subcategories.some((category) => String(category.id) === currentSubcategory)) {
        subcategoryFilter.value = currentSubcategory;
      }
    }

    function getFilteredProducts() {
      const searchValue = searchInput.value.trim().toLowerCase();
      const selectedCategoryId = Number(categoryFilter.value) || null;
      const selectedSubcategoryId = Number(subcategoryFilter.value) || null;
      const selectedManufacturer = manufacturerFilter.value;
      const minPrice = minPriceFilter.value ? I18n.fromDisplayPriceValue(Number(minPriceFilter.value)) : 0;
      const maxPrice = maxPriceFilter.value ? I18n.fromDisplayPriceValue(Number(maxPriceFilter.value)) : Infinity;

      return products.filter((product) => {
        const localizedName = I18n.translateProductName(product).toLowerCase();
        const nameMatches = localizedName.includes(searchValue) || product.name.toLowerCase().includes(searchValue);
        const categoryChain = getCategoryChain(product.categoryId, categories);
        const topCategoryId = categoryChain[0]?.id || null;
        const productManufacturerMatches =
          !manufacturerFilter.value || product.manufacturer === selectedManufacturer;
        const categoryMatches = !selectedCategoryId || topCategoryId === selectedCategoryId;
        const subcategoryMatches = !selectedSubcategoryId || product.categoryId === selectedSubcategoryId;
        const priceMatches = product.price >= minPrice && product.price <= maxPrice;

        return nameMatches && categoryMatches && subcategoryMatches && productManufacturerMatches && priceMatches;
      });
    }

    function renderProducts() {
      const filteredProducts = getFilteredProducts();

      resultsCount.textContent = I18n.formatResultsCount(filteredProducts.length);
      productGrid.innerHTML = "";

      if (!filteredProducts.length) {
        emptyState.classList.remove("hidden");
        return;
      }

      emptyState.classList.add("hidden");

      filteredProducts.forEach((product) => {
        const article = document.createElement("article");
        article.className = "product-card";
        article.dataset.allowImageExpand = String(product.allowImageExpand !== false);
        article.tabIndex = 0;
        article.setAttribute("role", "link");
        article.setAttribute("aria-label", `${I18n.translateProductName(product)} - ${I18n.t("common.details")}`);
        article.innerHTML = `
          <div class="product-media">
            <img class="product-image" src="${Store.getPrimaryProductImage(product)}" alt="${I18n.translateProductName(product)}" style="object-position: ${Number.isFinite(product.imagePositionX) ? product.imagePositionX : 50}% ${Number.isFinite(product.imagePositionY) ? product.imagePositionY : 50}%;">
          </div>
          <div class="product-body">
            <div class="product-meta">
              <span class="tag">${product.manufacturer}</span>
              <span class="tag">${I18n.getCategoryPath(product.categoryId)}</span>
            </div>
            <h3>${I18n.translateProductName(product)}</h3>
            <p class="product-description">${I18n.translateProductDescription(product)}</p>
            <div class="product-footer">
              <div class="product-card-actions">
                <span class="price">${I18n.formatPrice(product.price)}</span>
                <a class="button secondary product-details-button" href="product.html?id=${product.id}">${I18n.t("common.details")}</a>
              </div>
              <span class="eyebrow">${I18n.t("common.productIdLabel", { id: product.id })}</span>
            </div>
          </div>
        `;
        article.addEventListener("click", (event) => {
          if (event.target.closest("a, button")) {
            return;
          }

          openProductDetails(product.id);
        });
        article.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openProductDetails(product.id);
          }
        });
        productGrid.appendChild(article);
        setupProductImageHover(article);
      });
    }

    function resetFilters() {
      searchInput.value = "";
      categoryFilter.value = "";
      subcategoryFilter.innerHTML = `<option value="">${I18n.t("common.allSubcategories")}</option>`;
      manufacturerFilter.value = "";
      minPriceFilter.value = "";
      maxPriceFilter.value = "";
      renderProducts();
    }

    [searchInput, subcategoryFilter, manufacturerFilter, minPriceFilter, maxPriceFilter].forEach((element) => {
      element.addEventListener("input", renderProducts);
      element.addEventListener("change", renderProducts);
    });

    categoryFilter.addEventListener("change", () => {
      updateSubcategoryOptions();
      renderProducts();
    });

    resetButton.addEventListener("click", resetFilters);

    updateStats();
    renderProducts();
  }

  document.addEventListener("DOMContentLoaded", () => {
    Store.initData();
    renderCatalog();
  });
})();
