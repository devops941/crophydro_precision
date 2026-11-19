/**
 * Crop Hydro-Precision — UI Utilities
 * - Theme toggle (light/dark with system preference fallback)
 * - Dynamic navbar state (logged in vs logged out)
 * - Accessible Toast notifications
 * - Number count-up animation
 * - Modal confirmation dialogs
 * - Button loading states
 */

import { isAuthenticated, getUser, logout, getInitials } from "./auth.js";
import { formatNumber } from "./i18n.js";

const THEME_KEY = "crop_hydro_theme";

/**
 * Initialize theme (light / dark)
 */
export function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  const systemPrefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const currentTheme = savedTheme || (systemPrefersDark ? "dark" : "light");

  applyTheme(currentTheme);

  const themeBtn = document.getElementById("theme-toggle-btn");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const active = document.documentElement.getAttribute("data-theme") || "light";
      const next = active === "dark" ? "light" : "dark";
      applyTheme(next);
      localStorage.setItem(THEME_KEY, next);
    });
  }

  // Listen for system theme changes if user hasn't set an explicit preference
  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      if (!localStorage.getItem(THEME_KEY)) {
        applyTheme(e.matches ? "dark" : "light");
      }
    });
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const themeBtn = document.getElementById("theme-toggle-btn");
  if (!themeBtn) return;

  const sunIcon = themeBtn.querySelector(".icon-sun");
  const moonIcon = themeBtn.querySelector(".icon-moon");

  if (sunIcon && moonIcon) {
    if (theme === "dark") {
      sunIcon.classList.remove("hidden");
      moonIcon.classList.add("hidden");
    } else {
      sunIcon.classList.add("hidden");
      moonIcon.classList.remove("hidden");
    }
  }
}

/**
 * Initialize Navbar links & user session display
 */
export function initNavbar() {
  const loggedIn = isAuthenticated();
  const user = getUser();

  const authLinks = document.querySelectorAll(".nav-auth-only");
  const guestLinks = document.querySelectorAll(".nav-guest-only");
  const userInitialsEl = document.getElementById("nav-user-initials");
  const userNameEl = document.getElementById("nav-user-name");
  const logoutBtn = document.getElementById("nav-logout-btn");

  authLinks.forEach((el) => {
    el.classList.toggle("hidden", !loggedIn);
  });

  guestLinks.forEach((el) => {
    el.classList.toggle("hidden", loggedIn);
  });

  if (loggedIn && user) {
    if (userInitialsEl) {
      userInitialsEl.textContent = getInitials(user.full_name);
    }
    if (userNameEl) {
      userNameEl.textContent = user.full_name;
    }
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  }

  // Mobile menu toggle if present
  const mobileToggle = document.getElementById("mobile-menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });
  }
}

/**
 * Show a toast notification
 * @param {string} message - Text to display
 * @param {"success"|"error"|"info"} type
 * @param {number} duration - Milliseconds before auto-dismiss
 */
export function showToast(message, type = "info", duration = 4000) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.setAttribute("role", "alert");

  let iconSvg = "";
  if (type === "success") {
    iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>`;
  } else if (type === "error") {
    iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
  } else {
    iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
  }

  toast.innerHTML = `
    <span class="toast-icon">${iconSvg}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" aria-label="Close notification">&times;</button>
  `;

  const closeBtn = toast.querySelector(".toast-close");
  const dismiss = () => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(8px)";
    setTimeout(() => {
      toast.remove();
    }, 250);
  };

  closeBtn.addEventListener("click", dismiss);
  container.appendChild(toast);

  if (duration > 0) {
    setTimeout(dismiss, duration);
  }
}

/**
 * Animate numbers counting up smoothly
 * @param {HTMLElement} element - Target element
 * @param {number} endVal - Target number
 * @param {number} duration - Milliseconds
 * @param {number} decimals - Precision
 * @param {string} suffix - e.g. " mm" or " L"
 */
export function animateCountUp(element, endVal, duration = 1000, decimals = 0, suffix = "") {
  if (!element) return;

  // Immediate update if user prefers reduced motion
  const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced || duration <= 0) {
    element.textContent = `${formatNumber(endVal, decimals)}${suffix}`;
    return;
  }

  const startTime = performance.now();
  const startVal = 0;

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease out cubic
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const currentVal = startVal + (endVal - startVal) * easeProgress;

    element.textContent = `${formatNumber(currentVal, decimals)}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = `${formatNumber(endVal, decimals)}${suffix}`;
    }
  }

  requestAnimationFrame(update);
}

/**
 * Toggle button loading spinner
 */
export function setButtonLoading(button, isLoading) {
  if (!button) return;
  button.disabled = isLoading;
  button.classList.toggle("loading", isLoading);

  if (isLoading) {
    if (!button.querySelector(".spinner")) {
      const spinner = document.createElement("span");
      spinner.className = "spinner";
      button.appendChild(spinner);
    }
  } else {
    const spinner = button.querySelector(".spinner");
    if (spinner) spinner.remove();
  }
}

/**
 * Confirmation Modal Dialog
 */
export function showConfirmModal({
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDanger = false,
  onConfirm,
}) {
  let modalBackdrop = document.getElementById("global-confirm-modal");
  if (!modalBackdrop) {
    modalBackdrop = document.createElement("div");
    modalBackdrop.id = "global-confirm-modal";
    modalBackdrop.className = "modal-backdrop";
    modalBackdrop.innerHTML = `
      <div class="modal-dialog" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h4 class="modal-title"></h4>
          <button class="btn btn-ghost btn-sm modal-close" aria-label="Close dialog">&times;</button>
        </div>
        <div class="modal-body">
          <p class="modal-message"></p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary modal-cancel"></button>
          <button class="btn modal-confirm"></button>
        </div>
      </div>
    `;
    document.body.appendChild(modalBackdrop);
  }

  const titleEl = modalBackdrop.querySelector(".modal-title");
  const msgEl = modalBackdrop.querySelector(".modal-message");
  const cancelBtn = modalBackdrop.querySelector(".modal-cancel");
  const confirmBtn = modalBackdrop.querySelector(".modal-confirm");
  const closeBtn = modalBackdrop.querySelector(".modal-close");

  titleEl.textContent = title;
  msgEl.textContent = message;
  cancelBtn.textContent = cancelText;
  confirmBtn.textContent = confirmText;

  confirmBtn.className = isDanger ? "btn btn-danger" : "btn btn-primary";

  const close = () => {
    modalBackdrop.classList.remove("show");
  };

  cancelBtn.onclick = close;
  closeBtn.onclick = close;

  confirmBtn.onclick = async () => {
    close();
    if (typeof onConfirm === "function") {
      await onConfirm();
    }
  };

  modalBackdrop.classList.add("show");
}
