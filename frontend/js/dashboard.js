/**
 * Crop Hydro-Precision — Dashboard & Calculator Controller
 * - Summary statistics loading
 * - Crop & method reference population
 * - Interactive growth stage calculation
 * - Geolocation integration
 * - FAO-56 calculate execution
 * - Animated water tank & count-up metrics
 * - Step-by-step formula breakdown panel
 * - Chart.js seasonal Kc curve & method comparison
 */

import { api } from "./api.js";
import { requireAuth, getUser } from "./auth.js";
import { getCurrentLang, translateStage, formatNumber, t } from "./i18n.js";
import { showToast, setButtonLoading, animateCountUp } from "./ui.js";

// Protected route check
if (!requireAuth()) {
  // Redirect initiated
}

const STORAGE_LAST_INPUTS = "crop_hydro_last_inputs";

let availableCrops = [];
let availableMethods = [];
let currentCropObj = null;

let kcChartInstance = null;
let methodComparisonChartInstance = null;

export async function initDashboard() {
  renderUserGreeting();
  await loadSummary();
  await loadReferenceData();
  setupEventListeners();
  restoreSavedInputs();
}

function renderUserGreeting() {
  const user = getUser();
  const greetingEl = document.getElementById("dash-user-greeting");
  if (greetingEl && user) {
    greetingEl.textContent = `${t("dash_greeting")}, ${user.full_name}!`;
  }
}

/**
 * Load summary metrics: Total Calcs, Total Litres, Most Used Crop
 */
async function loadSummary() {
  try {
    const summary = await api("/history/summary/", { auth: true });

    const totalCalcsEl = document.getElementById("summary-total-calcs");
    const totalLitresEl = document.getElementById("summary-total-litres");
    const topCropEl = document.getElementById("summary-top-crop");

    if (totalCalcsEl) {
      animateCountUp(totalCalcsEl, summary.total_calculations || 0, 800, 0);
    }
    if (totalLitresEl) {
      animateCountUp(totalLitresEl, summary.total_litres || 0, 1000, 0, " L");
    }
    if (topCropEl) {
      if (summary.most_used_crop) {
        const isTamil = getCurrentLang() === "ta";
        topCropEl.textContent = isTamil
          ? summary.most_used_crop.name_ta
          : summary.most_used_crop.name_en;
      } else {
        topCropEl.textContent = t("dash_no_calcs_yet");
      }
    }
  } catch (err) {
    console.warn("Could not load summary statistics:", err);
  }
}

/**
 * Load crops and irrigation methods from the backend
 */
async function loadReferenceData() {
  try {
    const [cropsRes, methodsRes] = await Promise.all([
      api("/crops/", { auth: false }),
      api("/methods/", { auth: false }),
    ]);

    availableCrops = cropsRes.crops || [];
    availableMethods = methodsRes.methods || [];

    populateCropSelect();
    populateMethodSelect();
  } catch (err) {
    showToast("Failed to load reference crops and methods.", "error");
  }
}

function populateCropSelect() {
  const cropSelect = document.getElementById("input-crop");
  if (!cropSelect) return;

  const isTamil = getCurrentLang() === "ta";
  const prevValue = cropSelect.value;

  cropSelect.innerHTML = `<option value="">${t("dash_crop_select_placeholder")}</option>` +
    availableCrops.map((c) => `
      <option value="${c.code}">${isTamil ? c.name_ta : c.name_en} (${c.total_days} ${t("crop_days")})</option>
    `).join("");

  if (prevValue) {
    cropSelect.value = prevValue;
  }
}

function populateMethodSelect() {
  const methodSelect = document.getElementById("input-method");
  if (!methodSelect) return;

  const isTamil = getCurrentLang() === "ta";
  const prevValue = methodSelect.value;

  methodSelect.innerHTML = `<option value="">${t("dash_method_placeholder")}</option>` +
    availableMethods.map((m) => `
      <option value="${m.code}">${isTamil ? m.name_ta : m.name_en} (${Math.round(m.efficiency * 100)}% eff.)</option>
    `).join("");

  if (prevValue) {
    methodSelect.value = prevValue;
  }
}

/**
 * Setup form events, slider synchronization, and geolocation
 */
function setupEventListeners() {
  const cropSelect = document.getElementById("input-crop");
  const dasSlider = document.getElementById("input-das-slider");
  const dasInput = document.getElementById("input-das-number");
  const useLocationBtn = document.getElementById("use-location-btn");
  const calcForm = document.getElementById("calculator-form");

  // Crop change
  if (cropSelect) {
    cropSelect.addEventListener("change", () => {
      const code = cropSelect.value;
      currentCropObj = availableCrops.find((c) => c.code === code) || null;

      if (currentCropObj) {
        dasSlider.max = currentCropObj.total_days;
        dasInput.max = currentCropObj.total_days;

        if (Number(dasInput.value) > currentCropObj.total_days) {
          dasInput.value = Math.round(currentCropObj.total_days / 3);
          dasSlider.value = dasInput.value;
        }
      }
      updateLiveCropInfo();
    });
  }

  // Synchronize DAS Slider <-> Number Input
  if (dasSlider && dasInput) {
    dasSlider.addEventListener("input", () => {
      dasInput.value = dasSlider.value;
      updateLiveCropInfo();
    });

    dasInput.addEventListener("input", () => {
      let val = Number(dasInput.value);
      if (currentCropObj && val > currentCropObj.total_days) {
        val = currentCropObj.total_days;
        dasInput.value = val;
      }
      if (val < 0) {
        val = 0;
        dasInput.value = 0;
      }
      dasSlider.value = val;
      updateLiveCropInfo();
    });
  }

  // Geolocation button
  if (useLocationBtn) {
    useLocationBtn.addEventListener("click", () => {
      if (!navigator.geolocation) {
        showToast("Geolocation is not supported by your browser.", "error");
        return;
      }

      setButtonLoading(useLocationBtn, true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setButtonLoading(useLocationBtn, false);
          const latInput = document.getElementById("input-latitude");
          if (latInput) {
            latInput.value = pos.coords.latitude.toFixed(4);
            showToast(`Location updated: ${latInput.value}°`, "success");
          }
        },
        (err) => {
          setButtonLoading(useLocationBtn, false);
          showToast(`Location error: ${err.message}`, "error");
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  }

  // Form submit
  if (calcForm) {
    calcForm.addEventListener("submit", handleCalculateSubmit);
  }

  // Language toggle listener to update crop and method select option text
  document.getElementById("lang-toggle-btn")?.addEventListener("click", () => {
    setTimeout(() => {
      populateCropSelect();
      populateMethodSelect();
      renderUserGreeting();
      updateLiveCropInfo();
    }, 50);
  });
}

/**
 * Compute client-side growth stage and preview Kc
 */
function updateLiveCropInfo() {
  const infoBox = document.getElementById("live-crop-info-box");
  if (!infoBox) return;

  if (!currentCropObj) {
    infoBox.classList.add("hidden");
    return;
  }

  const das = Number(document.getElementById("input-das-number").value || 0);
  const endIni = currentCropObj.days_initial;
  const endDev = endIni + currentCropObj.days_dev;
  const endMid = endDev + currentCropObj.days_mid;

  let stage = "initial";
  let approxKc = currentCropObj.kc_ini;

  if (das <= endIni) {
    stage = "initial";
    approxKc = currentCropObj.kc_ini;
  } else if (das <= endDev) {
    stage = "development";
    const tRatio = (das - endIni) / currentCropObj.days_dev;
    approxKc = currentCropObj.kc_ini + tRatio * (currentCropObj.kc_mid - currentCropObj.kc_ini);
  } else if (das <= endMid) {
    stage = "mid";
    approxKc = currentCropObj.kc_mid;
  } else {
    stage = "late";
    const tRatio = (das - endMid) / currentCropObj.days_late;
    approxKc = currentCropObj.kc_mid + tRatio * (currentCropObj.kc_end - currentCropObj.kc_mid);
  }

  infoBox.classList.remove("hidden");

  const stageBadge = document.getElementById("live-stage-badge");
  const stageNameEl = document.getElementById("live-stage-name");
  const kcEstEl = document.getElementById("live-kc-est");
  const totalDaysEl = document.getElementById("live-total-days");

  if (stageBadge) {
    stageBadge.className = `badge badge-stage-${stage}`;
    stageBadge.textContent = translateStage(stage);
  }
  if (stageNameEl) stageNameEl.textContent = translateStage(stage);
  if (kcEstEl) kcEstEl.textContent = approxKc.toFixed(2);
  if (totalDaysEl) totalDaysEl.textContent = `${currentCropObj.total_days} ${t("crop_days")}`;
}

/**
 * Handle Calculate Form Submission
 */
async function handleCalculateSubmit(e) {
  e.preventDefault();
  clearFormErrors();

  const crop = document.getElementById("input-crop").value;
  const days_after_sowing = Number(document.getElementById("input-das-number").value);
  const tmax = parseFloat(document.getElementById("input-tmax").value);
  const tmin = parseFloat(document.getElementById("input-tmin").value);
  const rain_mm = parseFloat(document.getElementById("input-rain").value || 0);
  const latitude = parseFloat(document.getElementById("input-latitude").value);
  const date = document.getElementById("input-date").value;
  const area = parseFloat(document.getElementById("input-area").value);
  const area_unit = document.getElementById("input-area-unit").value;
  const method = document.getElementById("input-method").value;
  const pump_lph_val = document.getElementById("input-pump").value;
  const pump_lph = pump_lph_val ? parseFloat(pump_lph_val) : null;

  // Client Validation
  let hasError = false;
  if (!crop) {
    showFieldError("crop", "Please select a crop.");
    hasError = true;
  }
  if (isNaN(tmax) || tmax < -10 || tmax > 55) {
    showFieldError("tmax", "Tmax must be between -10°C and 55°C.");
    hasError = true;
  }
  if (isNaN(tmin) || tmin < -10 || tmin > 55) {
    showFieldError("tmin", "Tmin must be between -10°C and 55°C.");
    hasError = true;
  }
  if (!isNaN(tmax) && !isNaN(tmin) && tmax <= tmin) {
    showFieldError("tmax", "Tmax must be greater than Tmin.");
    hasError = true;
  }
  if (isNaN(rain_mm) || rain_mm < 0) {
    showFieldError("rain", "Rainfall cannot be negative.");
    hasError = true;
  }
  if (isNaN(latitude) || latitude < -66 || latitude > 66) {
    showFieldError("latitude", "Latitude must be between -66° and 66°.");
    hasError = true;
  }
  if (!date) {
    showFieldError("date", "Please enter a valid date.");
    hasError = true;
  }
  if (isNaN(area) || area <= 0) {
    showFieldError("area", "Area must be greater than 0.");
    hasError = true;
  }
  if (!method) {
    showFieldError("method", "Please select an irrigation method.");
    hasError = true;
  }

  if (hasError) return;

  const payload = {
    crop,
    days_after_sowing,
    tmax,
    tmin,
    rain_mm,
    latitude,
    date,
    area,
    area_unit,
    method,
    pump_lph,
  };

  const submitBtn = document.getElementById("calculate-submit-btn");
  setButtonLoading(submitBtn, true);

  try {
    const data = await api("/calculate/", {
      method: "POST",
      body: payload,
      auth: true,
    });

    saveInputsToStorage(payload);
    renderResults(data);
    await loadSummary();

    showToast("Calculation completed successfully!", "success");

    // Smooth scroll to results
    const resultsSection = document.getElementById("results-section");
    if (resultsSection) {
      resultsSection.classList.remove("hidden");
      resultsSection.scrollIntoView({ behavior: "smooth" });
    }
  } catch (err) {
    if (err.details) {
      Object.entries(err.details).forEach(([field, msgs]) => {
        const msgStr = Array.isArray(msgs) ? msgs.join(" ") : msgs;
        showFieldError(field, msgStr);
      });
    } else {
      showToast(err.message || "Calculation failed.", "error");
    }
  } finally {
    setButtonLoading(submitBtn, false);
  }
}

/**
 * Display calculation outputs across cards, tank, breakdown, and charts
 */
function renderResults(data) {
  const res = data.result;
  const input = data.input;

  // 1. Metric Cards
  animateCountUp(document.getElementById("res-et0"), res.et0, 800, 2);
  animateCountUp(document.getElementById("res-kc"), res.kc, 800, 2);
  animateCountUp(document.getElementById("res-etc"), res.etc, 800, 2);
  animateCountUp(document.getElementById("res-net"), res.net_mm, 800, 2);
  animateCountUp(document.getElementById("res-gross"), res.gross_mm, 800, 2);
  animateCountUp(document.getElementById("res-litres"), res.litres, 1000, 0);
  animateCountUp(document.getElementById("res-weekly"), res.weekly_litres, 1000, 0);

  const stageBadgeEl = document.getElementById("res-stage-badge");
  if (stageBadgeEl) {
    stageBadgeEl.className = `badge badge-stage-${res.stage}`;
    stageBadgeEl.textContent = translateStage(res.stage);
  }

  const pumpHoursEl = document.getElementById("res-pump-hours");
  if (pumpHoursEl) {
    if (res.pump_hours !== null && res.pump_hours !== undefined) {
      animateCountUp(pumpHoursEl, res.pump_hours, 800, 2, " h");
    } else {
      pumpHoursEl.textContent = "—";
    }
  }

  // 2. Animated Water Tank Graphic
  updateWaterTank(res.litres, res.m3);

  // 3. Step-by-Step Explanation Breakdown
  renderExplanation(data);

  // 4. Chart.js Seasonal Kc Curve
  renderKcChart(data);

  // 5. Chart.js Method Water Comparison Mini-Chart
  renderMethodComparison(data);
}

/**
 * Update the animated SVG water tank
 */
function updateWaterTank(litres, m3) {
  const fillRect = document.getElementById("tank-water-fill");
  const litresDisplay = document.getElementById("tank-litres-text");
  const m3Display = document.getElementById("tank-m3-text");

  if (litresDisplay) litresDisplay.textContent = `${formatNumber(litres)} L`;
  if (m3Display) m3Display.textContent = `(${formatNumber(m3, 2)} m³)`;

  if (fillRect) {
    // Scale fill between 15% and 85% height based on volume
    const normalized = Math.min(Math.max(litres / 40000, 0.15), 0.90);
    const maxHeight = 160;
    const height = maxHeight * normalized;
    const yPos = 190 - height;

    fillRect.setAttribute("y", yPos);
    fillRect.setAttribute("height", height);
  }
}

/**
 * Render collapsible Step-by-Step calculation breakdown panel
 */
function renderExplanation(data) {
  const panel = document.getElementById("explanation-steps");
  if (!panel) return;

  const inp = data.input;
  const res = data.result;
  const crop = data.crop;
  const method = data.method;

  panel.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: var(--space-4); font-size: var(--font-size-sm); line-height: 1.6;">
      <div style="background: var(--bg-surface-muted); padding: var(--space-3) var(--space-4); border-radius: var(--radius-md);">
        <strong>Step 1: Extraterrestrial Radiation (Ra)</strong><br>
        For Day of Year J = ${res.day_of_year} and Latitude φ = ${inp.latitude}°:<br>
        <code>Ra = ${res.ra_mj} MJ/m²/day = ${res.ra_mm} mm/day</code> (FAO-56 Eq. 21)
      </div>

      <div style="background: var(--bg-surface-muted); padding: var(--space-3) var(--space-4); border-radius: var(--radius-md);">
        <strong>Step 2: Reference Evapotranspiration (ET₀)</strong><br>
        Using Hargreaves-Samani with Tmean = ${((inp.tmax + inp.tmin) / 2).toFixed(1)}°C and (Tmax - Tmin) = ${(inp.tmax - inp.tmin).toFixed(1)}°C:<br>
        <code>ET₀ = 0.0023 × ${res.ra_mm} × (${((inp.tmax + inp.tmin) / 2).toFixed(1)} + 17.8) × √(${(inp.tmax - inp.tmin).toFixed(1)}) = ${res.et0} mm/day</code>
      </div>

      <div style="background: var(--bg-surface-muted); padding: var(--space-3) var(--space-4); border-radius: var(--radius-md);">
        <strong>Step 3: Crop Evapotranspiration (ETc)</strong><br>
        At day ${inp.days_after_sowing} of ${crop.total_days} (${translateStage(res.stage)} stage), Kc = ${res.kc}:<br>
        <code>ETc = Kc × ET₀ = ${res.kc} × ${res.et0} = ${res.etc} mm/day</code>
      </div>

      <div style="background: var(--bg-surface-muted); padding: var(--space-3) var(--space-4); border-radius: var(--radius-md);">
        <strong>Step 4: Water Balance (Net & Gross Irrigation)</strong><br>
        Effective Rain = 0.8 × ${inp.rain_mm} mm = ${res.effective_rain} mm<br>
        <code>Net = max(ETc − Effective Rain, 0) = max(${res.etc} − ${res.effective_rain}, 0) = ${res.net_mm} mm</code><br>
        <code>Gross = Net / Efficiency = ${res.net_mm} / ${method.efficiency} = ${res.gross_mm} mm</code>
      </div>

      <div style="background: var(--bg-surface-muted); padding: var(--space-3) var(--space-4); border-radius: var(--radius-md);">
        <strong>Step 5: Total Volume & Operating Schedule</strong><br>
        Field Area = ${inp.area} ${inp.area_unit} (${formatNumber(res.area_m2, 2)} m²):<br>
        <code>Daily Volume = ${res.gross_mm} mm × ${formatNumber(res.area_m2, 2)} m² = ${formatNumber(res.litres)} Litres (${res.m3} m³)</code><br>
        <code>Weekly Volume = ${formatNumber(res.litres)} × 7 = ${formatNumber(res.weekly_litres)} Litres</code><br>
        ${inp.pump_lph ? `<code>Pump Hours = ${formatNumber(res.litres)} L / ${inp.pump_lph} L/h = ${res.pump_hours} hours</code>` : '<em>(Pump flow rate not specified)</em>'}
      </div>
    </div>
  `;
}

/**
 * Render Chart.js seasonal Kc curve
 */
function renderKcChart(data) {
  const canvas = document.getElementById("kc-curve-chart");
  if (!canvas || !window.Chart) return;

  const curveData = data.kc_curve || [];
  const boundaries = data.stage_boundaries || {};
  const currentDay = data.input.days_after_sowing;

  const labels = curveData.map((pt) => `Day ${pt.day}`);
  const values = curveData.map((pt) => pt.kc);

  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const textColor = isDark ? "#cbd5e1" : "#475569";
  const gridColor = isDark ? "#1e293b" : "#e2e8f0";

  if (kcChartInstance) {
    kcChartInstance.destroy();
  }

  // Create point styles: highlight today's day
  const pointRadius = curveData.map((pt) => (pt.day === currentDay ? 8 : 0));
  const pointBackground = curveData.map((pt) => (pt.day === currentDay ? "#dc2626" : "#16a34a"));

  kcChartInstance = new window.Chart(canvas, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Crop Coefficient (Kc)",
          data: values,
          borderColor: "#16a34a",
          backgroundColor: isDark ? "rgba(22, 163, 74, 0.15)" : "rgba(22, 163, 74, 0.1)",
          fill: true,
          tension: 0.2,
          pointRadius: pointRadius,
          pointHoverRadius: 8,
          pointBackgroundColor: pointBackground,
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
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
            title: (items) => `Growth Day ${curveData[items[0].dataIndex]?.day}`,
            label: (item) => `Kc: ${item.raw.toFixed(2)}`,
          },
        },
      },
      scales: {
        x: {
          grid: { color: gridColor },
          ticks: { color: textColor, maxTicksLimit: 12 },
        },
        y: {
          grid: { color: gridColor },
          ticks: { color: textColor },
          min: 0,
          max: 1.5,
        },
      },
    },
  });
}

/**
 * Render Chart.js comparison of irrigation methods (Drip vs Sprinkler vs Flood)
 */
function renderMethodComparison(data) {
  const canvas = document.getElementById("method-comparison-chart");
  if (!canvas || !window.Chart) return;

  const net_mm = data.result.net_mm;
  const area_m2 = data.result.area_m2;
  const userMethod = data.input.method;

  // FAO-56 efficiencies
  const methods = [
    { code: "drip", name: "Drip (90%)", eff: 0.90 },
    { code: "sprinkler", name: "Sprinkler (75%)", eff: 0.75 },
    { code: "surface", name: "Surface/Flood (60%)", eff: 0.60 },
  ];

  const labels = methods.map((m) => m.name);
  const litresData = methods.map((m) => Math.round((net_mm / m.eff) * area_m2));

  // Highlight user's chosen method
  const bgColors = methods.map((m) =>
    m.code === userMethod ? "#16a34a" : "#0284c7"
  );

  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const textColor = isDark ? "#cbd5e1" : "#475569";
  const gridColor = isDark ? "#1e293b" : "#e2e8f0";

  if (methodComparisonChartInstance) {
    methodComparisonChartInstance.destroy();
  }

  methodComparisonChartInstance = new window.Chart(canvas, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Water Required (Litres/day)",
          data: litresData,
          backgroundColor: bgColors,
          borderRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (item) => `${formatNumber(item.raw)} Litres/day`,
          },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: textColor } },
        y: {
          grid: { color: gridColor },
          ticks: {
            color: textColor,
            callback: (v) => `${(v / 1000).toFixed(0)}k L`,
          },
        },
      },
    },
  });
}

function showFieldError(field, message) {
  const inputEl = document.getElementById(`input-${field}`);
  const errorEl = document.getElementById(`error-${field}`);

  if (inputEl) inputEl.classList.add("has-error");
  if (errorEl) errorEl.textContent = message;
}

function clearFormErrors() {
  document.querySelectorAll(".form-error").forEach((el) => (el.textContent = ""));
  document.querySelectorAll(".has-error").forEach((el) => el.classList.remove("has-error"));
}

function saveInputsToStorage(inputs) {
  localStorage.setItem(STORAGE_LAST_INPUTS, JSON.stringify(inputs));
}

function restoreSavedInputs() {
  // Default date to today
  const today = new Date().toISOString().split("T")[0];
  const dateInput = document.getElementById("input-date");
  if (dateInput) dateInput.value = today;

  // Default latitude to Tamil Nadu central (11.0)
  const latInput = document.getElementById("input-latitude");
  if (latInput && !latInput.value) latInput.value = "11.0";

  const savedStr = localStorage.getItem(STORAGE_LAST_INPUTS);
  if (!savedStr) return;

  try {
    const saved = JSON.parse(savedStr);
    if (saved.crop) document.getElementById("input-crop").value = saved.crop;
    if (saved.days_after_sowing !== undefined) {
      document.getElementById("input-das-number").value = saved.days_after_sowing;
      document.getElementById("input-das-slider").value = saved.days_after_sowing;
    }
    if (saved.tmax) document.getElementById("input-tmax").value = saved.tmax;
    if (saved.tmin) document.getElementById("input-tmin").value = saved.tmin;
    if (saved.rain_mm !== undefined) document.getElementById("input-rain").value = saved.rain_mm;
    if (saved.latitude) document.getElementById("input-latitude").value = saved.latitude;
    if (saved.area) document.getElementById("input-area").value = saved.area;
    if (saved.area_unit) document.getElementById("input-area-unit").value = saved.area_unit;
    if (saved.method) document.getElementById("input-method").value = saved.method;
    if (saved.pump_lph) document.getElementById("input-pump").value = saved.pump_lph;

    // Trigger crop change to update stage box
    currentCropObj = availableCrops.find((c) => c.code === saved.crop) || null;
    updateLiveCropInfo();
  } catch (e) {
    console.warn("Could not restore saved inputs:", e);
  }
}
