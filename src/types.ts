export type AppointmentStatus = 'นัดแล้ว' | 'เสร็จสิ้น' | 'ยกเลิก';

export type TabKey = 'cal' | 'dash' | 'pat' | 'ther' | 'svc';

export type RevenueScope = 'active' | 'completed';

export interface Patient {
  id: string;
  name: string;
  phone: string;
  note: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty?: string;
  color: string;
}

export interface ServiceType {
  id: string;
  name: string;
  category?: string;
  min: number;
  price: number;
}

export interface Appointment {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  customMin?: number; // Explicit duration override in minutes
  pid: string;
  tid: string;
  sids: string[];
  pr?: Record<string, number>;
  disc: number;
  status: AppointmentStatus;
  note: string;
}

export interface ClinicData {
  patients: Patient[];
  therapists: Doctor[];
  services: ServiceType[];
  appts: Appointment[];
}

export interface DoctorColorOption {
  hex: string;
  label: string;
  soft: string;
  ink: string;
}

export const DOCTOR_COLORS: DoctorColorOption[] = [
  { hex: '#1D4ED8', label: 'น้ำเงินเข้ม', soft: '#EFF6FF', ink: '#1E3A8A' },
  { hex: '#047857', label: 'เขียวมรกต', soft: '#ECFDF5', ink: '#064E3B' },
  { hex: '#7C3AED', label: 'ม่วงคราม', soft: '#F5F3FF', ink: '#4C1D95' },
  { hex: '#B45309', label: 'ส้มอำพัน', soft: '#FFFBEB', ink: '#78350F' },
  { hex: '#BE123C', label: 'แดงกุหลาบ', soft: '#FFF1F2', ink: '#881337' },
  { hex: '#0E7490', label: 'ฟ้าอมเขียว', soft: '#ECFEFF', ink: '#164E63' },
  { hex: '#4338CA', label: 'ครามเข้ม', soft: '#EEF2FF', ink: '#312E81' },
  { hex: '#4D7C0F', label: 'เขียวมะกอก', soft: '#F7FEE7', ink: '#365314' },
  { hex: '#A21CAF', label: 'ม่วงบานเย็น', soft: '#FDF4FF', ink: '#701A75' },
  { hex: '#334155', label: 'เทาเข้ม', soft: '#F8FAFC', ink: '#0F172A' },
];

export const SERVICE_CATEGORIES = [
  'นวดรักษา',
  'หัตถการแพทย์แผนไทย',
  'สมุนไพร / ประคบ / อบ',
  'นวดเพื่อสุขภาพ',
  'อื่นๆ',
] as const;

export function getDoctorColorMeta(hex: string): DoctorColorOption {
  const found = DOCTOR_COLORS.find(
    (c) => c.hex.toLowerCase() === (hex || '').toLowerCase()
  );
  if (found) return found;
  return {
    hex: hex || '#1D4ED8',
    label: 'กำหนดเอง',
    soft: '#F1F5F9',
    ink: '#0F172A',
  };
}
