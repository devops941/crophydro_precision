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
    footer_rights: "© 2026 CropHydroPrecision. All rights reserved.",
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

    // Dashboard Translations (English)
    dash_greeting: "Welcome back",
    dash_summary_title: "Farm Overview",
    dash_total_calcs: "Total Calculations",
    dash_total_litres: "Total Water Budget",
    dash_top_crop: "Primary Crop",
    dash_no_calcs_yet: "No calculations yet",

    dash_form_title: "Irrigation Calculator",
    dash_sec_crop: "1. Crop & Growth Stage",
    dash_crop_select_label: "Select Crop",
    dash_crop_select_placeholder: "-- Choose a crop --",
    dash_das_label: "Days After Sowing (DAS)",
    dash_crop_info_box_title: "Live Growth Stage",
    dash_total_duration: "Total Season",

    dash_sec_weather: "2. Daily Weather & Climate",
    dash_tmax_label: "Max Temperature (Tmax)",
    dash_tmin_label: "Min Temperature (Tmin)",
    dash_rain_label: "Rainfall (Rain)",
    dash_date_label: "Observation Date",

    dash_sec_field: "3. Field & Irrigation System",
    dash_lat_label: "Field Latitude",
    dash_use_location: "Use My Location",
    dash_area_label: "Field Area",
    dash_area_unit_label: "Unit",
    dash_unit_acre: "Acre (ac)",
    dash_unit_hectare: "Hectare (ha)",
    dash_unit_m2: "Square Metre (m²)",
    dash_method_label: "Irrigation Method",
    dash_method_placeholder: "-- Choose method --",
    dash_pump_label: "Pump Flow Rate (Optional)",
    dash_pump_hint: "Leave empty if pump hours are not required.",

    dash_calculate_btn: "Calculate Water Demand",
    dash_calculating_btn: "Calculating FAO-56 Engine...",

    dash_results_title: "Calculation Results",
    dash_res_et0: "Reference ET₀",
    dash_res_kc: "Crop Coefficient (Kc)",
    dash_res_etc: "Crop Water Demand (ETc)",
    dash_res_net: "Net Irrigation",
    dash_res_gross: "Gross Irrigation",
    dash_res_litres: "Daily Volume",
    dash_res_pump: "Pump Duration",
    dash_res_weekly: "Weekly Volume",

    dash_tank_title: "Daily Water Volume Scale",
    dash_tank_level: "Tank Level",
    dash_explanation_title: "How This Was Calculated (FAO-56 Breakdown)",
    dash_kc_chart_title: "Whole-Season Crop Coefficient (Kc) Curve",
    dash_method_chart_title: "Irrigation Method Water Comparison",
    dash_water_saved_note: "Drip irrigation saves up to 33% water compared to surface flood irrigation.",

    // History Page Translations (English)
    history_title: "Calculation History",
    history_subtitle: "Review and manage your past farm irrigation records, seasonal trends, and water volumes.",
    history_chart_title: "Daily Water Usage Trend (Last 30 Days)",
    history_table_title: "Saved Field Calculations",
    history_col_date: "Date",
    history_col_crop: "Crop",
    history_col_das: "Stage & Day",
    history_col_area: "Area",
    history_col_et0: "ET₀ (mm)",
    history_col_etc: "ETc (mm)",
    history_col_gross: "Gross (mm)",
    history_col_litres: "Daily Volume",
    history_col_actions: "Actions",
    history_btn_view: "View Full Details",
    history_btn_delete: "Delete",
    history_delete_confirm_title: "Delete Calculation Record?",
    history_delete_confirm_msg: "Are you sure you want to permanently delete this calculation? This action cannot be undone.",
    history_empty_title: "No Calculations Found",
    history_empty_desc: "You haven't performed any crop water calculations yet. Use the precision calculator to create your first record.",
    history_empty_cta: "Create First Calculation",
    history_prev: "Previous",
    history_next: "Next",
    history_modal_title: "Calculation Breakdown",
    history_download_pdf: "Download PDF Report",
    history_download_single_pdf: "Download Slip (PDF)",
    history_export_success: "PDF report generated successfully!",

    // About Page Translations (English)
    about_hero_title: "The Science of Crop Water Precision",
    about_hero_desc: "Crop Hydro-Precision strictly implements the globally recognized FAO Irrigation and Drainage Paper 56 standards to guide sustainable water use.",
    about_et0_title: "1. Reference Evapotranspiration (ET₀)",
    about_et0_desc: "Reference evapotranspiration represents the rate of water loss from a standardized well-watered reference grass surface under given weather conditions. We use the Hargreaves-Samani method (1985), which calculates ET₀ using daily temperature extrema and extraterrestrial radiation (Ra), making it ideal for locations without solar radiation sensors.",
    about_kc_title: "2. The Crop Coefficient (Kc)",
    about_kc_desc: "The crop coefficient integrates crop characteristics and average effects of soil evaporation. In FAO-56, the seasonal growth cycle is partitioned into four distinct phases: Initial, Crop Development, Mid-Season, and Late Season. Crop Hydro-Precision uses piecewise linear interpolation to determine the exact daily Kc value.",
    about_etc_title: "3. Crop Evapotranspiration (ETc)",
    about_etc_desc: "Crop water demand is calculated as ETc = Kc × ET₀. This represents the actual depth of water in millimeters transpired by the crop and evaporated from the soil surface.",
    about_irrigation_title: "4. Net & Gross Irrigation Requirement",
    about_irrigation_desc: "Accounting for natural rainfall, Effective Rainfall is determined as 80% of total precipitation. Net irrigation requirement is the net water depth needed: Net = max(ETc - Effective Rain, 0). Gross irrigation accounts for system distribution efficiency (e.g. 90% for Drip, 75% for Sprinkler, 60% for Surface Flood).",
    about_volume_title: "5. Volumetric & Pump Operation Schedule",
    about_volume_desc: "A water depth of 1 mm applied over an area of 1 square meter equals exactly 1 litre of water. Using the farmer's pump discharge capacity (L/h), the required pump operating duration is determined with mathematical precision.",

    // 404 Page Translations (English)
    err404_title: "404 — Page Not Found",
    err404_desc: "The agricultural page or calculation record you are looking for does not exist or may have been moved.",
    err404_btn: "Return to Homepage",
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
    footer_rights: "© 2026 CropHydroPrecision. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.",
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

    // Dashboard Translations (Tamil)
    dash_greeting: "வணக்கம்",
    dash_summary_title: "பண்ணை மேலோட்டம்",
    dash_total_calcs: "மொத்தக் கணக்கீடுகள்",
    dash_total_litres: "கணக்கிடப்பட்ட மொத்த நீர்",
    dash_top_crop: "முக்கிய பயிர்",
    dash_no_calcs_yet: "பதிவுகள் இல்லை",

    dash_form_title: "பாசனக் கணக்கீட்டுப் படிவம்",
    dash_sec_crop: "1. பயிர் & வளர்ச்சிப் பருவம்",
    dash_crop_select_label: "பயிரைத் தேர்ந்தெடுக்கவும்",
    dash_crop_select_placeholder: "-- பயிரைத் தேர்வு செய்க --",
    dash_das_label: "விதைத்த பின் நாட்கள் (DAS)",
    dash_crop_info_box_title: "வளர்ச்சிப் பருவம்",
    dash_total_duration: "முழு பருவகாலம்",

    dash_sec_weather: "2. தினசரி வானிலை விவரங்கள்",
    dash_tmax_label: "அதிகபட்ச வெப்பநிலை (Tmax)",
    dash_tmin_label: "குறைந்தபட்ச வெப்பநிலை (Tmin)",
    dash_rain_label: "மழை அளவு (Rain)",
    dash_date_label: "கணக்கீட்டு நாள்",

    dash_sec_field: "3. நிலம் & பாசன முறை",
    dash_lat_label: "அட்சரேகை (Latitude)",
    dash_use_location: "என் இருப்பிடத்தைப் பயன்படுத்து",
    dash_area_label: "நிலப்பரப்பு அளவு",
    dash_area_unit_label: "அலகு",
    dash_unit_acre: "ஏக்கர் (Acre)",
    dash_unit_hectare: "ஹெக்டேர் (Hectare)",
    dash_unit_m2: "சதுர மீட்டர் (m²)",
    dash_method_label: "பாசன முறை",
    dash_method_placeholder: "-- முறையைத் தேர்வு செய்க --",
    dash_pump_label: "பம்ப் வெளியேற்றும் திறன் (விரும்பினால்)",
    dash_pump_hint: "பம்ப் நேரம் தேவையில்லை எனில் காலியாக விடவும்.",

    dash_calculate_btn: "நீர் தேவையை கணக்கிடுக",
    dash_calculating_btn: "கணக்கிடப்படுகிறது...",

    dash_results_title: "பாசனக் கணக்கீட்டு முடிவுகள்",
    dash_res_et0: "அடிப்படை ஆவியாதல் (ET₀)",
    dash_res_kc: "பயிர் குணகம் (Kc)",
    dash_res_etc: "பயிர் நீர் தேவை (ETc)",
    dash_res_net: "நிகர பாசன அளவு",
    dash_res_gross: "மொத்த பாசன அளவு",
    dash_res_litres: "தினசரி நீர் அளவு",
    dash_res_pump: "பம்ப் இயக்கும் நேரம்",
    dash_res_weekly: "வாராந்திர நீர் அளவு",

    dash_tank_title: "தினசரி நீர் தொட்டி அளவு",
    dash_tank_level: "நீர் மட்டம்",
    dash_explanation_title: "கணக்கீட்டு முறை விளக்கம் (FAO-56 விளக்கம்)",
    dash_kc_chart_title: "முழு பருவ பயிர் குணக (Kc) வரைபடம்",
    dash_method_chart_title: "பாசன முறைகளின் நீர் ஒப்பீடு",
    dash_water_saved_note: "சொட்டு நீர் பாசனம் வாய்க்கால் பாசனத்தை விட 33% வரை நீரைச் சேமிக்கிறது.",

    // History Page Translations (Tamil)
    history_title: "முந்தைய கணக்கீடுகள்",
    history_subtitle: "உங்கள் பண்ணையின் முந்தைய பாசன பதிவுகள், பருவ கால போக்குகள் மற்றும் நீர் அளவுகளை நிர்வகிக்கவும்.",
    history_chart_title: "தினசரி நீர் நுகர்வு வரைபடம் (கடந்த 30 நாட்கள்)",
    history_table_title: "சேமிக்கப்பட்ட வயல் கணக்கீடுகள்",
    history_col_date: "நாள்",
    history_col_crop: "பயிர்",
    history_col_das: "பருவம் & நாள்",
    history_col_area: "பரப்பளவு",
    history_col_et0: "ET₀ (மி.மீ)",
    history_col_etc: "ETc (மி.மீ)",
    history_col_gross: "மொத்தம் (மி.மீ)",
    history_col_litres: "தினசரி நீர் அளவு",
    history_col_actions: "செயல்கள்",
    history_btn_view: "முழு விவரம்",
    history_btn_delete: "நீக்குக",
    history_delete_confirm_title: "கணக்கீட்டுப் பதிவை நீக்கவா?",
    history_delete_confirm_msg: "இந்த கணக்கீட்டுப் பதிவை நிரந்தரமாக நீக்க விரும்புகிறீர்களா? இந்த செயலை மீண்டும் பெற முடியாது.",
    history_empty_title: "கணக்கீட்டு பதிவுகள் எதுவும் இல்லை",
    history_empty_desc: "நீங்கள் இன்னும் எந்த பாசனக் கணக்கீட்டையும் செய்யவில்லை. முதல் பதிவை உருவாக்க கணக்கீட்டுப் பக்கத்திற்கு செல்லவும்.",
    history_empty_cta: "முதல் கணக்கீட்டைச் செய்க",
    history_prev: "முந்தையது",
    history_next: "அடுத்தது",
    history_modal_title: "முழு கணக்கீட்டு விளக்கம்",
    history_download_pdf: "PDF அறிக்கை பதிவிறக்கு",
    history_download_single_pdf: "பாசனச் சீட்டு (PDF)",
    history_export_success: "PDF அறிக்கை வெற்றிகரமாக உருவாக்கப்பட்டது!",

    // About Page Translations (Tamil)
    about_hero_title: "துல்லிய பயிர் நீர் அறிவியல்",
    about_hero_desc: "Crop Hydro-Precision தளம் சர்வதேச அளவில் ஏற்றுக்கொள்ளப்பட்ட ஐக்கிய நாடுகளின் FAO பாசனம் மற்றும் வடிகால் தாள் 56 பரிந்துரைகளை துல்லியமாக பின்பற்றுகிறது.",
    about_et0_title: "1. அடிப்படை ஆவியாதல் (ET₀)",
    about_et0_desc: "அடிப்படை ஆவியாதல் என்பது நிலையான தட்பவெப்ப சூழலில் புல்வெளி பரப்பிலிருந்து வெளியேறும் நீரின் அளவைக் குறிக்கிறது. நாம் ஹர்கிரீவ்ஸ்-சமானி (1985) முறையைப் பயன்படுத்துகிறோம்; இது அதிகபட்ச/குறைந்தபட்ச வெப்பநிலை மற்றும் சூரிய கதிர்வீச்சு (Ra) மூலம் ET₀-ஐ மிகத் துல்லியமாக கணக்கிடுகிறது.",
    about_kc_title: "2. பயிர் குணகம் (Kc)",
    about_kc_desc: "பயிர் குணகம் என்பது பயிரின் இலைப்பரப்பு மற்றும் மண் ஆவியாதலை கணக்கில் கொள்கிறது. FAO-56 விதிகளின்படி பயிர் பருவம் நான்கு நிலைகளாக பிரிக்கப்படுகிறது: தொடக்கப் பருவம், வளர்ச்சிப் பருவம், நடுப் பருவம், முதிர்ச்சிப் பருவம். நம் தளம் தினசரி துல்லிய Kc அளவை நேரியல் இடைக்கணிப்பு மூலம் கணக்கிடுகிறது.",
    about_etc_title: "3. பயிர் நீர் தேவை (ETc)",
    about_etc_desc: "பயிரின் நேரடி நீர் தேவை ETc = Kc × ET₀ என்று கணக்கிடப்படுகிறது. இது பயிர் இலைகளின் நீராவிப்போக்கு மற்றும் நிலத்திலிருந்து ஆவியாகும் உண்மையான நீர் அளவை (மி.மீ) குறிக்கிறது.",
    about_irrigation_title: "4. நிகர மற்றும் மொத்த பாசன அளவு",
    about_irrigation_desc: "இயற்கை மழையில் 80% பயனுள்ள மழையாகக் கருதப்படுகிறது. நிகர பாசன தேவை: Net = max(ETc - பயனுள்ள மழை, 0). மொத்த பாசன அளவு பாசன முறையின் செயல்திறனைப் பொறுத்தது (சொட்டு நீர்: 90%, தெளிப்பு: 75%, வாய்க்கால்: 60%).",
    about_volume_title: "5. நீர் கொள்ளளவு மற்றும் பம்ப் நேரம்",
    about_volume_desc: "1 சதுர மீட்டர் நிலத்தில் 1 மி.மீ நீர் பாய்ச்சுவது சரியாக 1 லிட்டர் நீருக்கு சமம். விவசாயியின் பம்ப் திறனைக் கொண்டு (L/h), பம்ப் ஓட வேண்டிய நேரம் துல்லியமாக வழங்கப்படுகிறது.",

    // 404 Page Translations (Tamil)
    err404_title: "404 — பக்கம் கிடைக்கவில்லை",
    err404_desc: "நீங்கள் தேடும் பக்கம் அல்லது கணக்கீட்டு பதிவு கிடைக்கவில்லை அல்லது முகவரி மாற்றப்பட்டிருக்கலாம்.",
    err404_btn: "முகப்பு பக்கத்திற்குச் செல்க",
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
