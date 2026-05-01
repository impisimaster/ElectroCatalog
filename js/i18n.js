(function () {
  const LANGUAGE_STORAGE_KEY = "electroCatalog.language";
  const THEME_STORAGE_KEY = "electroCatalog.theme";
  const USD_TO_UAH_RATE = 40;

  const translations = {
    en: {
      titles: {
        catalog: "ElectroCatalog",
        login: "Login | ElectroCatalog",
        register: "Register | ElectroCatalog",
        admin: "Admin Panel | ElectroCatalog",
        product: "Product Details | ElectroCatalog"
      },
      roles: {
        admin: "admin",
        user: "user"
      },
      common: {
        brandSubtitle: "Electronic product catalog",
        login: "Login",
        register: "Register",
        logout: "Logout",
        loginField: "Login",
        password: "Password",
        name: "Name",
        description: "Description",
        specifications: "Specifications",
        price: "Price",
        manufacturer: "Manufacturer",
        color: "Color",
        category: "Category",
        subcategory: "Subcategory",
        parentCategory: "Parent category",
        uploadImage: "Upload image",
        saveProduct: "Save product",
        saveCategory: "Save category",
        cancel: "Cancel",
        edit: "Edit",
        delete: "Delete",
        details: "Details",
        buy: "Buy",
        reviews: "Reviews",
        rating: "Rating",
        comment: "Comment",
        date: "Date",
        submitReview: "Submit review",
        adminPanel: "Admin panel",
        backToCatalog: "Back to catalog",
        goToLogin: "Go to login",
        noParentCategory: "No parent category",
        selectCategory: "Select category",
        allCategories: "All categories",
        allSubcategories: "All subcategories",
        allManufacturers: "All manufacturers",
        minPrice: "Min price",
        maxPrice: "Max price",
        minPricePlaceholder: "0",
        maxPricePlaceholder: "No limit",
        searchByName: "Search by name",
        searchPlaceholder: "Start typing a product name",
        productIdLabel: "Product ID {id}",
        parentLabel: "Parent: {name}",
        topLevelCategory: "Top-level category",
        lightTheme: "Light",
        darkTheme: "Dark"
      },
      catalog: {
        heroEyebrow: "Smart shopping starts here",
        heroTitle: "Find electronics by category, brand, and price in seconds.",
        heroText: "Browse the catalog as a guest, sign in to keep your account, or manage the inventory as an admin.",
        statsProducts: "Products",
        statsCategories: "Categories",
        statsBrands: "Brands",
        toolsEyebrow: "Catalog tools",
        toolsTitle: "Search and filters",
        resetFilters: "Reset filters",
        emptyTitle: "No products match these filters",
        emptyText: "Try changing the category, price range, or search text."
      },
      productPage: {
        detailsEyebrow: "Product details",
        galleryEyebrow: "Product gallery",
        galleryTitle: "More photos",
        colorsEyebrow: "Choose a color",
        colorsTitle: "Available colors",
        reviewsEyebrow: "Customer feedback",
        reviewsTitle: "Reviews",
        addReviewTitle: "Add review",
        specificationsEyebrow: "Technical details",
        fullDescription: "Full description",
        noSpecifications: "Specifications are not available yet.",
        defaultColor: "Default color",
        noReviews: "No reviews yet for this product.",
        loginToReview: "Log in to leave a review",
        loginToBuy: "Please log in to buy this product",
        orderCreated: "Order created successfully",
        checkoutEyebrow: "Checkout",
        checkoutTitle: "Order checkout",
        deliveryEyebrow: "Delivery",
        deliveryTitle: "Delivery details",
        paymentEyebrow: "Payment",
        paymentTitle: "Card details",
        fullName: "Full name",
        phone: "Phone",
        email: "Email",
        city: "City",
        address: "Address",
        postalCode: "Postal code",
        deliveryNotes: "Delivery notes",
        cardHolder: "Card holder",
        cardNumber: "Card number",
        cardExpiry: "Expiry date",
        cardCvv: "CVV",
        confirmOrder: "Confirm order",
        checkoutRequired: "Please fill in all required checkout fields.",
        checkoutEmailError: "Please enter a valid email address.",
        checkoutCardError: "Please enter a valid card number.",
        checkoutExpiryError: "Please enter a valid expiry date in MM/YY format.",
        checkoutCvvError: "Please enter a valid CVV.",
        reviewSuccess: "Review added successfully.",
        notFound: "Product not found",
        notFoundText: "The requested product could not be found or may have been removed."
      },
      auth: {
        welcomeBack: "Welcome back",
        loginTitle: "Login",
        loginInfo: "Use your account to continue. Admin demo:",
        noAccountYet: "No account yet?",
        registerHere: "Register here",
        createAccount: "Create an account",
        registerTitle: "Register",
        registerInfo: "Registered users can browse the same catalog as guests and keep an account for future features.",
        haveAccount: "Already have an account?",
        loginHere: "Login here",
        invalidCredentials: "Invalid login or password.",
        loginSuccess: "Login successful. Redirecting...",
        userExists: "A user with this login already exists.",
        registerSuccess: "Registration successful. Redirecting..."
      },
      admin: {
        brandSubtitle: "Admin panel",
        accessDeniedTitle: "Admin access required",
        accessDeniedText: "You need to log in with an administrator account to manage products and categories.",
        headingEyebrow: "Administration",
        headingTitle: "Catalog management",
        productsEyebrow: "Products",
        categoriesEyebrow: "Categories",
        inventoryEyebrow: "Inventory",
        structureEyebrow: "Structure",
        productsList: "Products list",
        categoriesList: "Categories list",
        addProduct: "Add product",
        editProduct: "Edit product",
        addCategory: "Add category",
        editCategory: "Edit category",
        noProductsYet: "No products yet",
        addFirstProduct: "Add the first product using the form above.",
        noCategoriesYet: "No categories yet",
        addFirstCategory: "Add the first category using the form above.",
        selectCategoryError: "Please select a category.",
        productUpdated: "Product updated successfully.",
        productAdded: "Product added successfully.",
        categoryLoopError: "A category cannot be moved inside its own child category.",
        categoryUpdated: "Category updated successfully.",
        categoryAdded: "Category added successfully.",
        editingSelectedProduct: "Editing selected product.",
        editingSelectedCategory: "Editing selected category.",
        deleteCategoryBlocked: "This category cannot be deleted while it still has subcategories or products.",
        imageHint: "Choose an image from your device. If you skip it, a placeholder image will be used.",
        currentImageKept: "Current image is kept until you upload a new one.",
        selectedFile: "Selected file: {name}",
        imageReadError: "The image could not be loaded. Please choose another file.",
        imageTypeError: "Please choose a valid image file.",
        allowImageExpand: "Show full image on hover if needed",
        imagePositionX: "Horizontal position",
        imagePositionY: "Vertical position",
        cropPreviewHint: "Preview shows how the image will be cropped inside the product card.",
        galleryImages: "Gallery images",
        galleryHint: "Add extra photos for the product details page gallery.",
        galleryLoaded: "Current gallery images are loaded.",
        gallerySelected: "{count} gallery image(s) selected.",
        specificationsHint: "Add one characteristic per line, for example: Display: 6.7-inch OLED",
        specificationsPlaceholder: "Display: 6.7-inch OLED\nProcessor: Snapdragon 8 Gen 3\nBattery: 5000 mAh",
        colorVariantsEyebrow: "Color variants",
        colorVariantsTitle: "Colors and galleries",
        colorVariantsHint: "Each color can have its own gallery. The default color is used as the main card photo.",
        addColorVariant: "Add color",
        colorName: "Color name",
        colorHex: "Color swatch",
        saveColorVariant: "Save color",
        removeColorVariant: "Remove color",
        noColorVariants: "No color variants added yet.",
        useAsDefaultColor: "Use as main color",
        colorGalleryHint: "Upload gallery images for this color.",
        colorGalleryLoaded: "Current images for this color are loaded.",
        colorGallerySelected: "{count} image(s) selected for this color.",
        colorVariantSaved: "Color settings saved.",
        variantPrimaryHint: "Click a preview image to make it the first photo for this color."
      }
    },
    uk: {
      titles: {
        catalog: "ElectroCatalog",
        login: "Вхід | ElectroCatalog",
        register: "Реєстрація | ElectroCatalog",
        admin: "Адмін-панель | ElectroCatalog",
        product: "Деталі товару | ElectroCatalog"
      },
      roles: {
        admin: "адмін",
        user: "користувач"
      },
      common: {
        brandSubtitle: "Каталог електронних товарів",
        login: "Увійти",
        register: "Зареєструватися",
        logout: "Вийти",
        loginField: "Логін",
        password: "Пароль",
        name: "Назва",
        description: "Опис",
        specifications: "Характеристики",
        price: "Ціна",
        manufacturer: "Виробник",
        color: "Колір",
        category: "Категорія",
        subcategory: "Підкатегорія",
        parentCategory: "Батьківська категорія",
        uploadImage: "Завантажити зображення",
        saveProduct: "Зберегти товар",
        saveCategory: "Зберегти категорію",
        cancel: "Скасувати",
        edit: "Редагувати",
        delete: "Видалити",
        details: "Детальніше",
        buy: "Купити",
        reviews: "Відгуки",
        rating: "Оцінка",
        comment: "Коментар",
        date: "Дата",
        submitReview: "Додати відгук",
        adminPanel: "Адмін-панель",
        backToCatalog: "Назад до каталогу",
        goToLogin: "Перейти до входу",
        noParentCategory: "Без батьківської категорії",
        selectCategory: "Оберіть категорію",
        allCategories: "Усі категорії",
        allSubcategories: "Усі підкатегорії",
        allManufacturers: "Усі виробники",
        minPrice: "Мін. ціна",
        maxPrice: "Макс. ціна",
        minPricePlaceholder: "0",
        maxPricePlaceholder: "Без ліміту",
        searchByName: "Пошук за назвою",
        searchPlaceholder: "Почніть вводити назву товару",
        productIdLabel: "ID товару {id}",
        parentLabel: "Батьківська: {name}",
        topLevelCategory: "Категорія верхнього рівня",
        lightTheme: "Світла",
        darkTheme: "Темна"
      },
      catalog: {
        heroEyebrow: "Зручний вибір починається тут",
        heroTitle: "Знаходьте електроніку за категорією, брендом і ціною за лічені секунди.",
        heroText: "Переглядайте каталог як гість, входьте у свій обліковий запис або керуйте товарами як адміністратор.",
        statsProducts: "Товари",
        statsCategories: "Категорії",
        statsBrands: "Бренди",
        toolsEyebrow: "Інструменти каталогу",
        toolsTitle: "Пошук і фільтри",
        resetFilters: "Скинути фільтри",
        emptyTitle: "За цими фільтрами товари не знайдено",
        emptyText: "Спробуйте змінити категорію, діапазон ціни або текст пошуку."
      },
      productPage: {
        detailsEyebrow: "Деталі товару",
        galleryEyebrow: "Галерея товару",
        galleryTitle: "Додаткові фото",
        colorsEyebrow: "Оберіть колір",
        colorsTitle: "Доступні кольори",
        reviewsEyebrow: "Відгуки покупців",
        reviewsTitle: "Відгуки",
        addReviewTitle: "Додати відгук",
        specificationsEyebrow: "Технічні деталі",
        fullDescription: "Повний опис",
        noSpecifications: "Характеристики ще не додано.",
        defaultColor: "Основний колір",
        noReviews: "Для цього товару ще немає відгуків.",
        loginToReview: "Увійдіть, щоб залишити відгук",
        loginToBuy: "Будь ласка, увійдіть, щоб купити цей товар",
        orderCreated: "Замовлення успішно створено",
        checkoutEyebrow: "Оформлення",
        checkoutTitle: "Оформлення замовлення",
        deliveryEyebrow: "Доставка",
        deliveryTitle: "Дані для доставки",
        paymentEyebrow: "Оплата",
        paymentTitle: "Дані картки",
        fullName: "ПІБ",
        phone: "Телефон",
        email: "Email",
        city: "Місто",
        address: "Адреса",
        postalCode: "Поштовий індекс",
        deliveryNotes: "Коментар до доставки",
        cardHolder: "Власник картки",
        cardNumber: "Номер картки",
        cardExpiry: "Термін дії",
        cardCvv: "CVV",
        confirmOrder: "Підтвердити замовлення",
        checkoutRequired: "Будь ласка, заповніть усі обов'язкові поля.",
        checkoutEmailError: "Будь ласка, введіть коректну email-адресу.",
        checkoutCardError: "Будь ласка, введіть коректний номер картки.",
        checkoutExpiryError: "Будь ласка, введіть коректний термін дії у форматі MM/YY.",
        checkoutCvvError: "Будь ласка, введіть коректний CVV.",
        reviewSuccess: "Відгук успішно додано.",
        notFound: "Товар не знайдено",
        notFoundText: "Запитаний товар не знайдено або його було видалено."
      },
      auth: {
        welcomeBack: "З поверненням",
        loginTitle: "Вхід",
        loginInfo: "Увійдіть у свій обліковий запис. Демодоступ адміна:",
        noAccountYet: "Ще немає акаунта?",
        registerHere: "Зареєструватися",
        createAccount: "Створіть акаунт",
        registerTitle: "Реєстрація",
        registerInfo: "Зареєстровані користувачі можуть переглядати той самий каталог, що й гості, і мати свій обліковий запис для майбутніх можливостей.",
        haveAccount: "Вже маєте акаунт?",
        loginHere: "Увійти тут",
        invalidCredentials: "Неправильний логін або пароль.",
        loginSuccess: "Вхід успішний. Перенаправлення...",
        userExists: "Користувач з таким логіном уже існує.",
        registerSuccess: "Реєстрація успішна. Перенаправлення..."
      },
      admin: {
        brandSubtitle: "Адмін-панель",
        accessDeniedTitle: "Потрібен доступ адміністратора",
        accessDeniedText: "Щоб керувати товарами та категоріями, потрібно увійти під обліковим записом адміністратора.",
        headingEyebrow: "Адміністрування",
        headingTitle: "Керування каталогом",
        productsEyebrow: "Товари",
        categoriesEyebrow: "Категорії",
        inventoryEyebrow: "Асортимент",
        structureEyebrow: "Структура",
        productsList: "Список товарів",
        categoriesList: "Список категорій",
        addProduct: "Додати товар",
        editProduct: "Редагувати товар",
        addCategory: "Додати категорію",
        editCategory: "Редагувати категорію",
        noProductsYet: "Товарів ще немає",
        addFirstProduct: "Додайте перший товар через форму вище.",
        noCategoriesYet: "Категорій ще немає",
        addFirstCategory: "Додайте першу категорію через форму вище.",
        selectCategoryError: "Будь ласка, оберіть категорію.",
        productUpdated: "Товар успішно оновлено.",
        productAdded: "Товар успішно додано.",
        categoryLoopError: "Категорію не можна перемістити всередину власної дочірньої категорії.",
        categoryUpdated: "Категорію успішно оновлено.",
        categoryAdded: "Категорію успішно додано.",
        editingSelectedProduct: "Редагування вибраного товару.",
        editingSelectedCategory: "Редагування вибраної категорії.",
        deleteCategoryBlocked: "Цю категорію не можна видалити, поки в ній є підкатегорії або товари.",
        imageHint: "Оберіть зображення з вашого пристрою. Якщо пропустити цей крок, буде використано зображення-заглушку.",
        currentImageKept: "Поточне зображення збережеться, доки ви не завантажите нове.",
        selectedFile: "Вибраний файл: {name}",
        imageReadError: "Не вдалося завантажити зображення. Будь ласка, оберіть інший файл.",
        imageTypeError: "Будь ласка, оберіть коректний файл зображення.",
        allowImageExpand: "Показувати повне фото при наведенні, якщо це потрібно",
        imagePositionX: "Горизонтальна позиція",
        imagePositionY: "Вертикальна позиція",
        cropPreviewHint: "Прев’ю показує, як саме зображення буде обрізано в картці товару.",
        galleryImages: "Фото для галереї",
        galleryHint: "Додайте додаткові фото для галереї на сторінці товару.",
        galleryLoaded: "Поточні фото галереї завантажено.",
        gallerySelected: "Вибрано фото для галереї: {count}.",
        specificationsHint: "Додавайте по одній характеристиці в кожному рядку, наприклад: Екран: 6.7\" OLED",
        specificationsPlaceholder: "Екран: 6.7\" OLED\nПроцесор: Snapdragon 8 Gen 3\nАкумулятор: 5000 мАг",
        colorVariantsEyebrow: "Варіанти кольору",
        colorVariantsTitle: "Кольори та галереї",
        colorVariantsHint: "Кожен колір може мати власну галерею. Основний колір використовується для картки в каталозі.",
        addColorVariant: "Додати колір",
        colorName: "Назва кольору",
        colorHex: "Зразок кольору",
        saveColorVariant: "Зберегти колір",
        removeColorVariant: "Видалити колір",
        noColorVariants: "Варіанти кольору ще не додано.",
        useAsDefaultColor: "Використати як основний колір",
        colorGalleryHint: "Завантажте фото галереї для цього кольору.",
        colorGalleryLoaded: "Поточні фото для цього кольору завантажено.",
        colorGallerySelected: "Вибрано фото для цього кольору: {count}.",
        colorVariantSaved: "Налаштування кольору збережено.",
        variantPrimaryHint: "Натисніть на прев’ю, щоб зробити це фото першим для цього кольору."
      }
    }
  };

  const categoryTranslations = {
    uk: {
      1: "Смартфони",
      2: "Ноутбуки",
      3: "Аудіо",
      4: "Android-смартфони",
      5: "iPhone",
      6: "Ультрабуки",
      7: "Ігрові ноутбуки",
      8: "Навушники",
      9: "Розумні колонки"
    }
  };

  const productTranslations = {
    uk: {
      1: {
        description: "Швидкий Android-смартфон із яскравим OLED-дисплеєм, AI-інструментами камери та батареєю на два дні."
      },
      2: {
        description: "Преміальний смартфон із потужним чипом, кінематографічним режимом камери та легким алюмінієвим корпусом."
      },
      3: {
        description: "Тонкий ультрабук для навчання й роботи з чітким 14-дюймовим дисплеєм, тихим охолодженням і автономністю на весь день."
      },
      4: {
        description: "Ігровий ноутбук із дисплеєм високої частоти, дискретною графікою та просунутою системою охолодження."
      },
      5: {
        description: "Бездротові повнорозмірні навушники з активним шумозаглушенням, насиченими басами та компактним чохлом для подорожей."
      },
      6: {
        description: "Компактна розумна колонка з підтримкою голосового помічника, об'ємним звуком і зручним керуванням домом."
      },
      7: {
        description: "Флагманський Android-смартфон із яскравим AMOLED-екраном, просунутою камерою з зумом, преміальним корпусом і розумними функціями для продуктивності."
      },
      8: {
        description: "Збалансований Android-смартфон середнього класу з чистою оболонкою, OLED-дисплеєм, надійною батареєю та швидкою зарядкою для щоденного використання."
      },
      9: {
        description: "Тонкий і тихий ноутбук із яскравим дисплеєм, енергоефективною продуктивністю, довгою автономністю та преміальною мобільністю для навчання й роботи."
      },
      10: {
        description: "Потужний ігровий ноутбук із продуктивною графікою, швидкою пам'яттю DDR5, чітким дисплеєм і ефективним охолодженням для сучасних AAA-ігор."
      },
      11: {
        description: "Преміальні бездротові навушники з деталізованим звучанням, ефективним ANC, зручними амбушурами та широкою сумісністю для музики й дзвінків."
      },
      12: {
        description: "Компактна розумна колонка зі збалансованим звуком, зручним голосовим керуванням, підтримкою мультируму та стильним дизайном для сучасного інтер'єру."
      }
    }
  };

  function getLanguage() {
    const lang = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return translations[lang] ? lang : "uk";
  }

  function setLanguage(language) {
    if (translations[language]) {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    }
  }

  function getTheme() {
    const theme = localStorage.getItem(THEME_STORAGE_KEY);
    return theme === "dark" ? "dark" : "light";
  }

  function setTheme(theme) {
    localStorage.setItem(THEME_STORAGE_KEY, theme === "dark" ? "dark" : "light");
  }

  function applyTheme() {
    if (!document.body) {
      return;
    }

    document.body.setAttribute("data-theme", getTheme());
  }

  function getNestedValue(source, key) {
    return key.split(".").reduce((result, segment) => {
      return result && typeof result === "object" ? result[segment] : undefined;
    }, source);
  }

  function t(key, params) {
    const language = getLanguage();
    const template = getNestedValue(translations[language], key) ?? getNestedValue(translations.en, key) ?? key;

    return String(template).replace(/\{(\w+)\}/g, (_, paramKey) => {
      return params && paramKey in params ? params[paramKey] : `{${paramKey}}`;
    });
  }

  function applyTranslations(root) {
    const scope = root || document;
    document.documentElement.lang = getLanguage();

    scope.querySelectorAll("[data-i18n]").forEach((element) => {
      element.textContent = t(element.dataset.i18n);
    });

    scope.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
      element.setAttribute("placeholder", t(element.dataset.i18nPlaceholder));
    });

    if (document.body && document.body.dataset.titleKey) {
      document.title = t(document.body.dataset.titleKey);
    }
  }

  function translateCategoryName(category) {
    if (!category) {
      return "";
    }

    return categoryTranslations[getLanguage()]?.[category.id] || category.name;
  }

  function getCategoryPath(categoryId) {
    const categories = Store.getCategories();
    const path = [];
    let current = categories.find((category) => category.id === Number(categoryId)) || null;

    while (current) {
      path.unshift(translateCategoryName(current));
      current = categories.find((category) => category.id === current.parentId) || null;
    }

    return path.join(" / ");
  }

  function translateProductName(product) {
    return productTranslations[getLanguage()]?.[product.id]?.name || product.name;
  }

  function translateProductDescription(product) {
    return productTranslations[getLanguage()]?.[product.id]?.description || product.description;
  }

  function roleLabel(role) {
    return t(`roles.${role}`);
  }

  function getCurrencySettings() {
    if (getLanguage() === "uk") {
      return {
        locale: "uk-UA",
        currency: "UAH",
        rate: USD_TO_UAH_RATE
      };
    }

    return {
      locale: "en-US",
      currency: "USD",
      rate: 1
    };
  }

  function toDisplayPriceValue(baseUsdPrice) {
    const { rate } = getCurrencySettings();
    return Math.round(Number(baseUsdPrice || 0) * rate * 100) / 100;
  }

  function fromDisplayPriceValue(displayPrice) {
    const { rate } = getCurrencySettings();
    return Math.round((Number(displayPrice || 0) / rate) * 100) / 100;
  }

  function formatPrice(baseUsdPrice) {
    const settings = getCurrencySettings();
    return new Intl.NumberFormat(settings.locale, {
      style: "currency",
      currency: settings.currency,
      maximumFractionDigits: 0
    }).format(toDisplayPriceValue(baseUsdPrice));
  }

  function pluralizeUk(count, forms) {
    const mod10 = count % 10;
    const mod100 = count % 100;

    if (mod10 === 1 && mod100 !== 11) {
      return forms[0];
    }

    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
      return forms[1];
    }

    return forms[2];
  }

  function formatResultsCount(count) {
    if (getLanguage() === "uk") {
      return `${count} ${pluralizeUk(count, ["товар", "товари", "товарів"])} знайдено`;
    }

    return `${count} product${count === 1 ? "" : "s"} found`;
  }

  function formatUserLabel(user) {
    return `${user.login} (${roleLabel(user.role)})`;
  }

  if (document.body) {
    applyTheme();
  }

  window.I18n = {
    getLanguage,
    setLanguage,
    getTheme,
    setTheme,
    applyTheme,
    t,
    applyTranslations,
    translateCategoryName,
    getCategoryPath,
    translateProductName,
    translateProductDescription,
    roleLabel,
    formatPrice,
    formatResultsCount,
    formatUserLabel,
    toDisplayPriceValue,
    fromDisplayPriceValue
  };
})();
