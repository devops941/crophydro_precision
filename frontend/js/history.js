/**
 * Crop Hydro-Precision — Calculation History Controller
 * - 30-day water consumption trend chart (Chart.js)
 * - Paginated calculation records table
 * - Responsive table -> card layout
 * - Detail view modal
 * - Delete calculation with confirmation dialog
 */

import { api } from "./api.js";
import { requireAuth } from "./auth.js";
import { getCurrentLang, translateStage, formatNumber, t } from "./i18n.js";
import { showToast, showConfirmModal } from "./ui.js";

// Ensure protected route
if (!requireAuth()) {
  // Redirect initiated
}

let currentPage = 1;
let totalPages = 1;
let historyChartInstance = null;

export async function initHistoryPage() {
  await loadHistoryChart();
  await loadHistoryTable(currentPage);
  setupPaginationEvents();
  setupModalEvents();

  // Handle language switch
  document.getElementById("lang-toggle-btn")?.addEventListener("click", () => {
    setTimeout(() => {
      loadHistoryTable(currentPage);
      loadHistoryChart();
    }, 50);
  });
}

/**
 * Load 30-day water usage line chart from GET /api/history/summary/
 */
async function loadHistoryChart() {
  const canvas = document.getElementById("history-trend-chart");
  if (!canvas || !window.Chart) return;

  try {
    const summary = await api("/history/summary/", { auth: true });
    const trendData = summary.last_30_days || [];

    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const textColor = isDark ? "#cbd5e1" : "#475569";
    const gridColor = isDark ? "#1e293b" : "#e2e8f0";

    const labels = trendData.map((d) => d.date);
    const litresValues = trendData.map((d) => d.litres);

    if (historyChartInstance) {
      historyChartInstance.destroy();
    }

    historyChartInstance = new window.Chart(canvas, {
      type: "line",
      data: {
        labels: labels.length > 0 ? labels : ["No data"],
        datasets: [
          {
            label: "Daily Water Volume (Litres)",
            data: litresValues.length > 0 ? litresValues : [0],
            borderColor: "#0284c7",
            backgroundColor: isDark ? "rgba(2, 132, 199, 0.15)" : "rgba(2, 132, 199, 0.1)",
            fill: true,
            tension: 0.3,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: "#0284c7",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: { color: textColor, font: { family: "Poppins", size: 12 } },
          },
          tooltip: {
            callbacks: {
              label: (item) => `${formatNumber(item.raw)} Litres`,
            },
          },
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: { color: textColor },
          },
          y: {
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              callback: (v) => `${(v / 1000).toFixed(0)}k L`,
            },
            min: 0,
          },
        },
      },
    });
  } catch (err) {
    console.warn("Could not load 30-day water consumption chart:", err);
  }
}

/**
 * Load paginated calculation records from GET /api/history/?page=N
 */
export async function loadHistoryTable(page = 1) {
  const tbody = document.getElementById("history-table-body");
  const emptyState = document.getElementById("history-empty-state");
  const tableWrapper = document.getElementById("history-table-wrapper");
  const paginationControls = document.getElementById("history-pagination");

  if (!tbody) return;

  try {
    const data = await api(`/history/?page=${page}`, { auth: true });
    currentPage = data.page;
    totalPages = data.pages;

    if (!data.results || data.results.length === 0) {
      if (emptyState) emptyState.classList.remove("hidden");
      if (tableWrapper) tableWrapper.classList.add("hidden");
      if (paginationControls) paginationControls.classList.add("hidden");
      return;
    }

    if (emptyState) emptyState.classList.add("hidden");
    if (tableWrapper) tableWrapper.classList.remove("hidden");
    if (paginationControls) paginationControls.classList.remove("hidden");

    const isTamil = getCurrentLang() === "ta";

    tbody.innerHTML = data.results.map((row) => {
      const cropName = isTamil ? row.crop.name_ta : row.crop.name_en;
      const stageName = translateStage(row.stage);
      const rowDate = row.created_at ? row.created_at.split("T")[0] : "—";

      return `
        <tr>
          <td><strong>${rowDate}</strong></td>
          <td>
            <div style="font-weight: 600;">${cropName}</div>
            <div style="font-size: var(--font-size-xs); color: var(--text-muted);">${row.method.name_en}</div>
          </td>
          <td>
            <span class="badge badge-stage-${row.stage}">${stageName}</span>
            <div style="font-size: var(--font-size-xs); color: var(--text-muted); margin-top: 4px;">Day ${row.days_after_sowing}</div>
          </td>
          <td>${row.area} ${row.area_unit}</td>
          <td>${row.et0}</td>
          <td><strong>${row.etc}</strong></td>
          <td>${row.gross_mm}</td>
          <td><strong style="color: var(--color-primary-700);">${formatNumber(row.litres)} L</strong></td>
          <td>
            <div style="display: flex; gap: var(--space-2);">
              <button class="btn btn-secondary btn-sm btn-view-calc" data-id="${row.id}" title="View Calculation">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                ${t("history_btn_view")}
              </button>
              <button class="btn btn-ghost btn-sm btn-delete-calc" data-id="${row.id}" style="color: var(--color-danger-600);" title="Delete Record">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");

    updatePaginationDisplay();
    attachRowActions();
  } catch (err) {
    showToast(err.message || "Failed to load calculation history.", "error");
  }
}

function updatePaginationDisplay() {
  const pageInfoEl = document.getElementById("pagination-page-info");
  const prevBtn = document.getElementById("pagination-prev-btn");
  const nextBtn = document.getElementById("pagination-next-btn");

  if (pageInfoEl) {
    pageInfoEl.textContent = `${t("history_prev")} (${currentPage} / ${totalPages})`;
  }

  if (prevBtn) prevBtn.disabled = currentPage <= 1;
  if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
}

function setupPaginationEvents() {
  const prevBtn = document.getElementById("pagination-prev-btn");
  const nextBtn = document.getElementById("pagination-next-btn");

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        loadHistoryTable(currentPage - 1);
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (currentPage < totalPages) {
        loadHistoryTable(currentPage + 1);
      }
    });
  }
}

/**
 * Wire row action buttons (View & Delete)
 */
function attachRowActions() {
  // View detail
  document.querySelectorAll(".btn-view-calc").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      openDetailModal(id);
    });
  });

  // Delete
  document.querySelectorAll(".btn-delete-calc").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      confirmDeleteCalc(id);
    });
  });
}

/**
 * Open detail inspection modal
 */
async function openDetailModal(id) {
  const modal = document.getElementById("history-detail-modal");
  const modalContent = document.getElementById("history-detail-content");
  if (!modal || !modalContent) return;

  modalContent.innerHTML = `<div class="skeleton-box skeleton" style="height: 200px;"></div>`;
  modal.classList.add("show");

  try {
    const data = await api(`/history/${id}/`, { auth: true });
    const inp = data.input;
    const res = data.result;
    const crop = data.crop;
    const method = data.method;
    const isTamil = getCurrentLang() === "ta";

    modalContent.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: var(--space-4);">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle); padding-bottom: var(--space-3);">
          <div>
            <h3 style="font-size: var(--font-size-xl);">${isTamil ? crop.name_ta : crop.name_en}</h3>
            <div style="font-size: var(--font-size-xs); color: var(--text-muted);">${inp.date} • ${inp.area} ${inp.area_unit} • ${method.name_en}</div>
          </div>
          <span class="badge badge-stage-${res.stage}">${translateStage(res.stage)} (Day ${inp.days_after_sowing})</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-3); background: var(--bg-surface-subtle); padding: var(--space-4); border-radius: var(--radius-md);">
          <div>
            <div style="font-size: var(--font-size-xs); color: var(--text-muted);">Weather</div>
            <strong>${inp.tmax}°C / ${inp.tmin}°C, ${inp.rain_mm} mm rain</strong>
          </div>
          <div>
            <div style="font-size: var(--font-size-xs); color: var(--text-muted);">Latitude</div>
            <strong>${inp.latitude}°N (J = ${res.day_of_year})</strong>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: var(--space-3);">
          <div class="card" style="padding: var(--space-3);">
            <div style="font-size: var(--font-size-xs); color: var(--text-muted);">ET₀</div>
            <div style="font-size: var(--font-size-lg); font-weight: 700; color: var(--color-water-600);">${res.et0} mm</div>
          </div>
          <div class="card" style="padding: var(--space-3);">
            <div style="font-size: var(--font-size-xs); color: var(--text-muted);">Kc</div>
            <div style="font-size: var(--font-size-lg); font-weight: 700; color: var(--color-primary-600);">${res.kc}</div>
          </div>
          <div class="card" style="padding: var(--space-3);">
            <div style="font-size: var(--font-size-xs); color: var(--text-muted);">ETc</div>
            <div style="font-size: var(--font-size-lg); font-weight: 700; color: var(--color-primary-700);">${res.etc} mm</div>
          </div>
          <div class="card" style="padding: var(--space-3);">
            <div style="font-size: var(--font-size-xs); color: var(--text-muted);">Net mm</div>
            <div style="font-size: var(--font-size-lg); font-weight: 700;">${res.net_mm} mm</div>
          </div>
          <div class="card" style="padding: var(--space-3);">
            <div style="font-size: var(--font-size-xs); color: var(--text-muted);">Gross mm</div>
            <div style="font-size: var(--font-size-lg); font-weight: 700;">${res.gross_mm} mm</div>
          </div>
          <div class="card" style="padding: var(--space-3); border: 2px solid var(--color-primary-400);">
            <div style="font-size: var(--font-size-xs); color: var(--color-primary-700); font-weight: 700;">Daily Volume</div>
            <div style="font-size: var(--font-size-lg); font-weight: 700; color: var(--color-primary-700);">${formatNumber(res.litres)} L</div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; font-size: var(--font-size-sm); padding-top: var(--space-2); border-top: 1px solid var(--border-subtle);">
          <span>Weekly Volume: <strong>${formatNumber(res.weekly_litres)} L</strong></span>
          <span>Pump Time: <strong>${res.pump_hours ? `${res.pump_hours} hrs` : 'N/A'}</strong></span>
        </div>
      </div>
    `;
  } catch (err) {
    modalContent.innerHTML = `<p style="color: var(--color-danger-600);">${err.message || "Failed to load details."}</p>`;
  }
}

function setupModalEvents() {
  const modal = document.getElementById("history-detail-modal");
  if (!modal) return;

  const closeBtns = modal.querySelectorAll(".detail-modal-close");
  closeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      modal.classList.remove("show");
    });
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("show");
    }
  });
}

/**
 * Confirm and execute deletion
 */
function confirmDeleteCalc(id) {
  showConfirmModal({
    title: t("history_delete_confirm_title"),
    message: t("history_delete_confirm_msg"),
    confirmText: t("history_btn_delete"),
    cancelText: "Cancel",
    isDanger: true,
    onConfirm: async () => {
      try {
        await api(`/history/${id}/`, {
          method: "DELETE",
          auth: true,
        });

        showToast("Calculation record deleted.", "success");
        await loadHistoryTable(currentPage);
        await loadHistoryChart();
      } catch (err) {
        showToast(err.message || "Failed to delete record.", "error");
      }
    },
  });
}
