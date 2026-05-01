(function () {
  let variantCounter = 0;

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

  function clampPositionValue(value) {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
      return 50;
    }

    return Math.max(0, Math.min(100, Math.round(numericValue)));
  }

  function scrollToPageTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  function getResolvedPrimaryImageIndex(images, primaryImageIndex, primaryImage) {
    const safeImages = Array.isArray(images)
      ? images.filter((image) => typeof image === "string" && image.trim())
      : [];

    if (!safeImages.length) {
      return 0;
    }

    if (
      Number.isInteger(primaryImageIndex) &&
      primaryImageIndex >= 0 &&
      primaryImageIndex < safeImages.length
    ) {
      return primaryImageIndex;
    }

    const safePrimaryImage = typeof primaryImage === "string" ? primaryImage.trim() : "";
    if (!safePrimaryImage) {
      return 0;
    }

    const foundIndex = safeImages.findIndex((image) => image === safePrimaryImage);
    return foundIndex >= 0 ? foundIndex : 0;
  }

  function createVariantState(variant = {}) {
    variantCounter += 1;
    const currentImages = Array.isArray(variant.images) ? variant.images.slice() : [];
    const primaryImageIndex = getResolvedPrimaryImageIndex(
      currentImages,
      variant.primaryImageIndex,
      variant.image
    );

    return {
      uid: `variant-${Date.now()}-${variantCounter}`,
      id: variant.id || null,
      name: variant.name || "",
      colorHex: variant.colorHex || "#dbeafe",
      currentImages,
      selectedImages: [],
      primaryImageIndex,
      imagePositionX: clampPositionValue(variant.imagePositionX),
      imagePositionY: clampPositionValue(variant.imagePositionY),
      savedMessage: "",
      isDefault: false
    };
  }

  function setupAdminPage() {
    const adminApp = document.getElementById("adminApp");
    if (!adminApp) {
      return;
    }

    const currentUser = Store.getCurrentUser();
    const accessDenied = document.getElementById("adminAccessDenied");

    if (!currentUser || currentUser.role !== "admin") {
      accessDenied.classList.remove("hidden");
      adminApp.classList.add("hidden");
      return;
    }

    accessDenied.classList.add("hidden");
    adminApp.classList.remove("hidden");

    const productForm = document.getElementById("productForm");
    const categoryForm = document.getElementById("categoryForm");
    const productCategorySelect = document.getElementById("productCategory");
    const categoryParentSelect = document.getElementById("categoryParent");
    const productsTable = document.getElementById("productsTable");
    const categoriesTable = document.getElementById("categoriesTable");
    const productImageFileInput = document.getElementById("productImageFile");
    const productImageStatus = document.getElementById("productImageStatus");
    const productImagePreviewWrap = document.getElementById("productImagePreviewWrap");
    const productImagePreview = document.getElementById("productImagePreview");
    const productAllowExpandInput = document.getElementById("productAllowExpand");
    const productImagePositionXInput = document.getElementById("productImagePositionX");
    const productImagePositionYInput = document.getElementById("productImagePositionY");
    const productImagePositionXValue = document.getElementById("productImagePositionXValue");
    const productImagePositionYValue = document.getElementById("productImagePositionYValue");
    const productGalleryFilesInput = document.getElementById("productGalleryFiles");
    const productGalleryStatus = document.getElementById("productGalleryStatus");
    const productGalleryPreview = document.getElementById("productGalleryPreview");
    const colorVariantsList = document.getElementById("colorVariantsList");
    const addColorVariantButton = document.getElementById("addColorVariant");

    let currentProductImage = "";
    let selectedImageData = "";
    let currentImagePositionX = 50;
    let currentImagePositionY = 50;
    let currentAllowImageExpand = true;
    let currentGalleryImages = [];
    let selectedGalleryImages = [];
    let colorVariantsState = [];
    let colorVariantsDraft = [];

    function getCategories() {
      return Store.getCategories();
    }

    function getProducts() {
      return Store.getProducts();
    }

    function setImageStatus(message, type) {
      productImageStatus.textContent = message;
      productImageStatus.className = `helper-text ${type || ""}`.trim();
    }

    function setGalleryStatus(message, type) {
      productGalleryStatus.textContent = message;
      productGalleryStatus.className = `helper-text ${type || ""}`.trim();
    }

    function syncImageControlValues() {
      productImagePositionXInput.value = String(currentImagePositionX);
      productImagePositionYInput.value = String(currentImagePositionY);
      productImagePositionXValue.textContent = `${currentImagePositionX}%`;
      productImagePositionYValue.textContent = `${currentImagePositionY}%`;
      productAllowExpandInput.checked = currentAllowImageExpand;
    }

    function renderImagePreview(imageSrc, message, type) {
      syncImageControlValues();

      if (imageSrc) {
        productImagePreview.src = imageSrc;
        productImagePreview.style.objectPosition = `${currentImagePositionX}% ${currentImagePositionY}%`;
        productImagePreviewWrap.classList.remove("hidden");
      } else {
        productImagePreview.removeAttribute("src");
        productImagePreviewWrap.classList.add("hidden");
      }

      setImageStatus(message, type);
    }

    function renderGalleryPreview(container, images) {
      const safeImages = images.filter((image) => typeof image === "string" && image.trim());

      if (!safeImages.length) {
        container.innerHTML = "";
        container.classList.add("hidden");
        return;
      }

      container.innerHTML = safeImages
        .map((image, index) => {
          return `
            <div class="gallery-preview-card">
              <div class="gallery-preview-item" title="Gallery ${index + 1}">
                <img src="${image}" alt="Gallery preview ${index + 1}">
              </div>
              <button class="gallery-preview-delete" type="button" data-action="delete-product-gallery-image" data-image-index="${index}" aria-label="${I18n.t("common.delete")}">
                ×
              </button>
            </div>
          `;
        })
        .join("");
      container.classList.remove("hidden");
    }

    function resetProductImageState() {
      currentProductImage = "";
      selectedImageData = "";
      currentImagePositionX = 50;
      currentImagePositionY = 50;
      currentAllowImageExpand = true;
      currentGalleryImages = [];
      selectedGalleryImages = [];
      colorVariantsState = [];
      colorVariantsDraft = [];
      productGalleryFilesInput.value = "";
      renderImagePreview("", I18n.t("admin.imageHint"));
      renderGalleryPreview(productGalleryPreview, []);
      setGalleryStatus(I18n.t("admin.galleryHint"));
      renderColorVariants();
    }

    function resetProductForm() {
      productForm.reset();
      document.getElementById("productId").value = "";
      document.getElementById("productFormTitle").textContent = I18n.t("admin.addProduct");
      setMessage(document.getElementById("productFormMessage"), "", "");
    }

    function resetCategoryForm() {
      categoryForm.reset();
      document.getElementById("categoryId").value = "";
      document.getElementById("categoryFormTitle").textContent = I18n.t("admin.addCategory");
      setMessage(document.getElementById("categoryFormMessage"), "", "");
    }

    function readImageFile(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("image-read-error"));
        reader.readAsDataURL(file);
      });
    }

    function isValidImageFile(file) {
      return Boolean(file && typeof file.type === "string" && file.type.startsWith("image/"));
    }

    async function readImageFiles(files) {
      const images = [];

      for (const file of files) {
        images.push(await readImageFile(file));
      }

      return images;
    }

    function populateProductCategories(selectedValue) {
      const categories = getCategories();
      productCategorySelect.innerHTML = `<option value="">${I18n.t("common.selectCategory")}</option>`;

      categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = String(category.id);
        option.textContent = I18n.getCategoryPath(category.id);
        productCategorySelect.appendChild(option);
      });

      if (selectedValue) {
        productCategorySelect.value = String(selectedValue);
      }
    }

    function populateCategoryParents(editingCategoryId, selectedValue) {
      const categories = getCategories();
      categoryParentSelect.innerHTML = `<option value="">${I18n.t("common.noParentCategory")}</option>`;

      categories
        .filter((category) => category.id !== Number(editingCategoryId))
        .forEach((category) => {
          const option = document.createElement("option");
          option.value = String(category.id);
          option.textContent = I18n.getCategoryPath(category.id);
          categoryParentSelect.appendChild(option);
        });

      if (selectedValue) {
        categoryParentSelect.value = String(selectedValue);
      }
    }

    function syncColorVariantsFromDom() {
      colorVariantsList.querySelectorAll(".variant-card[data-variant-id]").forEach((card) => {
        syncSingleVariantFromCard(card);
      });
    }

    function getVariantPreviewImages(variant) {
      return variant.selectedImages.length ? variant.selectedImages : variant.currentImages;
    }

    function getVariantPrimaryImage(variant) {
      const previewImages = getVariantPreviewImages(variant);
      const primaryImageIndex = getResolvedPrimaryImageIndex(
        previewImages,
        variant.primaryImageIndex,
        previewImages[variant.primaryImageIndex]
      );

      return previewImages[primaryImageIndex] || "";
    }

    function serializeVariantState(variant, index) {
      const images = getVariantPreviewImages(variant).filter((image) => typeof image === "string" && image.trim());
      const primaryImageIndex = getResolvedPrimaryImageIndex(images, variant.primaryImageIndex);
      const primaryImage = images[primaryImageIndex] || "";

      return {
        id: variant.id || `color-${index + 1}`,
        name: variant.name || "",
        colorHex: variant.colorHex || "#dbeafe",
        images: images.slice(),
        image: primaryImage,
        primaryImageIndex,
        imagePositionX: clampPositionValue(variant.imagePositionX),
        imagePositionY: clampPositionValue(variant.imagePositionY)
      };
    }

    function persistColorVariantsDraft() {
      colorVariantsDraft = colorVariantsState.map((variant, index) => serializeVariantState(variant, index));
    }

    function restoreColorVariantsFromDraft(draft) {
      colorVariantsState = Array.isArray(draft)
        ? draft.map((variant) => createVariantState(variant))
        : [];
      persistColorVariantsDraft();
    }

    function syncSingleVariantFromCard(card) {
      const realCard = card.closest(".variant-card");
      if (!realCard) {
        return null;
      }

      const variant = colorVariantsState.find(
        (item) => item.uid === realCard.getAttribute("data-variant-id")
      );

      if (!variant) {
        return null;
      }

      const nameInput = realCard.querySelector("[data-role='variant-name']");
      const colorInput = realCard.querySelector("[data-role='variant-color']");
      const imagePositionXInput = realCard.querySelector("[data-role='variant-image-position-x']");
      const imagePositionYInput = realCard.querySelector("[data-role='variant-image-position-y']");

      variant.name = nameInput ? nameInput.value.trim() : "";
      variant.colorHex = colorInput ? colorInput.value.trim() : "#dbeafe";
      variant.imagePositionX = clampPositionValue(imagePositionXInput ? imagePositionXInput.value : variant.imagePositionX);
      variant.imagePositionY = clampPositionValue(imagePositionYInput ? imagePositionYInput.value : variant.imagePositionY);

      const previewImages = getVariantPreviewImages(variant);
      variant.primaryImageIndex = getResolvedPrimaryImageIndex(previewImages, variant.primaryImageIndex);

      persistColorVariantsDraft();

      return variant;
    }

    function updateVariantCardPreview(card, variant) {
      if (!card || !variant) {
        return;
      }

      const title = card.querySelector(".variant-card-title strong");
      const swatch = card.querySelector(".variant-swatch");
      const previewWrap = card.querySelector("[data-role='variant-preview-wrap']");
      const previewImage = card.querySelector("[data-role='variant-preview-image']");
      const positionXValue = card.querySelector("[data-role='variant-image-position-x-value']");
      const positionYValue = card.querySelector("[data-role='variant-image-position-y-value']");
      const primaryImage = getVariantPrimaryImage(variant);

      if (title) {
        title.textContent = variant.name || I18n.t("common.color");
      }

      if (swatch) {
        swatch.style.background = variant.colorHex || "#dbeafe";
      }

      if (positionXValue) {
        positionXValue.textContent = `${variant.imagePositionX}%`;
      }

      if (positionYValue) {
        positionYValue.textContent = `${variant.imagePositionY}%`;
      }

      if (previewWrap && previewImage) {
        if (primaryImage) {
          previewImage.src = primaryImage;
          previewImage.style.objectPosition = `${variant.imagePositionX}% ${variant.imagePositionY}%`;
          previewWrap.classList.remove("hidden");
        } else {
          previewImage.removeAttribute("src");
          previewWrap.classList.add("hidden");
        }
      }
    }

    function renderColorVariants() {
      if (!colorVariantsState.length) {
        colorVariantsList.innerHTML = `<p class="helper-text">${I18n.t("admin.noColorVariants")}</p>`;
        return;
      }

      colorVariantsList.innerHTML = colorVariantsState
        .map((variant, index) => {
          const images = getVariantPreviewImages(variant);
          const primaryImage = getVariantPrimaryImage(variant);
          const preview = images.length
            ? `
                <div class="gallery-preview-list">
                  ${images
                    .map((image, imageIndex) => {
                      return `
                        <div class="gallery-preview-card">
                          <button class="gallery-preview-item variant-gallery-item ${imageIndex === variant.primaryImageIndex ? "is-primary" : ""}" type="button" data-action="set-variant-primary" data-variant-id="${variant.uid}" data-image-index="${imageIndex}" title="Color ${index + 1} ${imageIndex + 1}">
                            <img src="${image}" alt="Color gallery ${imageIndex + 1}">
                          </button>
                          <button class="gallery-preview-delete" type="button" data-action="delete-variant-image" data-variant-id="${variant.uid}" data-image-index="${imageIndex}" aria-label="${I18n.t("common.delete")}">
                            ×
                          </button>
                        </div>
                      `;
                    })
                    .join("")}
                </div>
              `
            : "";

          const helperMessage = images.length
            ? variant.selectedImages.length
              ? I18n.t("admin.colorGallerySelected", { count: variant.selectedImages.length })
              : I18n.t("admin.colorGalleryLoaded")
            : I18n.t("admin.colorGalleryHint");
          const savedMessage = variant.savedMessage
            ? `<p class="helper-text success" data-role="variant-save-message">${escapeHtml(variant.savedMessage)}</p>`
            : "";

          return `
            <article class="variant-card" data-variant-id="${variant.uid}">
              <div class="variant-card-header">
                <div class="variant-card-title">
                  <span class="variant-swatch" style="background:${escapeHtml(variant.colorHex)};"></span>
                  <strong>${escapeHtml(variant.name || `${I18n.t("common.color")} ${index + 1}`)}</strong>
                </div>
                <button class="button danger" type="button" data-action="remove-variant" data-variant-id="${variant.uid}">
                  ${I18n.t("admin.removeColorVariant")}
                </button>
              </div>

              <div class="form-row">
                <label class="field">
                  <span>${I18n.t("admin.colorName")}</span>
                  <input data-role="variant-name" type="text" value="${escapeHtml(variant.name)}">
                </label>

                <label class="field">
                  <span>${I18n.t("admin.colorHex")}</span>
                  <input data-role="variant-color" type="text" value="${escapeHtml(variant.colorHex)}" placeholder="#ff0000">
                </label>
              </div>

              <label class="field">
                <span>${I18n.t("admin.galleryImages")}</span>
                <input data-role="variant-gallery" type="file" accept="image/*" multiple>
              </label>

              <div class="variant-preview-layout">
                <div class="image-preview variant-image-preview ${primaryImage ? "" : "hidden"}" data-role="variant-preview-wrap">
                  <img
                    class="image-preview-img"
                    data-role="variant-preview-image"
                    ${primaryImage ? `src="${escapeHtml(primaryImage)}"` : ""}
                    alt="${escapeHtml(variant.name || `${I18n.t("common.color")} ${index + 1}`)}"
                    style="object-position: ${variant.imagePositionX}% ${variant.imagePositionY}%;">
                </div>

                <div class="form-stack image-controls variant-image-controls">
                  <p class="helper-text">${I18n.t("admin.cropPreviewHint")}</p>

                  <label class="field">
                    <span>${I18n.t("admin.imagePositionX")}</span>
                    <div class="range-field">
                      <input data-role="variant-image-position-x" type="range" min="0" max="100" value="${variant.imagePositionX}">
                      <strong data-role="variant-image-position-x-value">${variant.imagePositionX}%</strong>
                    </div>
                  </label>

                  <label class="field">
                    <span>${I18n.t("admin.imagePositionY")}</span>
                    <div class="range-field">
                      <input data-role="variant-image-position-y" type="range" min="0" max="100" value="${variant.imagePositionY}">
                      <strong data-role="variant-image-position-y-value">${variant.imagePositionY}%</strong>
                    </div>
                  </label>
                </div>
              </div>

              <div class="form-actions">
                <button class="button secondary" type="button" data-action="save-variant" data-variant-id="${variant.uid}">
                  ${I18n.t("admin.saveColorVariant")}
                </button>
              </div>
              <p class="helper-text" data-role="variant-status">${helperMessage}</p>
              ${savedMessage}
              ${images.length ? `<p class="helper-text">${I18n.t("admin.variantPrimaryHint")}</p>` : ""}
              ${preview}
            </article>
          `;
        })
        .join("");
    }

    function buildColorVariants(productName) {
      syncColorVariantsFromDom();
      const sourceVariants = colorVariantsState.map((variant, index) =>
        serializeVariantState(variant, index)
      );

      return sourceVariants
        .map((variant, index) => {
          const images = Array.isArray(variant.images)
            ? variant.images.filter((image) => typeof image === "string" && image.trim())
            : [];

          if (!variant.name && !images.length && variant.colorHex === "#dbeafe") {
            return null;
          }

          const finalImages = images.length
            ? images
            : [Store.createImagePlaceholder(
                `${productName} ${variant.name || `${I18n.t("common.color")} ${index + 1}`}`,
                "#1D5CFF",
                "#18A999"
              )];
          const primaryImageIndex = getResolvedPrimaryImageIndex(
            finalImages,
            variant.primaryImageIndex,
            variant.image
          );
          const primaryImage = finalImages[primaryImageIndex] || finalImages[0];

          return {
            id: variant.id || `color-${index + 1}`,
            name: variant.name || `${I18n.t("common.color")} ${index + 1}`,
            colorHex: variant.colorHex || "#dbeafe",
            image: primaryImage,
            images: finalImages,
            primaryImageIndex,
            imagePositionX: clampPositionValue(variant.imagePositionX),
            imagePositionY: clampPositionValue(variant.imagePositionY)
          };
        })
        .filter(Boolean);
    }

    function saveVariant(card, options) {
      const variant = syncSingleVariantFromCard(card);

      if (!variant) {
        return;
      }
      variant.savedMessage = I18n.t("admin.colorVariantSaved");

      persistColorVariantsDraft();

      if (options?.rerender) {
        renderColorVariants();
      } else {
        updateVariantCardPreview(card, variant);
      }
    }

    function loadProductIntoForm(product, messageText) {
      document.getElementById("productId").value = String(product.id);
      document.getElementById("productName").value = product.name;
      document.getElementById("productDescription").value = product.description;
      document.getElementById("productSpecifications").value = product.specifications || "";
      document.getElementById("productPrice").value = String(I18n.toDisplayPriceValue(product.price));
      document.getElementById("productManufacturer").value = product.manufacturer;
      populateProductCategories(product.categoryId);

      productImageFileInput.value = "";
      productGalleryFilesInput.value = "";
      selectedImageData = "";
      selectedGalleryImages = [];
      currentProductImage = Store.getPrimaryProductImage(product);
      currentGalleryImages = Store.getProductImages(product).slice(1);
      currentImagePositionX = Number.isFinite(product.imagePositionX) ? product.imagePositionX : 50;
      currentImagePositionY = Number.isFinite(product.imagePositionY) ? product.imagePositionY : 50;
      currentAllowImageExpand = product.allowImageExpand !== false;
      restoreColorVariantsFromDraft(product.colorVariants);
      renderImagePreview(currentProductImage, I18n.t("admin.currentImageKept"));
      renderGalleryPreview(productGalleryPreview, currentGalleryImages);
      setGalleryStatus(currentGalleryImages.length ? I18n.t("admin.galleryLoaded") : I18n.t("admin.galleryHint"));
      renderColorVariants();
      document.getElementById("productFormTitle").textContent = I18n.t("admin.editProduct");

      if (messageText) {
        setMessage(document.getElementById("productFormMessage"), messageText, "success");
      }
    }

    function renderProductsTable() {
      const products = getProducts();

      if (!products.length) {
        productsTable.innerHTML = `
          <div class="table-row">
            <div>
              <strong>${I18n.t("admin.noProductsYet")}</strong>
              <p>${I18n.t("admin.addFirstProduct")}</p>
            </div>
          </div>
        `;
        return;
      }

      productsTable.innerHTML = products
        .map((product) => {
          return `
            <article class="table-row">
              <div>
                <strong>${escapeHtml(I18n.translateProductName(product))}</strong>
                <p>${escapeHtml(I18n.getCategoryPath(product.categoryId))} | ${escapeHtml(product.manufacturer)}</p>
                <p>${escapeHtml(I18n.formatPrice(product.price))}</p>
              </div>
              <div class="row-actions">
                <button class="button secondary" type="button" data-edit-product="${product.id}">${I18n.t("common.edit")}</button>
                <button class="button danger" type="button" data-delete-product="${product.id}">${I18n.t("common.delete")}</button>
              </div>
            </article>
          `;
        })
        .join("");
    }

    function renderCategoriesTable() {
      const categories = getCategories();

      if (!categories.length) {
        categoriesTable.innerHTML = `
          <div class="table-row">
            <div>
              <strong>${I18n.t("admin.noCategoriesYet")}</strong>
              <p>${I18n.t("admin.addFirstCategory")}</p>
            </div>
          </div>
        `;
        return;
      }

      categoriesTable.innerHTML = categories
        .map((category) => {
          return `
            <article class="table-row">
              <div>
                <strong>${escapeHtml(I18n.translateCategoryName(category))}</strong>
                <p>${category.parentId ? escapeHtml(I18n.t("common.parentLabel", { name: I18n.getCategoryPath(category.parentId) })) : escapeHtml(I18n.t("common.topLevelCategory"))}</p>
              </div>
              <div class="row-actions">
                <button class="button secondary" type="button" data-edit-category="${category.id}">${I18n.t("common.edit")}</button>
                <button class="button danger" type="button" data-delete-category="${category.id}">${I18n.t("common.delete")}</button>
              </div>
            </article>
          `;
        })
        .join("");
    }

    function refreshAdminView() {
      populateProductCategories(document.getElementById("productCategory").value);
      populateCategoryParents(document.getElementById("categoryId").value, document.getElementById("categoryParent").value);
      renderProductsTable();
      renderCategoriesTable();
    }

    function isDescendant(parentId, categoryId) {
      const categories = getCategories();
      let current = categories.find((category) => category.id === Number(parentId)) || null;

      while (current) {
        if (current.parentId === Number(categoryId)) {
          return true;
        }
        current = categories.find((category) => category.id === current.parentId) || null;
      }

      return false;
    }

    productForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const products = getProducts();
      const productId = Number(document.getElementById("productId").value);
      const name = document.getElementById("productName").value.trim();
      const description = document.getElementById("productDescription").value.trim();
      const specifications = document.getElementById("productSpecifications").value.trim();
      const displayPrice = Number(document.getElementById("productPrice").value);
      const price = I18n.fromDisplayPriceValue(displayPrice);
      const manufacturer = document.getElementById("productManufacturer").value.trim();
      const categoryId = Number(document.getElementById("productCategory").value);
      const message = document.getElementById("productFormMessage");
      const selectedFile = productImageFileInput.files[0];

      if (!categoryId) {
        setMessage(message, I18n.t("admin.selectCategoryError"), "error");
        return;
      }

      if (selectedFile && !isValidImageFile(selectedFile)) {
        renderImagePreview(currentProductImage, I18n.t("admin.imageTypeError"), "error");
        return;
      }

      if (selectedFile && !selectedImageData) {
        try {
          selectedImageData = await readImageFile(selectedFile);
        } catch (error) {
          renderImagePreview(currentProductImage, I18n.t("admin.imageReadError"), "error");
          return;
        }
      }

      const imagePositionX = Number(productImagePositionXInput.value);
      const imagePositionY = Number(productImagePositionYInput.value);
      const allowImageExpand = productAllowExpandInput.checked;

      syncColorVariantsFromDom();
      persistColorVariantsDraft();

      const colorVariants = buildColorVariants(name);

      let image = selectedImageData || currentProductImage || Store.createImagePlaceholder(name, "#1D5CFF", "#18A999");
      let images = [image].concat(selectedGalleryImages.length ? selectedGalleryImages : currentGalleryImages);

      const payload = {
        id: productId || Store.generateId(products),
        name,
        description,
        specifications,
        price,
        image,
        manufacturer,
        categoryId,
        images,
        imagePositionX,
        imagePositionY,
        allowImageExpand,
        colorVariants
      };
      if (productId) {
        const updatedProducts = Store.getProducts().map((product) => {
              if (product.id === productId) {
                return {
                  ...product,
                  ...payload
                };
              }
              return product;
            });

            Store.saveProducts(updatedProducts);
        refreshAdminView();
        loadProductIntoForm(payload, I18n.t("admin.productUpdated"));
      } else {
        products.push(payload);
        Store.saveProducts(products);
        resetProductForm();
        resetProductImageState();
        refreshAdminView();
        setMessage(document.getElementById("productFormMessage"), I18n.t("admin.productAdded"), "success");
      }
    });

    categoryForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const categories = getCategories();
      const categoryId = Number(document.getElementById("categoryId").value);
      const name = document.getElementById("categoryName").value.trim();
      const parentIdValue = document.getElementById("categoryParent").value;
      const parentId = parentIdValue ? Number(parentIdValue) : null;
      const message = document.getElementById("categoryFormMessage");

      if (categoryId && parentId && isDescendant(parentId, categoryId)) {
        setMessage(message, I18n.t("admin.categoryLoopError"), "error");
        return;
      }

      if (categoryId) {
        Store.saveCategories(categories.map((category) => (category.id === categoryId ? { id: categoryId, name, parentId } : category)));
        setMessage(message, I18n.t("admin.categoryUpdated"), "success");
      } else {
        categories.push({
          id: Store.generateId(categories),
          name,
          parentId
        });
        Store.saveCategories(categories);
        setMessage(message, I18n.t("admin.categoryAdded"), "success");
      }

      resetCategoryForm();
      refreshAdminView();
    });

    productsTable.addEventListener("click", (event) => {
      const editButton = event.target.closest("[data-edit-product]");
      const deleteButton = event.target.closest("[data-delete-product]");

      if (editButton) {
        const productId = Number(editButton.getAttribute("data-edit-product"));
        const product = getProducts().find((item) => item.id === productId);

        if (!product) {
          return;
        }

        loadProductIntoForm(product, I18n.t("admin.editingSelectedProduct"));
        scrollToPageTop();
        return;
      }

      if (deleteButton) {
        const productId = Number(deleteButton.getAttribute("data-delete-product"));
        Store.saveProducts(getProducts().filter((item) => item.id !== productId));
        refreshAdminView();
      }
    });

    categoriesTable.addEventListener("click", (event) => {
      const editButton = event.target.closest("[data-edit-category]");
      const deleteButton = event.target.closest("[data-delete-category]");

      if (editButton) {
        const categoryId = Number(editButton.getAttribute("data-edit-category"));
        const category = getCategories().find((item) => item.id === categoryId);

        if (!category) {
          return;
        }

        document.getElementById("categoryId").value = String(category.id);
        document.getElementById("categoryName").value = category.name;
        populateCategoryParents(category.id, category.parentId);
        document.getElementById("categoryFormTitle").textContent = I18n.t("admin.editCategory");
        setMessage(document.getElementById("categoryFormMessage"), I18n.t("admin.editingSelectedCategory"), "success");
        scrollToPageTop();
        return;
      }

      if (deleteButton) {
        const categoryId = Number(deleteButton.getAttribute("data-delete-category"));
        const categories = getCategories();
        const hasChildren = categories.some((category) => category.parentId === categoryId);
        const hasProducts = getProducts().some((product) => product.categoryId === categoryId);

        if (hasChildren || hasProducts) {
          setMessage(document.getElementById("categoryFormMessage"), I18n.t("admin.deleteCategoryBlocked"), "error");
          return;
        }

        Store.saveCategories(categories.filter((category) => category.id !== categoryId));
        refreshAdminView();
      }
    });

    document.getElementById("cancelProductEdit").addEventListener("click", () => {
      resetProductForm();
      resetProductImageState();
      populateProductCategories();
    });

    document.getElementById("cancelCategoryEdit").addEventListener("click", () => {
      resetCategoryForm();
      populateCategoryParents();
    });

    productImageFileInput.addEventListener("change", async () => {
      const selectedFile = productImageFileInput.files[0];

      if (!selectedFile) {
        selectedImageData = "";
        renderImagePreview(currentProductImage, currentProductImage ? I18n.t("admin.currentImageKept") : I18n.t("admin.imageHint"));
        return;
      }

      if (!isValidImageFile(selectedFile)) {
        productImageFileInput.value = "";
        selectedImageData = "";
        renderImagePreview(currentProductImage, I18n.t("admin.imageTypeError"), "error");
        return;
      }

      try {
        selectedImageData = await readImageFile(selectedFile);
        renderImagePreview(selectedImageData, I18n.t("admin.selectedFile", { name: selectedFile.name }), "success");
      } catch (error) {
        productImageFileInput.value = "";
        selectedImageData = "";
        renderImagePreview(currentProductImage, I18n.t("admin.imageReadError"), "error");
      }
    });

    productGalleryFilesInput.addEventListener("change", async () => {
      const selectedFiles = Array.from(productGalleryFilesInput.files);

      if (!selectedFiles.length) {
        selectedGalleryImages = [];
        renderGalleryPreview(productGalleryPreview, currentGalleryImages);
        setGalleryStatus(currentGalleryImages.length ? I18n.t("admin.galleryLoaded") : I18n.t("admin.galleryHint"));
        return;
      }

      if (selectedFiles.some((file) => !isValidImageFile(file))) {
        productGalleryFilesInput.value = "";
        selectedGalleryImages = [];
        renderGalleryPreview(productGalleryPreview, currentGalleryImages);
        setGalleryStatus(I18n.t("admin.imageTypeError"), "error");
        return;
      }

      try {
        selectedGalleryImages = await readImageFiles(selectedFiles);
        renderGalleryPreview(productGalleryPreview, selectedGalleryImages);
        setGalleryStatus(I18n.t("admin.gallerySelected", { count: selectedGalleryImages.length }), "success");
      } catch (error) {
        productGalleryFilesInput.value = "";
        selectedGalleryImages = [];
        renderGalleryPreview(productGalleryPreview, currentGalleryImages);
        setGalleryStatus(I18n.t("admin.imageReadError"), "error");
      }
    });

    productGalleryPreview.addEventListener("click", (event) => {
      const deleteButton = event.target.closest("[data-action='delete-product-gallery-image']");
      if (!deleteButton) {
        return;
      }

      const imageIndex = Number(deleteButton.getAttribute("data-image-index"));
      const activeImages = selectedGalleryImages.length ? selectedGalleryImages : currentGalleryImages;
      const updatedImages = activeImages.filter((_, index) => index !== imageIndex);

      if (selectedGalleryImages.length) {
        selectedGalleryImages = updatedImages;
        renderGalleryPreview(productGalleryPreview, selectedGalleryImages);
        setGalleryStatus(
          selectedGalleryImages.length
            ? I18n.t("admin.gallerySelected", { count: selectedGalleryImages.length })
            : I18n.t("admin.galleryHint"),
          selectedGalleryImages.length ? "success" : ""
        );
        return;
      }

      currentGalleryImages = updatedImages;
      renderGalleryPreview(productGalleryPreview, currentGalleryImages);
      setGalleryStatus(currentGalleryImages.length ? I18n.t("admin.galleryLoaded") : I18n.t("admin.galleryHint"));
    });

    productImagePositionXInput.addEventListener("input", () => {
      currentImagePositionX = Number(productImagePositionXInput.value);
      renderImagePreview(selectedImageData || currentProductImage, productImageStatus.textContent, productImageStatus.classList.contains("error") ? "error" : productImageStatus.classList.contains("success") ? "success" : "");
    });

    productImagePositionYInput.addEventListener("input", () => {
      currentImagePositionY = Number(productImagePositionYInput.value);
      renderImagePreview(selectedImageData || currentProductImage, productImageStatus.textContent, productImageStatus.classList.contains("error") ? "error" : productImageStatus.classList.contains("success") ? "success" : "");
    });

    productAllowExpandInput.addEventListener("change", () => {
      currentAllowImageExpand = productAllowExpandInput.checked;
    });

    addColorVariantButton.addEventListener("click", () => {
      syncColorVariantsFromDom();

      colorVariantsState.push(createVariantState({
        name: "",
        colorHex: "#dbeafe",
        images: []
      }));

      persistColorVariantsDraft();
      renderColorVariants();
    });

    colorVariantsList.addEventListener("change", async (event) => {
      const card = event.target.closest("[data-variant-id]");
      if (!card) {
        return;
      }

      const variant = colorVariantsState.find((item) => item.uid === card.getAttribute("data-variant-id"));
      if (!variant) {
        return;
      }

      if (event.target.matches("[data-role='variant-gallery']")) {
        syncColorVariantsFromDom();
        const files = Array.from(event.target.files || []);

        if (!files.length) {
          variant.selectedImages = [];
          persistColorVariantsDraft();
          renderColorVariants();
          return;
        }

        if (files.some((file) => !isValidImageFile(file))) {
          event.target.value = "";
          variant.selectedImages = [];
          persistColorVariantsDraft();
          renderColorVariants();
          return;
        }

        try {
          variant.selectedImages = await readImageFiles(files);
          variant.primaryImageIndex = 0;
          variant.savedMessage = "";
          persistColorVariantsDraft();
          renderColorVariants();
        } catch (error) {
          event.target.value = "";
          variant.selectedImages = [];
          persistColorVariantsDraft();
          renderColorVariants();
        }
        return;
      }

      syncColorVariantsFromDom();
    });

    colorVariantsList.addEventListener("input", (event) => {
      const card = event.target.closest("[data-variant-id]");
      if (!card) {
        return;
      }

      syncColorVariantsFromDom();
      const variant = colorVariantsState.find((item) => item.uid === card.getAttribute("data-variant-id"));
      if (variant) {
        updateVariantCardPreview(card, variant);
      }

      persistColorVariantsDraft();
    });

    colorVariantsList.addEventListener("click", (event) => {
      const removeButton = event.target.closest("[data-action='remove-variant']");
      const setPrimaryButton = event.target.closest("[data-action='set-variant-primary']");
      const saveVariantButton = event.target.closest("[data-action='save-variant']");
      const deleteVariantImageButton = event.target.closest("[data-action='delete-variant-image']");

      if (saveVariantButton) {
          const card = saveVariantButton.closest(".variant-card");

          if (card) {
            saveVariant(card, { rerender: true });
          }

          return;
        }

      if (deleteVariantImageButton) {
        syncColorVariantsFromDom();
        const variantId = deleteVariantImageButton.getAttribute("data-variant-id");
        const imageIndex = Number(deleteVariantImageButton.getAttribute("data-image-index"));
        const variant = colorVariantsState.find((item) => item.uid === variantId);

        if (variant) {
          const activeImages = variant.selectedImages.length ? variant.selectedImages : variant.currentImages;
          const updatedImages = activeImages.filter((_, index) => index !== imageIndex);

          if (variant.selectedImages.length) {
            variant.selectedImages = updatedImages;
          } else {
            variant.currentImages = updatedImages;
          }

          if (!updatedImages.length) {
            variant.primaryImageIndex = 0;
          } else if (imageIndex < variant.primaryImageIndex) {
            variant.primaryImageIndex -= 1;
          } else if (variant.primaryImageIndex >= updatedImages.length) {
            variant.primaryImageIndex = updatedImages.length - 1;
          }

          variant.savedMessage = "";
          persistColorVariantsDraft();
          renderColorVariants();
        }
        return;
      }

      if (setPrimaryButton) {
        syncColorVariantsFromDom();
        const variantId = setPrimaryButton.getAttribute("data-variant-id");
        const imageIndex = Number(setPrimaryButton.getAttribute("data-image-index"));
        const variant = colorVariantsState.find((item) => item.uid === variantId);

        if (variant) {
          variant.primaryImageIndex = Number.isFinite(imageIndex) ? imageIndex : 0;
          variant.savedMessage = "";
          persistColorVariantsDraft();
          renderColorVariants();
        }
        return;
      }

      if (removeButton) {
        syncColorVariantsFromDom();
        const variantId = removeButton.getAttribute("data-variant-id");
        colorVariantsState = colorVariantsState.filter((variant) => variant.uid !== variantId);
        persistColorVariantsDraft();
        renderColorVariants();
      }
    });

    populateProductCategories();
    populateCategoryParents();
    resetProductImageState();
    refreshAdminView();
  }

  document.addEventListener("DOMContentLoaded", () => {
    Store.initData();
    setupAdminPage();
  });
})();
