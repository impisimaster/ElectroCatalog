(function () {
  const STORAGE_KEYS = {
    products: "electroCatalog.products",
    categories: "electroCatalog.categories",
    users: "electroCatalog.users",
    currentUser: "electroCatalog.currentUser",
    reviews: "electroCatalog.reviews",
    orders: "electroCatalog.orders"
  };
  const BASE_VARIANT_ID = "__base";

  function escapeXml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  function createImagePlaceholder(label, startColor, endColor) {
    const safeLabel = escapeXml(label);
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">
        <defs>
          <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${startColor}" />
            <stop offset="100%" stop-color="${endColor}" />
          </linearGradient>
        </defs>
        <rect width="800" height="500" rx="36" fill="url(#g)" />
        <circle cx="660" cy="130" r="90" fill="rgba(255,255,255,0.18)" />
        <circle cx="130" cy="390" r="100" fill="rgba(255,255,255,0.12)" />
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
          font-family="Segoe UI, Trebuchet MS, sans-serif" font-size="48" font-weight="700" fill="white">
          ${safeLabel}
        </text>
      </svg>
    `;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  const seedCategories = [
    { id: 1, name: "Smartphones", parentId: null },
    { id: 2, name: "Laptops", parentId: null },
    { id: 3, name: "Audio", parentId: null },
    { id: 4, name: "Android Phones", parentId: 1 },
    { id: 5, name: "iPhones", parentId: 1 },
    { id: 6, name: "Ultrabooks", parentId: 2 },
    { id: 7, name: "Gaming Laptops", parentId: 2 },
    { id: 8, name: "Headphones", parentId: 3 },
    { id: 9, name: "Smart Speakers", parentId: 3 }
  ];

  const seedProducts = [
    {
      id: 1,
      name: "Pixel Nova 8",
      description: "A fast Android smartphone with a bright OLED display, advanced AI camera tools, strong stereo sound, and reliable two-day battery life for daily use.",
      price: 799,
      image: createImagePlaceholder("Pixel Nova 8", "#1D5CFF", "#18A999"),
      manufacturer: "Google",
      categoryId: 4,
      specifications: "Display: 6.7-inch OLED, 120 Hz\nProcessor: Tensor Nova G4\nRAM: 12 GB\nStorage: 256 GB\nBattery: 5100 mAh\nCamera: 50 MP + 12 MP ultrawide"
    },
    {
      id: 2,
      name: "iPhone Air 15",
      description: "Premium smartphone with a powerful chipset, cinematic camera mode, durable aluminum frame, and optimized battery life for photo, video, and work.",
      price: 1099,
      image: createImagePlaceholder("iPhone Air 15", "#25314C", "#667EEA"),
      manufacturer: "Apple",
      categoryId: 5,
      specifications: "Display: 6.1-inch Super Retina OLED\nProcessor: A18 Air\nRAM: 8 GB\nStorage: 256 GB\nBattery: Up to 26 hours video playback\nCamera: 48 MP main + 12 MP ultrawide"
    },
    {
      id: 3,
      name: "ZenBook Flow 14",
      description: "Slim ultrabook for study and work with a sharp 14-inch display, silent cooling, premium build, and strong battery life for mobile productivity.",
      price: 1249,
      image: createImagePlaceholder("ZenBook Flow 14", "#0F766E", "#34D399"),
      manufacturer: "ASUS",
      categoryId: 6,
      specifications: "Display: 14-inch OLED, 2880x1800\nProcessor: Intel Core Ultra 7\nRAM: 16 GB\nStorage: 1 TB SSD\nWeight: 1.29 kg\nBattery: 75 Wh"
    },
    {
      id: 4,
      name: "Predator Core X",
      description: "Gaming laptop with a high-refresh display, powerful dedicated graphics, advanced thermal control, and a keyboard tuned for long gaming sessions.",
      price: 1799,
      image: createImagePlaceholder("Predator Core X", "#7C2D12", "#F97316"),
      manufacturer: "Acer",
      categoryId: 7,
      specifications: "Display: 16-inch IPS, 240 Hz\nProcessor: Intel Core i9\nGraphics: NVIDIA GeForce RTX 4070\nRAM: 32 GB\nStorage: 1 TB SSD\nCooling: Dual-fan vapor chamber"
    },
    {
      id: 5,
      name: "QuietBeat Pro",
      description: "Wireless over-ear headphones with adaptive noise cancellation, rich bass, soft ear cushions, and a folding travel case for everyday commuting.",
      price: 249,
      image: createImagePlaceholder("QuietBeat Pro", "#312E81", "#A78BFA"),
      manufacturer: "Sony",
      categoryId: 8,
      specifications: "Type: Over-ear wireless\nNoise cancellation: Adaptive ANC\nBattery life: Up to 35 hours\nConnectivity: Bluetooth 5.3\nCharging: USB-C fast charge\nWeight: 268 g"
    },
    {
      id: 6,
      name: "Echo Sphere",
      description: "Compact smart speaker with voice assistant support, room-filling sound, clear microphones, and seamless control of a connected smart home.",
      price: 129,
      image: createImagePlaceholder("Echo Sphere", "#164E63", "#06B6D4"),
      manufacturer: "Amazon",
      categoryId: 9,
      specifications: "Speaker: 2.5-inch full-range driver\nVoice assistant: Alexa\nConnectivity: Wi‑Fi, Bluetooth\nMicrophones: Far-field array\nSmart home: Matter support\nPower: Mains adapter"
    },
    {
      id: 7,
      name: "Galaxy Vision S24",
      description: "Flagship Android smartphone with a vivid AMOLED screen, advanced zoom camera, premium build, and smart productivity features for power users.",
      price: 999,
      image: createImagePlaceholder("Galaxy Vision S24", "#1E293B", "#38BDF8"),
      manufacturer: "Samsung",
      categoryId: 4,
      specifications: "Display: 6.8-inch Dynamic AMOLED 2X, 120 Hz\nProcessor: Exynos Vision X1\nRAM: 12 GB\nStorage: 256 GB\nBattery: 5000 mAh\nCamera: 200 MP + 12 MP + 10 MP"
    },
    {
      id: 8,
      name: "Moto Edge Lite",
      description: "Balanced mid-range Android phone with a clean interface, OLED panel, dependable battery, and fast charging for everyday convenience.",
      price: 429,
      image: createImagePlaceholder("Moto Edge Lite", "#0F766E", "#2DD4BF"),
      manufacturer: "Motorola",
      categoryId: 4,
      specifications: "Display: 6.6-inch OLED, 144 Hz\nProcessor: Snapdragon 7s\nRAM: 8 GB\nStorage: 256 GB\nBattery: 5000 mAh\nCharging: 68 W TurboPower"
    },
    {
      id: 9,
      name: "MacBook AirWave 13",
      description: "Thin and quiet notebook with a bright display, efficient performance, long battery life, and premium portability for study or office work.",
      price: 1399,
      image: createImagePlaceholder("MacBook AirWave 13", "#64748B", "#CBD5E1"),
      manufacturer: "Apple",
      categoryId: 6,
      specifications: "Display: 13.6-inch Liquid Retina\nProcessor: Apple M4\nRAM: 16 GB\nStorage: 512 GB SSD\nBattery: Up to 18 hours\nWeight: 1.24 kg"
    },
    {
      id: 10,
      name: "Legion Storm 16",
      description: "High-performance gaming laptop with powerful graphics, fast DDR5 memory, sharp display, and efficient cooling for modern AAA titles.",
      price: 1899,
      image: createImagePlaceholder("Legion Storm 16", "#111827", "#8B5CF6"),
      manufacturer: "Lenovo",
      categoryId: 7,
      specifications: "Display: 16-inch IPS, 240 Hz\nProcessor: AMD Ryzen 9\nGraphics: NVIDIA GeForce RTX 4080\nRAM: 32 GB DDR5\nStorage: 1 TB SSD\nCooling: ColdFront 5.0"
    },
    {
      id: 11,
      name: "SoundCore Studio Max",
      description: "Premium wireless headphones with detailed audio, effective ANC, comfortable ear pads, and broad device compatibility for music and calls.",
      price: 319,
      image: createImagePlaceholder("SoundCore Studio Max", "#4C1D95", "#C084FC"),
      manufacturer: "Anker",
      categoryId: 8,
      specifications: "Type: Over-ear wireless\nDrivers: 40 mm dynamic\nNoise cancellation: Hybrid ANC\nBattery life: Up to 40 hours\nConnectivity: Bluetooth 5.3, AUX\nMicrophones: 5 AI-enhanced mics"
    },
    {
      id: 12,
      name: "HomePod Mini Air",
      description: "Compact smart speaker with balanced sound, easy voice control, multi-room playback, and attractive design for modern home interiors.",
      price: 149,
      image: createImagePlaceholder("HomePod Mini Air", "#0F172A", "#60A5FA"),
      manufacturer: "Apple",
      categoryId: 9,
      specifications: "Audio: 360-degree sound\nVoice assistant: Siri\nConnectivity: Wi‑Fi, Bluetooth\nSmart home: HomeKit support\nMulti-room: Yes\nPower: USB-C adapter"
    }
  ];

  const seedUsers = [
    { id: 1, login: "admin", password: "admin123", role: "admin" },
    { id: 2, login: "demo", password: "demo123", role: "user" }
  ];

  function readList(key, fallback) {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }

    try {
      return JSON.parse(raw);
    } catch (error) {
      return fallback;
    }
  }

  function writeList(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function initData() {
    if (!localStorage.getItem(STORAGE_KEYS.categories)) {
      writeList(STORAGE_KEYS.categories, seedCategories);
    }

    if (!localStorage.getItem(STORAGE_KEYS.products)) {
      writeList(STORAGE_KEYS.products, seedProducts);
    } else {
      const currentProducts = readList(STORAGE_KEYS.products, []);
      const mergedProducts = currentProducts.slice();

      seedProducts.forEach((seedProduct) => {
        const existingIndex = mergedProducts.findIndex((product) => product.id === seedProduct.id);

        if (existingIndex === -1) {
          mergedProducts.push(seedProduct);
          return;
        }

        const existingProduct = mergedProducts[existingIndex];

        mergedProducts[existingIndex] = {
          ...seedProduct,
          ...existingProduct,
          description: existingProduct.description || seedProduct.description,
          specifications: existingProduct.specifications || seedProduct.specifications,
          images: Array.isArray(existingProduct.images) && existingProduct.images.length
            ? existingProduct.images
            : seedProduct.images,
          image: existingProduct.image || seedProduct.image
        };
      });

      writeList(STORAGE_KEYS.products, mergedProducts);
    }

    if (!localStorage.getItem(STORAGE_KEYS.users)) {
      writeList(STORAGE_KEYS.users, seedUsers);
    }

    if (!localStorage.getItem(STORAGE_KEYS.reviews)) {
      writeList(STORAGE_KEYS.reviews, []);
    }

    if (!localStorage.getItem(STORAGE_KEYS.orders)) {
      writeList(STORAGE_KEYS.orders, []);
    }
  }

  function getProducts() {
    return readList(STORAGE_KEYS.products, []);
  }

  function saveProducts(products) {
    writeList(STORAGE_KEYS.products, products);
  }

  function getCategories() {
    return readList(STORAGE_KEYS.categories, []);
  }

  function saveCategories(categories) {
    writeList(STORAGE_KEYS.categories, categories);
  }

  function getUsers() {
    return readList(STORAGE_KEYS.users, []);
  }

  function saveUsers(users) {
    writeList(STORAGE_KEYS.users, users);
  }

  function getReviews() {
    return readList(STORAGE_KEYS.reviews, []);
  }

  function saveReviews(reviews) {
    writeList(STORAGE_KEYS.reviews, reviews);
  }

  function getOrders() {
    return readList(STORAGE_KEYS.orders, []);
  }

  function saveOrders(orders) {
    writeList(STORAGE_KEYS.orders, orders);
  }

  function getCurrentUser() {
    const raw = localStorage.getItem(STORAGE_KEYS.currentUser);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  }

  function setCurrentUser(user) {
    if (!user) {
      localStorage.removeItem(STORAGE_KEYS.currentUser);
      return;
    }

    localStorage.setItem(
      STORAGE_KEYS.currentUser,
      JSON.stringify({
        id: user.id,
        login: user.login,
        role: user.role
      })
    );
  }

  function clearCurrentUser() {
    localStorage.removeItem(STORAGE_KEYS.currentUser);
  }

  function generateId(items) {
    return items.length ? Math.max.apply(null, items.map((item) => item.id)) + 1 : 1;
  }

  function getCategoryById(categoryId) {
    return getCategories().find((category) => category.id === Number(categoryId)) || null;
  }

  function getProductById(productId) {
    return getProducts().find((product) => product.id === Number(productId)) || null;
  }

  function sanitizeImageList(images) {
    if (!Array.isArray(images)) {
      return [];
    }

    return images.filter((image) => typeof image === "string" && image.trim());
  }

  function normalizePositionValue(value) {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
      return 50;
    }

    return Math.max(0, Math.min(100, Math.round(numericValue)));
  }

  function prioritizePrimaryImage(images, primaryImage) {
    const safeImages = sanitizeImageList(images);
    const safePrimaryImage = typeof primaryImage === "string" ? primaryImage.trim() : "";

    if (!safeImages.length) {
      return safePrimaryImage ? [safePrimaryImage] : [];
    }

    if (!safePrimaryImage) {
      return safeImages;
    }

    const primaryIndex = safeImages.findIndex((image) => image === safePrimaryImage);
    if (primaryIndex === 0) {
      return safeImages;
    }

    if (primaryIndex > 0) {
      const reorderedImages = safeImages.slice();
      const [selectedImage] = reorderedImages.splice(primaryIndex, 1);
      reorderedImages.unshift(selectedImage);
      return reorderedImages;
    }

    return [safePrimaryImage].concat(safeImages);
  }

  function getVariantById(product, variantId) {
    if (!product || !variantId) {
      return null;
    }

    if (String(variantId) === BASE_VARIANT_ID) {
      const baseImages = getProductImages(product);
      return {
        id: BASE_VARIANT_ID,
        name: product.baseColorName || "",
        colorHex: product.baseColorHex || "#dbeafe",
        image: baseImages[0] || createImagePlaceholder(product?.name || "Product", "#1D5CFF", "#18A999"),
        images: baseImages,
        imagePositionX: normalizePositionValue(product?.imagePositionX),
        imagePositionY: normalizePositionValue(product?.imagePositionY),
        allowImageExpand: product?.allowImageExpand !== false,
        isDefault: true
      };
    }

    if (!Array.isArray(product.colorVariants)) {
      return null;
    }

    return product.colorVariants.find((variant) => String(variant.id) === String(variantId)) || null;
  }

  function getProductImages(product, variantId) {
    if (!product) {
      return [];
    }

    if (variantId && String(variantId) !== BASE_VARIANT_ID) {
      const variant = getVariantById(product, variantId);
      const variantImages = prioritizePrimaryImage(variant?.images, variant?.image);

      if (variantImages.length) {
        return variantImages;
      }

      if (typeof variant?.image === "string" && variant.image.trim()) {
        return [variant.image.trim()];
      }
    }

    const productImages = sanitizeImageList(product.images);

    if (productImages.length) {
      return productImages;
    }

    if (typeof product.image === "string" && product.image.trim()) {
      return [product.image];
    }

    return [];
  }

  function getPrimaryProductImage(product, variantId) {
    if (variantId && String(variantId) !== BASE_VARIANT_ID) {
      const variant = getVariantById(product, variantId);
      const primaryImage = typeof variant?.image === "string" ? variant.image.trim() : "";

      if (primaryImage) {
        return primaryImage;
      }
    }

    const images = getProductImages(product, variantId);
    return images[0] || createImagePlaceholder(product?.name || "Product", "#1D5CFF", "#18A999");
  }

  function getColorVariants(product) {
    const fallbackImages = getProductImages(product);
    const baseVariant = {
      id: BASE_VARIANT_ID,
      name: product?.baseColorName || "",
      colorHex: product?.baseColorHex || "#dbeafe",
      image: fallbackImages[0] || createImagePlaceholder(product?.name || "Product", "#1D5CFF", "#18A999"),
      images: fallbackImages,
      isDefault: true
    };

    const additionalVariants = Array.isArray(product?.colorVariants)
      ? product.colorVariants.map((variant, index) => {
          const primaryImage =
            (typeof variant?.image === "string" && variant.image.trim()) ||
            sanitizeImageList(variant?.images)[0] ||
            createImagePlaceholder(`${product?.name || "Product"} ${variant?.name || index + 1}`, "#1D5CFF", "#18A999");
          const images = prioritizePrimaryImage(variant?.images, primaryImage);

          return {
            id: variant.id || `color-${index + 1}`,
            name: variant.name || `Color ${index + 1}`,
            colorHex: variant.colorHex || "#dbeafe",
            image: primaryImage,
            images: images.length ? images : [primaryImage],
            imagePositionX: normalizePositionValue(variant?.imagePositionX),
            imagePositionY: normalizePositionValue(variant?.imagePositionY),
            isDefault: false
          };
        })
      : [];

    return [
      baseVariant,
      ...additionalVariants
    ].filter(Boolean);
  }

  function getCategoryPath(categoryId) {
    const categories = getCategories();
    const path = [];
    let current = categories.find((category) => category.id === Number(categoryId)) || null;

    while (current) {
      path.unshift(current.name);
      current = categories.find((category) => category.id === current.parentId) || null;
    }

    return path.join(" / ");
  }

  window.Store = {
    STORAGE_KEYS,
    initData,
    getProducts,
    saveProducts,
    getCategories,
    saveCategories,
    getUsers,
    saveUsers,
    getReviews,
    saveReviews,
    getOrders,
    saveOrders,
    getCurrentUser,
    setCurrentUser,
    clearCurrentUser,
    generateId,
    getCategoryById,
    getProductById,
    getVariantById,
    getProductImages,
    getPrimaryProductImage,
    getColorVariants,
    getCategoryPath,
    createImagePlaceholder,
    BASE_VARIANT_ID
  };
})();
