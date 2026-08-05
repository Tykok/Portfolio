export interface Translations {
  // OS
  start: string;
  logoff: string;
  shutdown: string;
  login_hint: string;
  login_role: string;
  login_foot: string;
  boot_sub: string;
  boot_foot: string;
  off_title: string;
  off_sub: string;
  w_min: string;
  w_max: string;
  w_close: string;
  lang_switch: string;
  // Desktop context menu
  ctx_arrange: string;
  ctx_refresh: string;
  ctx_lineup: string;
  ctx_paste: string;
  ctx_newfolder: string;
  ctx_props: string;
  ctx_by_name: string;
  ctx_by_type: string;
  ctx_theme: string;
  th_bliss: string;
  th_field: string;
  th_dusk: string;
  th_matrix: string;
  th_rose: string;
  // Tooltips
  tip_start: string;
  tip_show_desktop: string;
  tip_calendar: string;
  // Desktop tips — listed by the Start menu's tips dialog
  os_tips: string[];
  // Accessibility landmarks and the keyboard shortcut sheet
  a11y_desktop: string;
  a11y_taskbar: string;
  sc_title: string;
  /** [keys, what they do] — rendered as a two-column list. */
  os_shortcuts: [string, string][];
  // Konami rain overlay
  konami_banner: string;
  // Calendar
  cal_days: string[];
  cal_months: string[];
  cal_weekstart: number;
  // About TicoqOS dialog
  aos_title: string;
  aos_name: string;
  aos_ver: string;
  aos_copy: string;
  aos_legal: string;
  aos_mem: string;
  aos_ok: string;
  // Start menu subtitles
  sub_about: string;
  sub_projects: string;
  sub_cv: string;
  sub_contact: string;
  sub_terminal: string;
  sub_articles: string;
  sub_web: string;
  sm_allprogs: string;
  m_about_os: string;
  m_tips: string;
  // About app
  about_skills: string;
  // Projects app
  p_count_l: string;
  p_rail: string;
  p_repo: string;
  p_demo: string;
  p_no_public_code: string;
  p_takeaway: string;
  co_what: string;
  co_work: string;
  p_group_personal: string;
  p_group_company: string;
  p_role: string;
  p_prev: string;
  p_next: string;
  // CV app
  cv_print: string;
  cv_dl: string;
  cv_exp: string;
  cv_edu: string;
  cv_skills: string;
  cv_soft: string;
  cv_lang: string;
  cv_interests: string;
  cv_wants: string;
  // Contact app
  c_greet: string;
  c_auto: string;
  c_online: string;
  c_ph: string;
  c_send: string;
  // Articles app
  ar_title: string;
  ar_sub: string;
  ar_profile: string;
  ar_min: string;
  ar_reactions: string;
  ar_comments: string;
  ar_loading: string;
  ar_error: string;
  ar_empty: string;
  // Browser
  br_back: string;
  br_fwd: string;
  br_reload: string;
  br_newtab: string;
  br_closetab: string;
  br_go: string;
  br_addr_ph: string;
  br_nt_title: string;
  br_bm_home: string;
  br_ext_body: string;
  br_ext_open: string;
  // Browser — portfolio page (Notion-style)
  np_location: string;
  np_status: string;
  np_email: string;
  np_name: string;
  np_stack: string;
  np_year: string;
  np_links: string;
  np_open_projects: string;
  np_open_app: string;
  // Projects data-loading
  projects_loading: string;
  projects_error: string;
}

/** Keys whose translation is a plain string — safe to render directly. */
export type StringKey = {
  [K in keyof Translations]: Translations[K] extends string ? K : never;
}[keyof Translations];
