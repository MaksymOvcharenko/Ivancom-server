// utils/normalizers.js
export function normalizePhoneDigits(v = '') {
  return String(v || '').replace(/\D+/g, '');
}

export function normalizePostalByCountry(country, raw = '') {
  const v = String(raw || '')
    .normalize('NFKC')
    .trim();
  const noSpaceDash = v.replace(/[\u00A0\s\-–—]+/g, '');
  const CC = String(country || '').toUpperCase();

  if (CC === 'NL') return noSpaceDash.toUpperCase(); // 1012JS
  if (CC === 'GB') {
    const u = noSpaceDash.toUpperCase();
    const m = u.match(/^([A-Z0-9]{2,4})([0-9][A-Z]{2})$/);
    return m ? `${m[1]} ${m[2]}` : u;
  }
  if (CC === 'PT') {
    if (/^\d{7}$/.test(noSpaceDash))
      return `${noSpaceDash.slice(0, 4)}-${noSpaceDash.slice(4)}`;
    if (/^\d{4}-\d{3}$/.test(v)) return v;
    return noSpaceDash;
  }
  if (CC === 'DK') return noSpaceDash.slice(0, 4);
  if (CC === 'PL') return noSpaceDash.slice(0, 5);
  // дефолт
  return noSpaceDash.toUpperCase();
}
