import { YouthProfile, SupportProgram } from '../types';

/**
 * Intelligent AI Recommendation Matcher for Youth Support Programs.
 * Resolves direct IDs, legacy alias IDs, and dynamically computes
 * tailored recommendations based on education, specialty, skills, and employment status.
 */
export function isProgramRecommended(youth: YouthProfile | null | undefined, prog: SupportProgram): boolean {
  if (!youth || !prog) return false;

  // 1. Direct ID match
  if (youth.support_recommendation && Array.isArray(youth.support_recommendation)) {
    if (youth.support_recommendation.includes(prog.id)) {
      return true;
    }

    // 2. Legacy / Alias ID normalization
    for (const rec of youth.support_recommendation) {
      if (rec === 'prog_mono_01' && prog.id === 'prog_ishga_marhamat_tech') return true;
      if (rec === 'prog_it_01' && prog.id === 'prog_it_park_bootcamp') return true;
      if (rec.includes('mono') && prog.id.includes('marhamat')) return true;
      if (rec.includes('it') && prog.id.includes('it_park')) return true;
      if (rec.includes('daftari') && prog.id.includes('daftari')) return true;
      if (rec.includes('credit') && prog.id.includes('credit')) return true;
      if (rec.includes('job_fair') && prog.id.includes('job_fair')) return true;
      if (rec.includes('lang') && prog.id.includes('lang')) return true;
    }
  }

  // 3. Dynamic Profile Matching
  const skillsText = (youth.skills || []).join(' ').toLowerCase();
  const specText = (youth.specialty || '').toLowerCase();
  const actText = (youth.activity_type || '').toLowerCase();
  const notesText = (youth.notes || '').toLowerCase();

  // IT & Tech courses match
  if (
    specText.includes('it') || 
    specText.includes('программ') || 
    specText.includes('разработ') || 
    skillsText.includes('react') || 
    skillsText.includes('пк') || 
    skillsText.includes('компьютер') ||
    skillsText.includes('smm') ||
    notesText.includes('it')
  ) {
    if (prog.id === 'prog_it_park_bootcamp') return true;
  }

  // Vocational / Monocenter match
  if (
    youth.education === 'Среднее' || 
    youth.education === 'Средне-специальное' ||
    youth.is_neet ||
    skillsText.includes('свар') ||
    skillsText.includes('электр') ||
    skillsText.includes('шве') ||
    skillsText.includes('авто')
  ) {
    if (prog.id === 'prog_ishga_marhamat_tech') return true;
  }

  // Grants & Microcredit for Entrepreneurs
  if (
    youth.employment_status === 'предприниматель' ||
    actText.includes('пошив') ||
    actText.includes('услуги') ||
    actText.includes('кофе') ||
    actText.includes('торгов') ||
    skillsText.includes('шве') ||
    skillsText.includes('бизнес')
  ) {
    if (prog.id === 'prog_yoshlar_daftari_grant' || prog.id === 'prog_micro_credit_biz') return true;
  }

  // Language certifications
  if (
    skillsText.includes('англ') || 
    skillsText.includes('язык') || 
    specText.includes('филолог') || 
    skillsText.includes('ielts')
  ) {
    if (prog.id === 'prog_lang_center_sub') return true;
  }

  // Delivery / Logistics
  if (
    skillsText.includes('прав') || 
    skillsText.includes('водител') || 
    skillsText.includes('курьер') ||
    skillsText.includes('логист')
  ) {
    if (prog.id === 'prog_yandex_delivery') return true;
  }

  // Direct Job Fair for unemployed
  if (youth.is_neet || youth.employment_status === 'безработный' || youth.employment_status === 'не уточнено') {
    if (prog.id === 'prog_district_job_fair' || prog.id === 'prog_korzinka_retail' || prog.id === 'prog_call_center_operator') {
      return true;
    }
  }

  return false;
}

/**
 * Returns all recommended programs for a given youth profile
 */
export function getYouthRecommendations(youth: YouthProfile | null | undefined, supportPrograms: SupportProgram[]): SupportProgram[] {
  if (!youth || !supportPrograms) return [];
  const recommended = supportPrograms.filter(prog => isProgramRecommended(youth, prog));
  // Guarantee at least 2 programs are recommended for any profile
  if (recommended.length === 0) {
    return supportPrograms.slice(0, 2);
  }
  return recommended;
}
