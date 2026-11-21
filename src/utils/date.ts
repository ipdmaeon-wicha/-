export const MN = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

export const MN_SHORT = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
];

export const DN = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

export const pad = (n: number): string => String(n).padStart(2, '0');

export function ymd(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function addDays(dateStr: string, delta: number): string {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + delta);
  return ymd(d);
}

export function getLastNDays(anchorDateStr: string, count: number): string[] {
  const days: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    days.push(addDays(anchorDateStr, -i));
  }
  return days;
}

export function tm(t: string): number {
  const [h, m] = (t || '09:00').split(':');
  return Number(h) * 60 + Number(m);
}

export function hm(totalMin: number): string {
  const normalized = ((totalMin % 1440) + 1440) % 1440;
  return `${pad(Math.floor(normalized / 60))}:${pad(normalized % 60)}`;
}

export function thDate(s: string): string {
  if (!s) return '';
  const d = new Date(`${s}T00:00:00`);
  return `${DN[d.getDay()]} ${d.getDate()} ${MN[d.getMonth()]} ${d.getFullYear() + 543}`;
}

export function thShortDate(s: string): string {
  if (!s) return '';
  const d = new Date(`${s}T00:00:00`);
  return `${DN[d.getDay()]} ${d.getDate()} ${MN_SHORT[d.getMonth()]} ${d.getFullYear() + 543}`;
}

export function baht(n: number | undefined | null): string {
  return `฿${Number(n || 0).toLocaleString('th-TH')}`;
}

export function num(n: number | undefined | null): string {
  return Number(n || 0).toLocaleString('th-TH');
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}
