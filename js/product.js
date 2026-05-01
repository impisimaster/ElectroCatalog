(function () {
  const galleryState = {
    product: null,
    variantId: null,
    images: [],
    activeIndex: 0
  };

  function setMessage(element, message, type) {
    if (!element) {
      return;
    }

    element.textContent = message;
    element.className = `form-message ${type || ""}`.trim();
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function onlyDigits(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function formatCardNumber(value) {
    return onlyDigits(value)
      .slice(0, 16)
      .replace(/(\d{4})(?=\d)/g, "$1 ")
      .trim();
  }

  function formatCardExpiry(value) {
    const digits = onlyDigits(value).slice(0, 4);

    if (digits.length <= 2) {
      return digits;
    }

    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  function isValidExpiry(value) {
    const match = /^(\d{2})\/(\d{2})$/.exec(String(value || "").trim());

    if (!match) {
      return false;
    }

    const month = Number(match[1]);
    return month >= 1 && month <= 12;
  }

  function getProductIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const rawId = params.get("id");
    const productId = Number(rawId);

    if (!rawId || !Number.isInteger(productId) || productId <= 0) {
      return null;
    }

    return productId;
  }

  function formatDate(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat(I18n.getLanguage() === "uk" ? "uk-UA" : "en-US", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(date);
  }

  function showNotFoundState() {
    document.getElementById("productNotFound").classList.remove("hidden");
    document.getElementById("productDetailsPage").classList.add("hidden");
  }

  function renderReviews(productId) {
    const reviewsList = document.getElementById("reviewsList");
    const reviews = Store.getReviews()
      .filter((review) => review.productId === productId)
      .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime());

    if (!reviews.length) {
      reviewsList.innerHTML = `<p class="helper-text">${I18n.t("productPage.noReviews")}</p>`;
      return;
    }

    reviewsList.innerHTML = reviews
      .map((review) => {
        const safeUser = escapeHtml(review.userLogin);
        const safeComment = escapeHtml(review.comment);
        const rating = Math.max(1, Math.min(5, Number(review.rating) || 1));
        const stars = "★".repeat(rating) + "☆".repeat(5 - rating);

        return `
          <article class="review-card">
            <div class="review-card-header">
              <strong>${safeUser}</strong>
              <span class="review-date">${formatDate(review.date)}</span>
            </div>
            <div class="review-rating">${stars}</div>
            <p class="review-comment">${safeComment}</p>
          </article>
        `;
      })
      .join("");
  }

  function parseSpecifications(text) {
    return String(text || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  function renderSpecifications(product) {
    const specificationsList = document.getElementById("productSpecificationsList");
    const lines = parseSpecifications(product.specifications);

    if (!lines.length) {
      specificationsList.innerHTML = `<p class="helper-text">${I18n.t("productPage.noSpecifications")}</p>`;
      return;
    }

    specificationsList.innerHTML = lines
      .map((line) => {
        const separatorIndex = line.indexOf(":");

        if (separatorIndex > 0) {
          const label = escapeHtml(line.slice(0, separatorIndex).trim());
          const value = escapeHtml(line.slice(separatorIndex + 1).trim());
          return `
            <div class="spec-row">
              <strong>${label}</strong>
              <span>${value}</span>
            </div>
          `;
        }

        return `
          <div class="spec-row">
            <span>${escapeHtml(line)}</span>
          </div>
        `;
      })
      .join("");
  }

  function getSelectedVariant(product) {
    return Store.getVariantById(product, galleryState.variantId);
  }

  function updateMainImage() {
    const mainImage = document.getElementById("productDetailImage");
    const selectedVariant = getSelectedVariant(galleryState.product);
    const images = galleryState.images.length
      ? galleryState.images
      : [Store.getPrimaryProductImage(galleryState.product, galleryState.variantId)];

    galleryState.activeIndex = Math.min(galleryState.activeIndex, images.length - 1);
    if (galleryState.activeIndex < 0) {
      galleryState.activeIndex = 0;
    }

    const activeImage = images[galleryState.activeIndex];
    const primaryImage = Store.getPrimaryProductImage(galleryState.product, galleryState.variantId);
    const imageFocusSource =
      activeImage === primaryImage
        ? selectedVariant || galleryState.product
        : null;
    const imagePositionX = Number.isFinite(imageFocusSource?.imagePositionX) ? imageFocusSource.imagePositionX : 50;
    const imagePositionY = Number.isFinite(imageFocusSource?.imagePositionY) ? imageFocusSource.imagePositionY : 50;

    mainImage.src = activeImage;
    mainImage.alt = I18n.translateProductName(galleryState.product);
    mainImage.style.objectPosition = `${imagePositionX}% ${imagePositionY}%`;
  }

  function renderGalleryThumbs() {
    const gallerySection = document.getElementById("productGallerySection");
    const thumbs = document.getElementById("productGalleryThumbs");
    const prevButton = document.getElementById("galleryPrevButton");
    const nextButton = document.getElementById("galleryNextButton");

    if (galleryState.images.length <= 1) {
      thumbs.innerHTML = "";
      gallerySection.classList.add("hidden");
      return;
    }

    gallerySection.classList.remove("hidden");
    thumbs.innerHTML = galleryState.images
      .map((image, index) => {
        return `
          <button class="gallery-thumb ${index === galleryState.activeIndex ? "active" : ""}" type="button" data-gallery-index="${index}">
            <img src="${image}" alt="${escapeHtml(`${I18n.translateProductName(galleryState.product)} ${index + 1}`)}">
          </button>
        `;
      })
      .join("");

    prevButton.disabled = galleryState.images.length <= 1;
    nextButton.disabled = galleryState.images.length <= 1;
  }

  function renderProductColors(product) {
    const colorsSection = document.getElementById("productColorsSection");
    const colorOptions = document.getElementById("productColorOptions");
    const detailColorRow = document.getElementById("productDetailColorRow");
    const detailColor = document.getElementById("productDetailColor");
    const variants = Store.getColorVariants(product);
    const hasRealColorVariants = Array.isArray(product.colorVariants) && product.colorVariants.length > 0;

    if (!hasRealColorVariants) {
      colorsSection.classList.add("hidden");
      detailColorRow.classList.add("hidden");
      return;
    }

    if (!galleryState.variantId) {
      const defaultVariant = variants.find((variant) => variant.isDefault) || variants[0];
      galleryState.variantId = defaultVariant?.id || null;
    }

    const selectedVariant = Store.getVariantById(product, galleryState.variantId) || variants.find((variant) => String(variant.id) === String(galleryState.variantId)) || variants[0];
    detailColor.textContent = selectedVariant?.name || I18n.t("productPage.defaultColor");

    colorOptions.innerHTML = variants
      .map((variant) => {
        const isActive = String(variant.id) === String(galleryState.variantId);
        return `
          <button class="color-option ${isActive ? "active" : ""}" type="button" data-variant-id="${variant.id}">
            <span class="color-option-swatch" style="background:${escapeHtml(variant.colorHex || "#dbeafe")};"></span>
            <span>${escapeHtml(variant.name || I18n.t("productPage.defaultColor"))}</span>
          </button>
        `;
      })
      .join("");

    colorsSection.classList.remove("hidden");
    detailColorRow.classList.remove("hidden");
  }

  function renderProductDetails(product) {
    const name = document.getElementById("productDetailName");
    const description = document.getElementById("productDetailDescription");
    const manufacturer = document.getElementById("productDetailManufacturer");
    const category = document.getElementById("productDetailCategory");
    const fullDescription = document.getElementById("productDetailFullDescription");
    const price = document.getElementById("productDetailPrice");
    const id = document.getElementById("productDetailId");
    const meta = document.getElementById("productDetailMeta");
    const selectedVariant = getSelectedVariant(product);

    galleryState.product = product;
    galleryState.images = Store.getProductImages(product, galleryState.variantId);
    galleryState.activeIndex = 0;

    name.textContent = I18n.translateProductName(product);
    description.textContent = I18n.translateProductDescription(product);
    manufacturer.textContent = product.manufacturer;
    category.textContent = I18n.getCategoryPath(product.categoryId);
    fullDescription.textContent = I18n.translateProductDescription(product);
    price.textContent = I18n.formatPrice(product.price);
    id.textContent = String(product.id);
    meta.innerHTML = `
      <span class="tag">${escapeHtml(product.manufacturer)}</span>
      <span class="tag">${escapeHtml(I18n.getCategoryPath(product.categoryId))}</span>
      ${selectedVariant ? `<span class="tag">${escapeHtml(selectedVariant.name || I18n.t("productPage.defaultColor"))}</span>` : ""}
    `;

    renderSpecifications(product);
    renderProductColors(product);
    updateMainImage();
    renderGalleryThumbs();
  }

  function setupGalleryEvents() {
    const thumbs = document.getElementById("productGalleryThumbs");
    const prevButton = document.getElementById("galleryPrevButton");
    const nextButton = document.getElementById("galleryNextButton");

    thumbs.addEventListener("click", (event) => {
      const button = event.target.closest("[data-gallery-index]");
      if (!button) {
        return;
      }

      galleryState.activeIndex = Number(button.getAttribute("data-gallery-index"));
      updateMainImage();
      renderGalleryThumbs();
    });

    prevButton.addEventListener("click", () => {
      if (!galleryState.images.length) {
        return;
      }

      galleryState.activeIndex = (galleryState.activeIndex - 1 + galleryState.images.length) % galleryState.images.length;
      updateMainImage();
      renderGalleryThumbs();
    });

    nextButton.addEventListener("click", () => {
      if (!galleryState.images.length) {
        return;
      }

      galleryState.activeIndex = (galleryState.activeIndex + 1) % galleryState.images.length;
      updateMainImage();
      renderGalleryThumbs();
    });
  }

  function setupColorEvents(product) {
    document.getElementById("productColorOptions").addEventListener("click", (event) => {
      const button = event.target.closest("[data-variant-id]");
      if (!button) {
        return;
      }

      galleryState.variantId = button.getAttribute("data-variant-id");
      renderProductDetails(product);
    });
  }

  function setupReviewForm(product) {
    const reviewForm = document.getElementById("reviewForm");
    const guestReviewMessage = document.getElementById("guestReviewMessage");
    const reviewMessage = document.getElementById("reviewMessage");
    const currentUser = Store.getCurrentUser();

    if (!currentUser) {
      guestReviewMessage.classList.remove("hidden");
      reviewForm.classList.add("hidden");
      return;
    }

    guestReviewMessage.classList.add("hidden");
    reviewForm.classList.remove("hidden");

    reviewForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const rating = Number(document.getElementById("reviewRating").value);
      const comment = document.getElementById("reviewComment").value.trim();
      const reviews = Store.getReviews();

      reviews.push({
        id: Store.generateId(reviews),
        productId: product.id,
        userLogin: currentUser.login,
        rating,
        comment,
        date: new Date().toISOString()
      });

      Store.saveReviews(reviews);
      reviewForm.reset();
      document.getElementById("reviewRating").value = "5";
      setMessage(reviewMessage, I18n.t("productPage.reviewSuccess"), "success");
      renderReviews(product.id);
    });
  }

  function setupPurchase(product) {
    const buyButton = document.getElementById("buyButton");
    const buyMessage = document.getElementById("buyMessage");
    const orderModal = document.getElementById("orderModal");
    const closeOrderModalButton = document.getElementById("closeOrderModalButton");
    const cancelOrderButton = document.getElementById("cancelOrderButton");
    const orderForm = document.getElementById("orderForm");
    const orderFormMessage = document.getElementById("orderFormMessage");
    const orderSummaryProduct = document.getElementById("orderSummaryProduct");
    const orderSummaryColor = document.getElementById("orderSummaryColor");
    const orderSummaryColorRow = document.getElementById("orderSummaryColorRow");
    const orderSummaryPrice = document.getElementById("orderSummaryPrice");
    const customerNameInput = document.getElementById("orderCustomerName");
    const phoneInput = document.getElementById("orderPhone");
    const emailInput = document.getElementById("orderEmail");
    const cityInput = document.getElementById("orderCity");
    const postalCodeInput = document.getElementById("orderPostalCode");
    const addressInput = document.getElementById("orderAddress");
    const notesInput = document.getElementById("orderNotes");
    const cardHolderInput = document.getElementById("orderCardHolder");
    const cardNumberInput = document.getElementById("orderCardNumber");
    const cardExpiryInput = document.getElementById("orderCardExpiry");
    const cardCvvInput = document.getElementById("orderCardCvv");

    function closeModal() {
      orderModal.classList.add("hidden");
      document.body.style.removeProperty("overflow");
      orderForm.reset();
      setMessage(orderFormMessage, "", "");
    }

    function openModal() {
      const selectedVariant = getSelectedVariant(product);

      orderSummaryProduct.textContent = I18n.translateProductName(product);
      orderSummaryPrice.textContent = I18n.formatPrice(product.price);

      if (selectedVariant && selectedVariant.name) {
        orderSummaryColor.textContent = selectedVariant.name;
        orderSummaryColorRow.classList.remove("hidden");
      } else {
        orderSummaryColor.textContent = "";
        orderSummaryColorRow.classList.add("hidden");
      }

      setMessage(buyMessage, "", "");
      setMessage(orderFormMessage, "", "");
      orderModal.classList.remove("hidden");
      document.body.style.overflow = "hidden";
      customerNameInput.focus();
    }

    function getCheckoutPayload(currentUser) {
      const selectedVariant = getSelectedVariant(product);
      const cardDigits = onlyDigits(cardNumberInput.value);
      const cvvDigits = onlyDigits(cardCvvInput.value);
      const expiry = formatCardExpiry(cardExpiryInput.value);

      if (
        !customerNameInput.value.trim() ||
        !phoneInput.value.trim() ||
        !emailInput.value.trim() ||
        !cityInput.value.trim() ||
        !postalCodeInput.value.trim() ||
        !addressInput.value.trim() ||
        !cardHolderInput.value.trim()
      ) {
        return {
          error: I18n.t("productPage.checkoutRequired")
        };
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
        return {
          error: I18n.t("productPage.checkoutEmailError")
        };
      }

      if (cardDigits.length < 16) {
        return {
          error: I18n.t("productPage.checkoutCardError")
        };
      }

      if (!isValidExpiry(expiry)) {
        return {
          error: I18n.t("productPage.checkoutExpiryError")
        };
      }

      if (cvvDigits.length < 3) {
        return {
          error: I18n.t("productPage.checkoutCvvError")
        };
      }

      return {
        order: {
          id: Store.generateId(Store.getOrders()),
          productId: product.id,
          userLogin: currentUser.login,
          productName: product.name,
          price: product.price,
          colorName: selectedVariant?.name || "",
          colorId: selectedVariant?.id || "",
          customerName: customerNameInput.value.trim(),
          phone: phoneInput.value.trim(),
          email: emailInput.value.trim(),
          city: cityInput.value.trim(),
          postalCode: postalCodeInput.value.trim(),
          address: addressInput.value.trim(),
          deliveryNotes: notesInput.value.trim(),
          cardHolder: cardHolderInput.value.trim(),
          cardLast4: cardDigits.slice(-4),
          date: new Date().toISOString()
        }
      };
    }

    buyButton.addEventListener("click", () => {
      const currentUser = Store.getCurrentUser();

      if (!currentUser) {
        setMessage(buyMessage, I18n.t("productPage.loginToBuy"), "error");
        return;
      }

      openModal();
    });

    orderForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const currentUser = Store.getCurrentUser();
      if (!currentUser) {
        closeModal();
        setMessage(buyMessage, I18n.t("productPage.loginToBuy"), "error");
        return;
      }

      const result = getCheckoutPayload(currentUser);
      if (result.error) {
        setMessage(orderFormMessage, result.error, "error");
        return;
      }

      const orders = Store.getOrders();
      orders.push(result.order);
      Store.saveOrders(orders);
      closeModal();
      setMessage(buyMessage, I18n.t("productPage.orderCreated"), "success");
    });

    cardNumberInput.addEventListener("input", () => {
      cardNumberInput.value = formatCardNumber(cardNumberInput.value);
    });

    cardExpiryInput.addEventListener("input", () => {
      cardExpiryInput.value = formatCardExpiry(cardExpiryInput.value);
    });

    cardCvvInput.addEventListener("input", () => {
      cardCvvInput.value = onlyDigits(cardCvvInput.value).slice(0, 4);
    });

    closeOrderModalButton.addEventListener("click", closeModal);
    cancelOrderButton.addEventListener("click", closeModal);
    orderModal.addEventListener("click", (event) => {
      if (event.target === orderModal) {
        closeModal();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !orderModal.classList.contains("hidden")) {
        closeModal();
      }
    });
  }

  function initProductPage() {
    const productId = getProductIdFromUrl();
    const product = productId ? Store.getProductById(productId) : null;

    if (!product) {
      showNotFoundState();
      return;
    }
    const variants = Store.getColorVariants(product);
    const defaultVariant = variants.find((variant) => variant.isDefault) || variants[0];

    galleryState.variantId = defaultVariant?.id || null;
    document.getElementById("productNotFound").classList.add("hidden");
    document.getElementById("productDetailsPage").classList.remove("hidden");

    renderProductDetails(product);
    setupGalleryEvents();
    setupColorEvents(product);
    renderReviews(product.id);
    setupReviewForm(product);
    setupPurchase(product);
  }

  document.addEventListener("DOMContentLoaded", () => {
    Store.initData();
    initProductPage();
  });
})();
