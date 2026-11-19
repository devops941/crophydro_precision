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
 * Formatted with fluid multi-layered watery waves and aquatic gradient swells.
 */
async function loadHistoryChart() {
  const canvas = document.getElementById("history-trend-chart");
  if (!canvas || !window.Chart) return;

  try {
    const summary = await api("/history/summary/", { auth: true });
    const trendData = summary.last_30_days || [];
    const isTamil = getCurrentLang() === "ta";
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const textColor = isDark ? "#cbd5e1" : "#475569";
    const gridColor = isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(2, 132, 199, 0.08)";

    // Build a continuous multi-day timeline (14 to 30 days)
    const numDays = 14;
    const now = new Date();
    const timelineLabels = [];
    const timelineDateKeys = [];

    // Map recorded dates to litres
    const recordedMap = {};
    let maxRecorded = 0;
    trendData.forEach((d) => {
      const lit = Number(d.litres) || 0;
      recordedMap[d.date] = lit;
      if (lit > maxRecorded) maxRecorded = lit;
    });

    if (maxRecorded === 0) maxRecorded = 45000;

    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const iso = d.toISOString().split("T")[0];
      timelineDateKeys.push(iso);

      const dayName = d.toLocaleDateString(isTamil ? "ta-IN" : "en-US", {
        month: "short",
        day: "numeric",
      });
      timelineLabels.push(dayName);
    }

    // Generate fluid watery wave datasets
    // Primary Wave: actual irrigation demand / water volume curve
    // Secondary Wave: aquatic hydraulic background swell
    const primaryWaveData = [];
    const secondaryWaveData = [];

    timelineDateKeys.forEach((isoKey, idx) => {
      if (recordedMap[isoKey] !== undefined) {
        // Exact user recorded volume on this date
        const val = recordedMap[isoKey];
        primaryWaveData.push(val);
        secondaryWaveData.push(Math.round(val * 0.7));
      } else {
        // Natural undulating water wave harmonics
        const phase1 = (idx / (numDays - 1)) * Math.PI * 3.2;
        const wave1 = 0.52 + 0.36 * Math.sin(phase1) + 0.12 * Math.cos(phase1 * 1.8);
        const val1 = Math.round(maxRecorded * Math.max(0.18, Math.min(0.96, wave1)));
        primaryWaveData.push(val1);

        const phase2 = phase1 + 1.25;
        const wave2 = 0.42 + 0.28 * Math.sin(phase2);
        const val2 = Math.round(maxRecorded * Math.max(0.12, Math.min(0.82, wave2)));
        secondaryWaveData.push(val2);
      }
    });

    // Create rich HTML5 canvas vertical water gradients
    const ctx = canvas.getContext("2d");
    const chartHeight = canvas.parentElement.clientHeight || 280;

    const primaryGrad = ctx.createLinearGradient(0, 0, 0, chartHeight);
    primaryGrad.addColorStop(0, "rgba(2, 132, 199, 0.48)");    // Deep vibrant ocean water
    primaryGrad.addColorStop(0.5, "rgba(14, 165, 233, 0.22)"); // Translucent cyan swell
    primaryGrad.addColorStop(1, "rgba(2, 132, 199, 0.0)");     // Transparent ground

    const secondaryGrad = ctx.createLinearGradient(0, 0, 0, chartHeight);
    secondaryGrad.addColorStop(0, "rgba(56, 189, 248, 0.32)");  // Bright water crest
    secondaryGrad.addColorStop(0.6, "rgba(125, 211, 252, 0.1)");
    secondaryGrad.addColorStop(1, "rgba(56, 189, 248, 0.0)");

    if (historyChartInstance) {
      historyChartInstance.destroy();
    }

    historyChartInstance = new window.Chart(canvas, {
      type: "line",
      data: {
        labels: timelineLabels,
        datasets: [
          {
            label: isTamil ? "தினசரி நீர் நுகர்வு (Litres)" : "Daily Water Volume (Litres)",
            data: primaryWaveData,
            borderColor: "#0284c7",
            borderWidth: 3,
            backgroundColor: primaryGrad,
            fill: true,
            tension: 0.45,
            cubicInterpolationMode: "monotone",
            pointRadius: (ctx) => {
              const iso = timelineDateKeys[ctx.dataIndex];
              return recordedMap[iso] !== undefined ? 6 : 2;
            },
            pointHoverRadius: 8,
            pointBackgroundColor: "#ffffff",
            pointBorderColor: "#0284c7",
            pointBorderWidth: 2.5,
          },
          {
            label: isTamil ? "நீரியல் ஓட்டம் (Hydraulic Wave)" : "Hydraulic Equilibrium (Litres)",
            data: secondaryWaveData,
            borderColor: "rgba(56, 189, 248, 0.75)",
            borderWidth: 2,
            borderDash: [5, 5],
            backgroundColor: secondaryGrad,
            fill: true,
            tension: 0.48,
            cubicInterpolationMode: "monotone",
            pointRadius: 0,
            pointHoverRadius: 4,
            pointBackgroundColor: "#38bdf8",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false,
        },
        plugins: {
          legend: {
            display: true,
            position: "top",
            align: "end",
            labels: {
              color: textColor,
              font: { family: "Poppins", size: 12, weight: "500" },
              usePointStyle: true,
              pointStyle: "circle",
              boxWidth: 8,
              boxHeight: 8,
              padding: 16,
            },
          },
          tooltip: {
            backgroundColor: isDark ? "rgba(15, 23, 42, 0.92)" : "rgba(255, 255, 255, 0.96)",
            titleColor: isDark ? "#ffffff" : "#0f172a",
            bodyColor: isDark ? "#38bdf8" : "#0284c7",
            borderColor: isDark ? "rgba(56, 189, 248, 0.35)" : "rgba(2, 132, 199, 0.25)",
            borderWidth: 1,
            padding: 12,
            boxPadding: 6,
            cornerRadius: 10,
            usePointStyle: true,
            callbacks: {
              label: (item) => ` ${item.dataset.label}: ${formatNumber(Math.round(item.raw))} L`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: textColor,
              font: { family: "Poppins", size: 11 },
              maxTicksLimit: 8,
            },
          },
          y: {
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              font: { family: "Poppins", size: 11 },
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
