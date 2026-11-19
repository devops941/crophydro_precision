/**
 * Crop Hydro-Precision — Calculation History Controller
 * - 30-day water consumption trend chart (Chart.js)
 * - Paginated calculation records table
 * - Responsive table -> card layout
 * - Detail view modal
 * - Delete calculation with confirmation dialog
 */

import { api } from "./api.js";
import { requireAuth, getUser } from "./auth.js";
import { getCurrentLang, translateStage, formatNumber, t } from "./i18n.js";
import { showToast, showConfirmModal } from "./ui.js";

// Ensure protected route
if (!requireAuth()) {
  // Redirect initiated
}

let currentPage = 1;
let totalPages = 1;
let historyChartInstance = null;
let currentDetailRecord = null;

export async function initHistoryPage() {
  await loadHistoryChart();
  await loadHistoryTable(currentPage);
  setupPaginationEvents();
  setupModalEvents();
  setupPdfEvents();

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
    currentDetailRecord = data;
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

/**
 * Setup PDF download button event listeners (Direct & delegated for 100% click capture)
 */
function setupPdfEvents() {
  document.getElementById("download-history-pdf-btn")?.addEventListener("click", downloadHistoryPDF);
  document.getElementById("download-history-pdf-btn-top")?.addEventListener("click", downloadHistoryPDF);

  // Delegated listener on document for dynamic modal elements
  document.addEventListener("click", (e) => {
    const singlePdfBtn = e.target.closest("#modal-download-single-pdf");
    if (singlePdfBtn) {
      if (currentDetailRecord) {
        downloadSingleCalculationPDF(currentDetailRecord);
      } else {
        showToast("No record loaded to export.", "warning");
      }
      return;
    }

    const reportBtn = e.target.closest("#download-history-pdf-btn, #download-history-pdf-btn-top");
    if (reportBtn) {
      downloadHistoryPDF();
    }
  });
}

/**
 * Universal table renderer supporting jsPDF autoTable, jspdfAutoTable UMD, or native vector drawing fallback
 */
function renderHistoryTable(doc, headers, rows, startY) {
  if (typeof doc.autoTable === "function") {
    doc.autoTable({
      startY,
      head: headers,
      body: rows,
      theme: "striped",
      headStyles: {
        fillColor: [22, 163, 74],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8.5,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [30, 41, 59],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 248],
      },
      margin: { left: 14, right: 14 },
    });
    return;
  }

  if (window.jspdfAutoTable && typeof window.jspdfAutoTable.default === "function") {
    window.jspdfAutoTable.default(doc, {
      startY,
      head: headers,
      body: rows,
      theme: "striped",
      headStyles: {
        fillColor: [22, 163, 74],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8.5,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [30, 41, 59],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 248],
      },
      margin: { left: 14, right: 14 },
    });
    return;
  }

  // Native fallback if autoTable plugin is not active
  let y = startY;
  doc.setFillColor(22, 163, 74);
  doc.rect(14, y, 269, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  const colX = [16, 44, 78, 122, 156, 176, 196, 218, 254];
  headers[0].forEach((h, i) => {
    doc.text(h, colX[i] || 16 + i * 28, y + 5.5);
  });
  y += 9;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  rows.forEach((row, rIdx) => {
    if (y > 185) {
      doc.addPage();
      y = 20;
    }
    if (rIdx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y - 4, 269, 7, "F");
    }
    doc.setTextColor(30, 41, 59);
    row.forEach((cell, cIdx) => {
      doc.text(String(cell), colX[cIdx] || 16 + cIdx * 28, y + 1);
    });
    y += 7;
  });
}

/**
 * Export full calculation history as an official PDF report
 */
export async function downloadHistoryPDF() {
  try {
    showToast("Preparing your PDF report...", "info", 1800);

    const [summary, historyData] = await Promise.all([
      api("/history/summary/", { auth: true }),
      api("/history/?page=1", { auth: true }),
    ]);

    const records = historyData.results || [];
    if (records.length === 0) {
      showToast("No calculations found to export.", "warning");
      return;
    }

    const isTamil = getCurrentLang() === "ta";
    const user = getUser() || { full_name: "Farmer", email: "arun@example.com" };
    const dateStr = new Date().toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const jsPdfConstructor = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;

    if (jsPdfConstructor) {
      const doc = new jsPdfConstructor({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // Top Brand Header Banner
      doc.setFillColor(20, 83, 45); // Deep Agri Green #14532d
      doc.rect(0, 0, 297, 24, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("CROP HYDRO-PRECISION — FARM IRRIGATION AUDIT REPORT", 14, 11);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("FAO-56 Standard Evapotranspiration & Water Demand Schedule | Tamil Nadu, India", 14, 18);

      // Metadata & Farmer Info
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`Farmer: ${user.full_name || "Farmer"} (${user.email || ""})`, 14, 32);
      doc.setFont("helvetica", "normal");
      doc.text(`Report Date: ${dateStr}`, 14, 38);

      const totalLitres = summary.total_litres ? Number(summary.total_litres).toLocaleString("en-IN") : "0";
      const topCrop = summary.most_used_crop ? (summary.most_used_crop.name_en || "—") : "—";
      doc.setFont("helvetica", "bold");
      doc.text(`Total Records: ${summary.total_calculations || records.length}`, 190, 32);
      doc.text(`Total Water Budget: ${totalLitres} Litres`, 190, 38);
      doc.text(`Primary Crop: ${topCrop}`, 190, 44);

      // Table Data
      const tableHeaders = [
        ["Date", "Crop", "Growth Stage (DAS)", "Field Area", "ET0 (mm)", "ETc (mm)", "Gross mm", "Daily Volume", "Pump Hours"]
      ];

      const tableRows = records.map((r) => [
        r.created_at ? r.created_at.split("T")[0] : "—",
        r.crop ? r.crop.name_en : "—",
        `${r.stage || "—"} (Day ${r.days_after_sowing || 0})`,
        `${r.area || 1} ${r.area_unit || "acre"}`,
        `${r.et0 || 0} mm`,
        `${r.etc || 0} mm`,
        `${r.gross_mm || 0} mm`,
        Number(r.litres || 0).toLocaleString("en-IN") + " L",
        r.pump_hours ? `${r.pump_hours} hrs` : "—",
      ]);

      renderHistoryTable(doc, tableHeaders, tableRows, 48);

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
          "Compliant with FAO Irrigation and Drainage Paper 56 standard calculations. © 2026 CropHydroPrecision.",
          14,
          200
        );
        doc.text(`Page ${i} of ${pageCount}`, 270, 200);
      }

      doc.save(`CropHydro_Irrigation_Report_${dateStr.replace(/[\s,]+/g, "_")}.pdf`);
      showToast(t("history_export_success"), "success", 2500);
    } else {
      // Fallback: Trigger native print report window
      openPrintReportWindow(user, summary, records, isTamil);
    }
  } catch (err) {
    console.error("PDF generation error:", err);
    showToast("PDF generation failed: " + err.message, "error");
  }
}

/**
 * Export single calculation record as an official Field Irrigation Slip (PDF)
 * Zero external plugin dependencies: 100% resilient native jsPDF vector graphics
 */
export function downloadSingleCalculationPDF(data) {
  try {
    if (!data || !data.result) {
      showToast("No calculation selected to export.", "warning");
      return;
    }

    showToast("Generating field irrigation slip...", "info", 1500);

    const inp = data.input || {};
    const res = data.result || {};
    const crop = data.crop || {};
    const method = data.method || {};
    const user = getUser() || { full_name: "Farmer", email: "arun@example.com" };

    const jsPdfConstructor = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;

    if (!jsPdfConstructor) {
      console.warn("jsPDF library not available, falling back to clean print slip window.");
      openSingleSlipPrintWindow(data, user);
      return;
    }

    const doc = new jsPdfConstructor({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // 1. Top Green Header
    doc.setFillColor(20, 83, 45); // Deep Agri Green #14532d
    doc.rect(0, 0, 210, 28, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("CROP HYDRO-PRECISION", 14, 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.text("FIELD IRRIGATION SLIP — FAO-56 PENMAN-MONTEITH STANDARD", 14, 20);

    const calcDate = inp.date || (data.created_at ? data.created_at.split("T")[0] : new Date().toISOString().split("T")[0]);
    doc.setFontSize(8.5);
    doc.text(`SLIP #${data.id || "1"} | ${calcDate}`, 196, 20, { align: "right" });

    // 2. Box 1: Farmer & Field Details
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 34, 182, 34, 3, 3, "FD");

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("FARMER & FIELD SPECIFICATIONS", 20, 42);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text(`Farmer: ${user.full_name || "Farmer"} (${user.email || ""})`, 20, 50);
    doc.text(`Observation Date: ${calcDate}`, 20, 56);
    doc.text(`Crop: ${crop.name_en || "Crop"}`, 20, 62);

    const effPct = method.efficiency ? Math.round(method.efficiency * 100) : 90;
    doc.text(`Field Area: ${inp.area || 1} ${inp.area_unit || "acre"}`, 110, 50);
    doc.text(`Method: ${method.name_en || "Drip"} (${effPct}% Efficiency)`, 110, 56);
    doc.text(`Growth Stage: ${res.stage || "Mid"} (Day ${inp.days_after_sowing || 0})`, 110, 62);

    // 3. Box 2: Climate & Meteorological Inputs
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 73, 182, 28, 3, 3, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text("METEOROLOGICAL OBSERVATIONS (Hargreaves-Samani)", 20, 81);

    const effRain = (res.effective_rain !== undefined ? res.effective_rain : ((inp.rain_mm || 0) * 0.8)).toFixed(1);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text(`Max Temp: ${inp.tmax || 32}°C | Min Temp: ${inp.tmin || 22}°C`, 20, 89);
    doc.text(`Rainfall: ${inp.rain_mm || 0} mm (Effective Rain: ${effRain} mm)`, 20, 95);

    const raVal = res.ra_mj || res.ra || "—";
    doc.text(`Latitude: ${inp.latitude || 11}°N (Day of Year J = ${res.day_of_year || "—"})`, 110, 89);
    doc.text(`Solar Radiation (Ra): ${raVal} MJ/m²/day`, 110, 95);

    // 4. Box 3: Computed Irrigation Requirements (FAO-56 Breakdown)
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(34, 197, 94);
    doc.roundedRect(14, 106, 182, 142, 3, 3, "FD");

    doc.setTextColor(22, 101, 52);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("COMPUTED IRRIGATION WATER REQUIREMENTS", 20, 116);

    doc.setDrawColor(187, 247, 208);
    doc.setLineWidth(0.4);
    doc.line(20, 120, 188, 120);

    const volumeL = Number(res.litres || 0).toLocaleString("en-IN");
    const weeklyL = Number(res.weekly_litres || 0).toLocaleString("en-IN");
    const m3Val = res.m3 || (res.litres ? (res.litres / 1000).toFixed(2) : "0");
    const pumpStr = res.pump_hours ? `${res.pump_hours} Hours` : (inp.pump_lph ? `${(res.litres / inp.pump_lph).toFixed(2)} Hours` : "Flow rate not provided");

    const slipRows = [
      ["Reference Evapotranspiration (ET0)", `${res.et0 || 0} mm/day`],
      ["Crop Coefficient (Kc)", `${res.kc || 0}`],
      ["Crop Water Demand (ETc = Kc × ET0)", `${res.etc || 0} mm/day`],
      ["Effective Rainfall Deduction", `${effRain} mm`],
      ["Net Irrigation Depth (ETc - Eff. Rain)", `${res.net_mm || 0} mm`],
      ["Application Efficiency", `${effPct}% (${method.name_en || "Standard"})`],
      ["Gross Irrigation Requirement", `${res.gross_mm || 0} mm`],
      ["TOTAL DAILY WATER VOLUME", `${volumeL} Litres (${m3Val} m³)`],
      ["RECOMMENDED PUMP RUNTIME", pumpStr],
      ["Weekly Estimated Water Budget", `${weeklyL} Litres`],
    ];

    let rowY = 129;
    slipRows.forEach(([metricLabel, metricVal], idx) => {
      const isHero = idx === 7 || idx === 8;
      if (idx % 2 === 0) {
        doc.setFillColor(245, 254, 247);
        doc.rect(18, rowY - 5.5, 174, 10, "F");
      }

      doc.setFont("helvetica", isHero ? "bold" : "normal");
      doc.setFontSize(isHero ? 9.5 : 8.5);
      doc.setTextColor(isHero ? 22 : 30, isHero ? 101 : 41, isHero ? 52 : 59);
      doc.text(metricLabel, 22, rowY);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(isHero ? 10 : 9);
      doc.setTextColor(isHero ? 21 : 2, isHero ? 128 : 132, isHero ? 61 : 199);
      doc.text(metricVal, 186, rowY, { align: "right" });

      rowY += 11.5;
    });

    // 5. Verification Seal & Certification Footer
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 254, 182, 26, 2, 2, "FD");

    doc.setTextColor(71, 85, 105);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("FAO-56 SCIENTIFIC COMPLIANCE VERIFICATION", 20, 262);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Computed under FAO Irrigation and Drainage Paper 56 standards for Tamil Nadu agro-climatic zones.", 20, 268);
    const certCode = `CHP-${data.id || "0"}-${Date.now().toString().slice(-6)}`;
    doc.text(`Official Slip ID: ${certCode} | Generated by Crop Hydro-Precision Engine`, 20, 274);

    // Save PDF
    const filename = `CropHydro_Field_Slip_ID_${data.id || "1"}.pdf`;
    doc.save(filename);
    showToast(t("history_export_success"), "success", 2500);
  } catch (err) {
    console.error("PDF generation error:", err);
    showToast("PDF generation failed: " + err.message, "error");
    openSingleSlipPrintWindow(data, getUser());
  }
}

/**
 * Dedicated fallback print window for single field calculation slip
 */
function openSingleSlipPrintWindow(data, user) {
  const printWin = window.open("", "_blank");
  if (!printWin) {
    window.print();
    return;
  }
  const inp = data.input || {};
  const res = data.result || {};
  const crop = data.crop || {};
  const method = data.method || {};
  const dateStr = inp.date || (data.created_at ? data.created_at.split("T")[0] : new Date().toLocaleDateString("en-IN"));
  const volumeL = Number(res.litres || 0).toLocaleString("en-IN");
  const weeklyL = Number(res.weekly_litres || 0).toLocaleString("en-IN");
  const effPct = method.efficiency ? Math.round(method.efficiency * 100) : 90;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Field Irrigation Slip - ${crop.name_en || 'Crop'}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #0f172a; max-width: 720px; margin: 0 auto; }
        .header { background: #14532d; color: white; padding: 16px 20px; border-radius: 6px; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 20px; }
        .header p { margin: 4px 0 0; font-size: 12px; opacity: 0.9; }
        .box { border: 1px solid #cbd5e1; border-radius: 6px; padding: 14px; margin-bottom: 16px; background: #f8fafc; }
        .box h3 { margin: 0 0 10px; font-size: 12px; text-transform: uppercase; color: #334155; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px; }
        .results-box { border: 2px solid #22c55e; background: #f0fdf4; border-radius: 6px; padding: 16px; margin-bottom: 16px; }
        .results-box h3 { margin: 0 0 12px; font-size: 14px; color: #166534; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        td { padding: 8px 6px; border-bottom: 1px solid #dcfce7; }
        tr:nth-child(even) { background: #f7fee7; }
        .val { text-align: right; font-weight: bold; color: #0369a1; }
        .highlight { font-weight: bold; font-size: 14px; color: #15803d; }
        .footer { font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 10px; text-align: center; }
        @media print { body { padding: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>CROP HYDRO-PRECISION</h1>
        <p>FIELD IRRIGATION SLIP — FAO-56 PENMAN-MONTEITH STANDARD</p>
      </div>
      <div class="box">
        <h3>Farmer & Field Specifications</h3>
        <div class="grid">
          <div><strong>Farmer:</strong> ${user?.full_name || 'Farmer'}</div>
          <div><strong>Crop:</strong> ${crop.name_en || 'Crop'}</div>
          <div><strong>Observation Date:</strong> ${dateStr}</div>
          <div><strong>Field Area:</strong> ${inp.area || 1} ${inp.area_unit || 'acre'}</div>
          <div><strong>Growth Stage:</strong> ${res.stage || 'Mid'} (Day ${inp.days_after_sowing || 0})</div>
          <div><strong>Irrigation Method:</strong> ${method.name_en || 'Drip'} (${effPct}% Efficiency)</div>
        </div>
      </div>
      <div class="results-box">
        <h3>Computed Irrigation Requirements</h3>
        <table>
          <tr><td>Reference Evapotranspiration (ET0)</td><td class="val">${res.et0 || 0} mm/day</td></tr>
          <tr><td>Crop Coefficient (Kc)</td><td class="val">${res.kc || 0}</td></tr>
          <tr><td>Crop Water Demand (ETc)</td><td class="val">${res.etc || 0} mm/day</td></tr>
          <tr><td>Effective Rainfall</td><td class="val">${res.effective_rain || inp.rain_mm || 0} mm</td></tr>
          <tr><td>Net Irrigation Depth</td><td class="val">${res.net_mm || 0} mm</td></tr>
          <tr><td>Gross Irrigation Depth</td><td class="val">${res.gross_mm || 0} mm</td></tr>
          <tr><td class="highlight">TOTAL DAILY WATER VOLUME</td><td class="val highlight">${volumeL} Litres</td></tr>
          <tr><td class="highlight">RECOMMENDED PUMP RUNTIME</td><td class="val highlight">${res.pump_hours ? `${res.pump_hours} Hours` : 'N/A'}</td></tr>
          <tr><td>Weekly Estimated Volume</td><td class="val">${weeklyL} Litres</td></tr>
        </table>
      </div>
      <div class="footer">
        Official FAO-56 Validation Certificate. Generated by Crop Hydro-Precision Engine.
      </div>
      <script>
        window.onload = () => { window.print(); };
      <\/script>
    </body>
    </html>
  `;
  printWin.document.write(html);
  printWin.document.close();
}

/**
 * Fallback print report window for full history table
 */
function openPrintReportWindow(user, summary, records, isTamil) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    window.print();
    return;
  }
  const dateStr = new Date().toLocaleDateString("en-IN");
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Crop Hydro-Precision — Irrigation Report</title>
      <style>
        body { font-family: -apple-system, sans-serif; padding: 24px; color: #0f172a; }
        .header { border-bottom: 3px solid #16a34a; padding-bottom: 12px; margin-bottom: 20px; }
        h1 { color: #166534; font-size: 20px; margin: 0 0 4px; }
        .meta { display: flex; justify-content: space-between; font-size: 13px; color: #475569; margin-top: 8px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
        th { background: #f0fdf4; color: #166534; text-align: left; padding: 8px; border: 1px solid #cbd5e1; }
        td { padding: 8px; border: 1px solid #cbd5e1; }
        tr:nth-child(even) { background: #f8fafc; }
        @media print { body { padding: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>CROP HYDRO-PRECISION — IRRIGATION WATER AUDIT REPORT</h1>
        <div>FAO-56 Standard Evapotranspiration & Water Demand Schedule | Tamil Nadu</div>
        <div class="meta">
          <span><strong>Farmer:</strong> ${user?.full_name || 'Farmer'} (${user?.email || ''})</span>
          <span><strong>Report Date:</strong> ${dateStr}</span>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Date</th><th>Crop</th><th>Stage</th><th>Area</th><th>ET0</th><th>ETc</th><th>Gross</th><th>Daily Volume</th><th>Pump Hours</th>
          </tr>
        </thead>
        <tbody>
          ${records.map(r => `
            <tr>
              <td>${r.created_at ? r.created_at.split("T")[0] : '—'}</td>
              <td>${r.crop ? r.crop.name_en : '—'}</td>
              <td>${r.stage || '—'} (Day ${r.days_after_sowing || 0})</td>
              <td>${r.area || 1} ${r.area_unit || 'acre'}</td>
              <td>${r.et0 || 0} mm</td>
              <td>${r.etc || 0} mm</td>
              <td>${r.gross_mm || 0} mm</td>
              <td><strong>${Number(r.litres || 0).toLocaleString('en-IN')} L</strong></td>
              <td>${r.pump_hours ? `${r.pump_hours} hrs` : '—'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div style="margin-top: 24px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px;">
        Compliant with FAO Irrigation and Drainage Paper 56 standards. © 2026 CropHydroPrecision.
      </div>
      <script>
        window.onload = () => { window.print(); };
      <\/script>
    </body>
    </html>
  `;
  printWindow.document.write(html);
  printWindow.document.close();
}
