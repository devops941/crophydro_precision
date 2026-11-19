/**
 * Crop Hydro-Precision — Internationalization (i18n)
 * Supports English (en) and Tamil (ta) with dynamic switching,
 * localStorage persistence, and Indian number formatting.
 */

const STORAGE_KEY = "crop_hydro_lang";

export const STAGE_TRANSLATIONS = {
  initial: { en: "Initial", ta: "தொடக்கம்" },
  development: { en: "Development", ta: "வளர்ச்சி" },
  mid: { en: "Mid-Season", ta: "நடு" },
  late: { en: "Late Season", ta: "முதிர்ச்சி" },
};

export const translations = {
  en: {
    // Brand & Navigation
    brand_name: "Crop Hydro-Precision",
    tagline: "Crop Water Demand & Irrigation Requirement Calculator",
    nav_home: "Home",
    nav_dashboard: "Calculator",
    nav_history: "History",
    nav_about: "Methodology",
    nav_login: "Login",
    nav_register: "Get Started",
    nav_profile: "Profile",
    nav_logout: "Logout",

    // Landing Page Hero
    hero_badge: "FAO-56 Certified Standard",
    hero_title_1: "Precision Irrigation &",
    hero_title_2: "Crop Water Demand",
    hero_subtext: "Empowering farmers and students across Tamil Nadu with scientifically accurate daily water requirements, crop coefficient curves, and pump schedules.",
    cta_calculate_now: "Calculate Water Demand",
    cta_learn_more: "Explore Methodology",
    stat_crops: "Supported Crops",
    stat_precision: "FAO-56 Compliant",
    stat_savings: "Water Optimization",

    // Floating Metric Previews
    metric_et0_preview: "Reference ET₀",
    metric_savings_preview: "Water Saving Potential",

    // How It Works
    how_it_works_title: "How Precision Calculation Works",
    how_it_works_subtitle: "Four scientific steps based on FAO-56 equations to calculate exact crop water needs.",
    step1_title: "Weather Inputs",
    step1_desc: "Enter daily maximum/minimum temperature, rainfall, and latitude to determine atmospheric evaporative demand.",
    step2_title: "Reference ET₀",
    step2_desc: "The Hargreaves-Samani equation computes extraterrestrial radiation (Ra) and reference evapotranspiration.",
    step3_title: "Crop Coefficient (Kc)",
    step3_desc: "Dynamic piecewise interpolation calculates exact Kc according to the crop's precise growth stage day.",
    step4_title: "Irrigation Schedule",
    step4_desc: "Accounting for irrigation efficiency and effective rain delivers net mm, gross volume in litres, and pump run hours.",

    // Features Section
    features_title: "Engineered for Tamil Nadu Agriculture",
    features_subtitle: "Built to deliver field-ready, mathematically rigorous recommendations directly to your phone or computer.",
    feat1_title: "FAO-56 Compliant Maths",
    feat1_desc: "No rough guesses. Pure FAO-56 scientific equations for extraterrestrial radiation and evapotranspiration.",
    feat2_title: "Litres & Pump Hours",
    feat2_desc: "Instantly converts millimeters of water demand into total litres and required pump operating duration.",
    feat3_title: "Full Seasonal Kc Curve",
    feat3_desc: "Interactive visual charts showing your crop's current stage and whole-season crop coefficient progression.",
    feat4_title: "Calculation History",
    feat4_desc: "Track and review all previous farm calculations with historical water trend analysis and exportable records.",
    feat5_title: "Bilingual (English / தமிழ்)",
    feat5_desc: "Full native Tamil language translation for farmers and agricultural students across Tamil Nadu.",
    feat6_title: "Responsive & Offline Friendly",
    feat6_desc: "Fast, mobile-first design optimized for low-bandwidth rural connections with instant calculations.",

    // Supported Crops Section
    crops_title: "Tamil Nadu Regional Crops",
    crops_subtitle: "Pre-configured with standard FAO-56 Kc values and growth stage durations.",
    crop_total_days: "Total Duration",
    crop_initial_stage: "Initial Stage",
    crop_mid_kc: "Peak Kc",
    crop_days: "days",

    // FAO-56 Credibility Banner
    fao_banner_title: "Rooted in Global Agricultural Standards",
    fao_banner_desc: "Crop Hydro-Precision strictly implements the methodologies defined in FAO Irrigation and Drainage Paper No. 56 by Allen, Pereira, Raes, and Smith (1998).",
    fao_check1: "Hargreaves-Samani temperature-radiation formulation",
    fao_check2: "Piecewise 4-stage crop coefficient interpolation",
    fao_check3: "Effective precipitation fraction accounting",

    // Common UI & Footer
    footer_desc: "A scientific irrigation requirement calculator empowering sustainable water stewardship in Tamil Nadu.",
    footer_links_title: "Quick Links",
    footer_fao_title: "Reference",
    footer_rights: "All rights reserved. Built with pure FAO-56 algorithms.",
    theme_toggle_title: "Toggle Light / Dark Mode",
    lang_toggle_title: "Switch to Tamil",
    loading: "Loading...",

    // Auth & Form Translations (English)
    auth_login_title: "Welcome Back",
    auth_login_subtitle: "Sign in to access your farm calculations, seasonal Kc curves, and pump schedules.",
    auth_register_title: "Create Farmer Account",
    auth_register_subtitle: "Start calculating precision irrigation and optimizing water demand for your crops.",
    auth_fullname_label: "Full Name",
    auth_fullname_placeholder: "e.g. Arun Kumar",
    auth_email_label: "Email Address",
    auth_email_placeholder: "arun@example.com",
    auth_password_label: "Password",
    auth_password_placeholder: "Enter secure password",
    auth_confirm_password_label: "Confirm Password",
    auth_confirm_password_placeholder: "Re-enter password",
    auth_login_btn: "Sign In",
    auth_register_btn: "Create Account",
    auth_no_account: "Don't have an account?",
    auth_have_account: "Already have an account?",
    auth_sign_in_link: "Sign in here",
    auth_register_link: "Register for free",
    auth_password_hint: "Must be at least 8 characters and pass standard security rules.",
    auth_side_heading: "Science-Driven Water Management",
    auth_side_desc: "Join farmers and agricultural researchers across Tamil Nadu using FAO-56 standards to preserve groundwater and boost crop yield.",

    // Profile Page Translations (English)
    profile_title: "Farmer Profile",
    profile_subtitle: "Manage your account identity, security credentials, and preferences.",
    profile_account_info: "Account Information",
    profile_email_readonly: "Email address cannot be changed.",
    profile_member_since: "Member Since",
    profile_save_btn: "Save Profile",
    profile_change_pwd_title: "Change Password",
    profile_old_password_label: "Current Password",
    profile_new_password_label: "New Password",
    profile_update_pwd_btn: "Update Password",
    profile_danger_zone: "Session & Security",
    profile_logout_desc: "Sign out of your active session on this device.",
    profile_logout_btn: "Log Out of Account",
    profile_updated_success: "Profile updated successfully!",
    profile_password_success: "Password changed successfully!",
  },

  ta: {
    // Brand & Navigation
    brand_name: "பயிர் நீர் துல்லியம்",
    tagline: "பயிர் நீர் தேவை மற்றும் பாசன கணக்கீட்டு மென்பொருள்",
    nav_home: "முகப்பு",
    nav_dashboard: "பாசனக் கணக்கீடு",
    nav_history: "முந்தைய பதிவுகள்",
    nav_about: "கணக்கீட்டு முறை",
    nav_login: "உள்நுழைக",
    nav_register: "தொடங்குக",
    nav_profile: "சுயவிவரம்",
    nav_logout: "வெளியேறுக",

    // Landing Page Hero
    hero_badge: "FAO-56 உலக அங்கீகாரம் பெற்ற முறை",
    hero_title_1: "துல்லிய பாசனம் &",
    hero_title_2: "பயிர் நீர் தேவை",
    hero_subtext: "தமிழ்நாடு விவசாயிகள் மற்றும் வேளாண் மாணவர்களுக்கான துல்லியமான தினசரி பயிர் நீர் தேவை, பயிர் குணக வரைபடம் மற்றும் பம்ப் இயக்கும் நேர கணக்கீடு.",
    cta_calculate_now: "நீர் தேவையை கணக்கிடுக",
    cta_learn_more: "முறையை அறிக",
    stat_crops: "பயிர்கள்",
    stat_precision: "FAO-56 முறை",
    stat_savings: "நீர் சேமிப்பு",

    // Floating Metric Previews
    metric_et0_preview: "அடிப்படை ஆவியாதல் (ET₀)",
    metric_savings_preview: "நீர் சேமிப்பு சாத்தியம்",

    // How It Works
    how_it_works_title: "துல்லிய கணக்கீடு செயல்படும் விதம்",
    how_it_works_subtitle: "FAO-56 சூத்திரங்களின் அடிப்படையில் 4 அறிவியல் படிகளில் சரியான பாசன அளவை கணக்கிடுகிறது.",
    step1_title: "வானிலை விவரங்கள்",
    step1_desc: "அதிகபட்ச/குறைந்தபட்ச வெப்பநிலை, மழை அளவு மற்றும் அட்சரேகை விவரங்கள் கொண்டு வளிமண்டல நீராவி தேவை கணக்கிடப்படுகிறது.",
    step2_title: "அடிப்படை ஆவியாதல் (ET₀)",
    step2_desc: "ஹர்கிரீவ்ஸ் சமன்பாட்டின் மூலம் சூரிய கதிர்வீச்சு (Ra) மற்றும் அடிப்படை ஆவியாதல் விகிதம் துல்லியமாக கணக்கிடப்படுகிறது.",
    step3_title: "பயிர் குணகம் (Kc)",
    step3_desc: "விதைத்த நாளிலிருந்து பயிரின் வளர்ச்சிப் பருவத்திற்கு ஏற்ப சரியான பயிர் குணகம் (Kc) தேர்ந்தெடுக்கப்படுகிறது.",
    step4_title: "பாசன அளவு & பம்ப் நேரம்",
    step4_desc: "பாசன முறைத்திறன் மற்றும் பயனுள்ள மழையைக் கழித்து நிகர மி.மீ, மொத்த லிட்டர் மற்றும் பம்ப் இயக்கும் நேரம் வழங்கப்படுகிறது.",

    // Features Section
    features_title: "தமிழக விவசாயத்திற்காக வடிவமைக்கப்பட்டது",
    features_subtitle: "உங்கள் கைபேசி அல்லது கணினியில் நேரடியாக வயல் சார்ந்த அறிவியல் முடிவுகளை வழங்குகிறது.",
    feat1_title: "FAO-56 சர்வதேச கணக்கீடு",
    feat1_desc: "யூகம் இல்லை. தூய FAO-56 அறிவியல் விதிகளின்படியான சூரிய கதிர்வீச்சு மற்றும் ஆவியாதல் சமன்பாடுகள்.",
    feat2_title: "லிட்டர் & பம்ப் இயக்கும் நேரம்",
    feat2_desc: "மி.மீ நீர் தேவையை நிலப்பரப்பிற்கு ஏற்ப உடனடியாக மொத்த லிட்டர்களாகவும், பம்ப் ஓடும் நேரமாகவும் மாற்றுகிறது.",
    feat3_title: "பருவ கால Kc வரைபடம்",
    feat3_desc: "பயிர் வளர்ச்சிப் பருவத்தின் நிலை மற்றும் முழு பருவத்திற்கான Kc மாற்றத்தை ஊடாடும் வரைபடமாக காட்டுகிறது.",
    feat4_title: "முந்தைய கணக்கீடுகள் வரலாறு",
    feat4_desc: "உங்கள் முந்தைய அனைத்து வயல் கணக்கீடுகளையும் 30 நாள் நீர் நுகர்வு வரைபடத்துடன் பாதுகாப்பாக சேமிக்கிறது.",
    feat5_title: "முழு தமிழ் & ஆங்கில வசதி",
    feat5_desc: "தமிழக விவசாயிகளுக்கும் மாணவர்களுக்கும் பயன்படும் வகையில் எளிமையான முழுத் தமிழ் மொழிபெயர்ப்பு.",
    feat6_title: "வேகமான கைபேசி வடிவமைப்பு",
    feat6_desc: "குறைந்த இணைய வேகத்திலும் கிராமப்புறங்களில் மிக விரைவாக வேலை செய்யக்கூடிய எளிய வடிவமைப்பு.",

    // Supported Crops Section
    crops_title: "தமிழக முக்கிய பயிர்கள்",
    crops_subtitle: "FAO-56 நிலையான Kc அளவுகள் மற்றும் பருவ நாட்கள் உள்ளமைக்கப்பட்டுள்ளன.",
    crop_total_days: "முழு காலம்",
    crop_initial_stage: "தொடக்கப் பருவம்",
    crop_mid_kc: "உச்ச Kc",
    crop_days: "நாட்கள்",

    // FAO-56 Credibility Banner
    fao_banner_title: "சர்வதேச விவசாய அறிவியல் தரநிலைகள்",
    fao_banner_desc: "Crop Hydro-Precision மென்பொருள் ஐக்கிய நாடுகளின் FAO பாசனம் மற்றும் வடிகால் தாள் 56 (ஆலன் மற்றும் பலர், 1998) பரிந்துரைகளை முழுமையாக பின்பற்றுகிறது.",
    fao_check1: "ஹர்கிரீவ்ஸ் வெப்பநிலை-கதிர்வீச்சு கணக்கீட்டு முறை",
    fao_check2: "4-நிலை தொடர் வளர்ச்சி பயிர் குணக இடைக்கணிப்பு",
    fao_check3: "பயனுள்ள மழைநீர் கழிவு துல்லிய கணக்கீடு",

    // Common UI & Footer
    footer_desc: "தமிழகத்தில் நிலையான நீர் மேலாண்மையை உறுதி செய்யும் அறிவியல் பூர்வ பாசனக் கணக்கீட்டு தளம்.",
    footer_links_title: "முக்கிய இணைப்புகள்",
    footer_fao_title: "ஆதாரம்",
    footer_rights: "அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை. தூய FAO-56 முறையின்படி உருவாக்கப்பட்டது.",
    theme_toggle_title: "இரவு / பகல் காட்சி மாற்று",
    lang_toggle_title: "Switch to English",
    loading: "ஏற்றப்படுகிறது...",

    // Auth & Form Translations (Tamil)
    auth_login_title: "மீண்டும் வருக",
    auth_login_subtitle: "உங்கள் பண்ணைக் கணக்கீடுகள் மற்றும் பாசன அட்டவணையைப் பெற உள்நுழையவும்.",
    auth_register_title: "புதிய கணக்கு தொடங்குக",
    auth_register_subtitle: "உங்கள் பயிர்களுக்கான துல்லிய பாசனக் கணக்கீட்டை உடனடியாகத் தொடங்குங்கள்.",
    auth_fullname_label: "முழுப் பெயர்",
    auth_fullname_placeholder: "எ.கா. அருண் குமார்",
    auth_email_label: "மின்னஞ்சல் முகவரி",
    auth_email_placeholder: "arun@example.com",
    auth_password_label: "கடவுச்சொல்",
    auth_password_placeholder: "பாதுகாப்பான கடவுச்சொல் உள்ளிடவும்",
    auth_confirm_password_label: "கடவுச்சொல்லை உறுதி செய்க",
    auth_confirm_password_placeholder: "மீண்டும் கடவுச்சொல் உள்ளிடவும்",
    auth_login_btn: "உள்நுழைக",
    auth_register_btn: "கணக்கு தொடங்குக",
    auth_no_account: "கணக்கு இல்லையா?",
    auth_have_account: "ஏற்கனவே கணக்கு உள்ளதா?",
    auth_sign_in_link: "இங்கு உள்நுழையவும்",
    auth_register_link: "இலவசமாகப் பதிவு செய்க",
    auth_password_hint: "குறைந்தது 8 எழுத்துக்கள் இருக்க வேண்டும், எண்கள் மட்டுமே இருக்கக்கூடாது.",
    auth_side_heading: "அறிவியல் வழி நீர் மேலாண்மை",
    auth_side_desc: "நிலத்தடி நீரைப் பாதுகாத்து பயிர் விளைச்சலை அதிகரிக்க FAO-56 தரநிலைகளைப் பயன்படுத்தும் தமிழக விவசாயிகளுடன் இணையுங்கள்.",

    // Profile Page Translations (Tamil)
    profile_title: "விவசாயி சுயவிவரம்",
    profile_subtitle: "உங்கள் கணக்கு விவரங்கள், கடவுச்சொல் மற்றும் அமைப்புகளை நிர்வகிக்கவும்.",
    profile_account_info: "கணக்கு விவரங்கள்",
    profile_email_readonly: "மின்னஞ்சல் முகவரியை மாற்ற முடியாது.",
    profile_member_since: "பதிவு செய்த நாள்",
    profile_save_btn: "சுயவிவரத்தைச் சேமிக்க",
    profile_change_pwd_title: "கடவுச்சொல் மாற்றம்",
    profile_old_password_label: "தற்போதைய கடவுச்சொல்",
    profile_new_password_label: "புதிய கடவுச்சொல்",
    profile_update_pwd_btn: "கடவுச்சொல்லை மாற்று",
    profile_danger_zone: "அமர்வு & பாதுகாப்பு",
    profile_logout_desc: "இந்த சாதனத்திலிருந்து உங்கள் தற்போதைய அமர்வை முடிக்கவும்.",
    profile_logout_btn: "கணக்கிலிருந்து வெளியேறுக",
    profile_updated_success: "சுயவிவரம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது!",
    profile_password_success: "கடவுச்சொல் வெற்றிகரமாக மாற்றப்பட்டது!",
  },
};

/**
 * Get the currently active language ('en' | 'ta')
 */
export function getCurrentLang() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "ta" || saved === "en") return saved;
  return "en";
}

/**
 * Set and apply the active language
 */
export function setLanguage(lang) {
  if (lang !== "en" && lang !== "ta") lang = "en";
  localStorage.setItem(STORAGE_KEY, lang);
  document.documentElement.lang = lang;
  updatePageTranslations();
  updateLangButton();
}

/**
 * Toggle between English and Tamil
 */
export function toggleLanguage() {
  const current = getCurrentLang();
  const next = current === "en" ? "ta" : "en";
  setLanguage(next);
  return next;
}

/**
 * Look up a translation key
 */
export function t(key, fallback = "") {
  const lang = getCurrentLang();
  return translations[lang]?.[key] || translations["en"]?.[key] || fallback || key;
}

/**
 * Translate growth stage string ('initial', 'development', 'mid', 'late')
 */
export function translateStage(stageKey) {
  const lang = getCurrentLang();
  return STAGE_TRANSLATIONS[stageKey]?.[lang] || stageKey;
}

/**
 * Format numbers according to Indian numbering format (e.g. 13,650)
 */
export function formatNumber(num, decimals = 0) {
  if (num === null || num === undefined || isNaN(num)) return "—";
  return Number(num).toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Walk through DOM elements with data-i18n and data-i18n-placeholder and update text
 */
export function updatePageTranslations() {
  const lang = getCurrentLang();
  const dict = translations[lang] || translations["en"];

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (dict[key]) {
      el.setAttribute("placeholder", dict[key]);
    }
  });

  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    const key = el.getAttribute("data-i18n-title");
    if (dict[key]) {
      el.setAttribute("title", dict[key]);
    }
  });
}

function updateLangButton() {
  const btn = document.getElementById("lang-toggle-btn");
  if (!btn) return;
  const current = getCurrentLang();
  const textSpan = btn.querySelector(".lang-btn-text");
  if (textSpan) {
    textSpan.textContent = current === "en" ? "தமிழ்" : "English";
  }
}

/**
 * Initialize i18n on page load
 */
export function initI18n() {
  const initialLang = getCurrentLang();
  document.documentElement.lang = initialLang;
  updatePageTranslations();
  updateLangButton();

  const btn = document.getElementById("lang-toggle-btn");
  if (btn) {
    btn.addEventListener("click", () => {
      toggleLanguage();
    });
  }
}
