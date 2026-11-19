/**
 * Crop Hydro-Precision — Farmer Profile Controller
 * - Loads current user profile from GET /api/auth/me/
 * - Updates full name via PATCH /api/auth/me/
 * - Changes password via POST /api/auth/change-password/
 * - Handles logout workflow
 */

import { api } from "./api.js";
import { requireAuth, getUser, setUser, logout, getInitials } from "./auth.js";
import { showToast, setButtonLoading, showConfirmModal } from "./ui.js";

// Ensure user is authenticated before executing profile logic
if (!requireAuth()) {
  // Redirect initiated by guard
}

export async function initProfilePage() {
  const nameInput = document.getElementById("profile-fullname");
  const emailInput = document.getElementById("profile-email");
  const memberSinceEl = document.getElementById("profile-member-since");
  const avatarInitialsEl = document.getElementById("profile-avatar-initials");
  const headerNameEl = document.getElementById("profile-header-name");
  const headerEmailEl = document.getElementById("profile-header-email");

  const nameForm = document.getElementById("profile-name-form");
  const nameSaveBtn = document.getElementById("profile-name-save-btn");
  const nameError = document.getElementById("profile-name-error");

  const pwdForm = document.getElementById("profile-pwd-form");
  const pwdSaveBtn = document.getElementById("profile-pwd-save-btn");
  const oldPwdInput = document.getElementById("profile-old-pwd");
  const newPwdInput = document.getElementById("profile-new-pwd");
  const oldPwdError = document.getElementById("profile-old-pwd-error");
  const newPwdError = document.getElementById("profile-new-pwd-error");
  const pwdGeneralError = document.getElementById("profile-pwd-general-error");

  const logoutBtn = document.getElementById("profile-page-logout-btn");

  // Load user data from server (fallback to local state)
  let currentUser = getUser();
  try {
    const data = await api("/auth/me/", { auth: true });
    currentUser = data.user;
    setUser(currentUser);
  } catch (err) {
    console.warn("Could not refresh user profile from server:", err);
  }

  // Populate UI
  if (currentUser) {
    if (nameInput) nameInput.value = currentUser.full_name || "";
    if (emailInput) emailInput.value = currentUser.email || "";
    if (headerNameEl) headerNameEl.textContent = currentUser.full_name || "";
    if (headerEmailEl) headerEmailEl.textContent = currentUser.email || "";
    if (avatarInitialsEl) avatarInitialsEl.textContent = getInitials(currentUser.full_name);

    if (memberSinceEl && currentUser.date_joined) {
      try {
        const joinDate = new Date(currentUser.date_joined);
        memberSinceEl.textContent = joinDate.toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      } catch (e) {
        memberSinceEl.textContent = currentUser.date_joined.split("T")[0];
      }
    }
  }

  // Handle Full Name Update
  if (nameForm) {
    nameForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (nameError) nameError.textContent = "";

      const updatedName = nameInput.value.trim();
      if (!updatedName) {
        if (nameError) nameError.textContent = "Full name cannot be empty.";
        nameInput.classList.add("has-error");
        return;
      }

      setButtonLoading(nameSaveBtn, true);

      try {
        const response = await api("/auth/me/", {
          method: "PATCH",
          body: { full_name: updatedName },
          auth: true,
        });

        setUser(response.user);
        if (headerNameEl) headerNameEl.textContent = response.user.full_name;
        if (avatarInitialsEl) avatarInitialsEl.textContent = getInitials(response.user.full_name);

        // Update navbar avatar if present
        const navInitials = document.getElementById("nav-user-initials");
        if (navInitials) navInitials.textContent = getInitials(response.user.full_name);

        showToast("Profile updated successfully!", "success");
      } catch (err) {
        if (err.details && err.details.full_name) {
          nameError.textContent = Array.isArray(err.details.full_name)
            ? err.details.full_name.join(" ")
            : err.details.full_name;
        } else {
          nameError.textContent = err.message || "Failed to update profile.";
        }
      } finally {
        setButtonLoading(nameSaveBtn, false);
      }
    });
  }

  // Handle Password Change
  if (pwdForm) {
    pwdForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (oldPwdError) oldPwdError.textContent = "";
      if (newPwdError) newPwdError.textContent = "";
      if (pwdGeneralError) pwdGeneralError.textContent = "";

      const oldPassword = oldPwdInput.value;
      const newPassword = newPwdInput.value;

      let hasError = false;
      if (!oldPassword) {
        if (oldPwdError) oldPwdError.textContent = "Current password is required.";
        oldPwdInput.classList.add("has-error");
        hasError = true;
      }
      if (!newPassword) {
        if (newPwdError) newPwdError.textContent = "New password is required.";
        newPwdInput.classList.add("has-error");
        hasError = true;
      } else if (newPassword.length < 8) {
        if (newPwdError) newPwdError.textContent = "New password must be at least 8 characters.";
        newPwdInput.classList.add("has-error");
        hasError = true;
      }

      if (hasError) return;

      setButtonLoading(pwdSaveBtn, true);

      try {
        await api("/auth/change-password/", {
          method: "POST",
          body: {
            old_password: oldPassword,
            new_password: newPassword,
          },
          auth: true,
        });

        oldPwdInput.value = "";
        newPwdInput.value = "";
        showToast("Password updated successfully!", "success");
      } catch (err) {
        if (err.details) {
          if (err.details.old_password && oldPwdError) {
            oldPwdError.textContent = Array.isArray(err.details.old_password)
              ? err.details.old_password.join(" ")
              : err.details.old_password;
          }
          if (err.details.new_password && newPwdError) {
            newPwdError.textContent = Array.isArray(err.details.new_password)
              ? err.details.new_password.join(" ")
              : err.details.new_password;
          }
        } else {
          if (pwdGeneralError) {
            pwdGeneralError.textContent = err.message || "Failed to update password.";
          }
        }
      } finally {
        setButtonLoading(pwdSaveBtn, false);
      }
    });
  }

  // Handle Logout Confirmation
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      showConfirmModal({
        title: "Confirm Log Out",
        message: "Are you sure you want to end your session on Crop Hydro-Precision?",
        confirmText: "Log Out",
        cancelText: "Cancel",
        isDanger: true,
        onConfirm: async () => {
          await logout();
        },
      });
    });
  }
}
