(function () {
  function buildThemeSwitcher() {
    const theme = I18n.getTheme();

    return `
      <div class="theme-switcher">
        <button class="theme-button ${theme === "light" ? "active" : ""}" type="button" data-set-theme="light">${I18n.t("common.lightTheme")}</button>
        <button class="theme-button ${theme === "dark" ? "active" : ""}" type="button" data-set-theme="dark">${I18n.t("common.darkTheme")}</button>
      </div>
    `;
  }

  function buildLanguageSwitcher() {
    const language = I18n.getLanguage();

    return `
      <div class="language-switcher">
        <button class="lang-button ${language === "uk" ? "active" : ""}" type="button" data-set-language="uk">UKR</button>
        <button class="lang-button ${language === "en" ? "active" : ""}" type="button" data-set-language="en">ENG</button>
      </div>
    `;
  }

  function buildPreferenceControls() {
    return `
      <div class="header-preferences">
        ${buildLanguageSwitcher()}
        ${buildThemeSwitcher()}
      </div>
    `;
  }

  function renderAuthActions() {
    const containers = document.querySelectorAll("[data-auth-actions]");
    const currentUser = Store.getCurrentUser();

    containers.forEach((container) => {
      if (!currentUser) {
        container.innerHTML = `
          ${buildPreferenceControls()}
          <a class="button secondary" href="login.html">${I18n.t("common.login")}</a>
          <a class="button primary" href="register.html">${I18n.t("common.register")}</a>
        `;
        return;
      }

      container.innerHTML = `
        ${buildPreferenceControls()}
        <span class="user-chip">${I18n.formatUserLabel(currentUser)}</span>
        ${currentUser.role === "admin" ? `<a class="button secondary" href="admin.html">${I18n.t("common.adminPanel")}</a>` : ""}
        <button class="button primary" type="button" data-logout-button>${I18n.t("common.logout")}</button>
      `;
    });

    document.querySelectorAll("[data-set-language]").forEach((button) => {
      button.addEventListener("click", () => {
        I18n.setLanguage(button.getAttribute("data-set-language"));
        window.location.reload();
      });
    });

    document.querySelectorAll("[data-set-theme]").forEach((button) => {
      button.addEventListener("click", () => {
        I18n.setTheme(button.getAttribute("data-set-theme"));
        I18n.applyTheme();
        renderAuthActions();
      });
    });

    document.querySelectorAll("[data-logout-button]").forEach((button) => {
      button.addEventListener("click", () => {
        Store.clearCurrentUser();
        window.location.href = "index.html";
      });
    });
  }

  function setMessage(element, message, type) {
    if (!element) {
      return;
    }

    element.textContent = message;
    element.className = `form-message ${type || ""}`.trim();
  }

  function setupLoginPage() {
    const form = document.getElementById("loginForm");
    if (!form) {
      return;
    }

    const message = document.getElementById("loginMessage");

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const login = document.getElementById("loginValue").value.trim();
      const password = document.getElementById("passwordValue").value;
      const users = Store.getUsers();
      const matchedUser = users.find(
        (user) => user.login.toLowerCase() === login.toLowerCase() && user.password === password
      );

      if (!matchedUser) {
        setMessage(message, I18n.t("auth.invalidCredentials"), "error");
        return;
      }

      Store.setCurrentUser(matchedUser);
      setMessage(message, I18n.t("auth.loginSuccess"), "success");
      renderAuthActions();

      window.setTimeout(() => {
        window.location.href = matchedUser.role === "admin" ? "admin.html" : "index.html";
      }, 500);
    });
  }

  function setupRegisterPage() {
    const form = document.getElementById("registerForm");
    if (!form) {
      return;
    }

    const message = document.getElementById("registerMessage");

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const login = document.getElementById("registerLogin").value.trim();
      const password = document.getElementById("registerPassword").value;
      const users = Store.getUsers();
      const loginExists = users.some((user) => user.login.toLowerCase() === login.toLowerCase());

      if (loginExists) {
        setMessage(message, I18n.t("auth.userExists"), "error");
        return;
      }

      const newUser = {
        id: Store.generateId(users),
        login,
        password,
        role: "user"
      };

      users.push(newUser);
      Store.saveUsers(users);
      Store.setCurrentUser(newUser);
      setMessage(message, I18n.t("auth.registerSuccess"), "success");
      renderAuthActions();

      window.setTimeout(() => {
        window.location.href = "index.html";
      }, 500);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    Store.initData();
    I18n.applyTheme();
    I18n.applyTranslations();
    renderAuthActions();
    setupLoginPage();
    setupRegisterPage();
  });

  window.renderAuthActions = renderAuthActions;
})();
