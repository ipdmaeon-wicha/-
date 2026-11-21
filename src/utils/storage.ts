import {
  Appointment,
  ClinicData,
  DOCTOR_COLORS,
  Doctor,
  Patient,
  RevenueScope,
  ServiceType,
} from '../types';
import { addDays, ymd } from './date';

const STORAGE_KEY = 'clinic-ttm-v2';
const LEGACY_KEY = 'clinic-v1';

export function createSeedData(): ClinicData {
  const today = ymd(new Date());
  const dMinus1 = addDays(today, -1);
  const dMinus2 = addDays(today, -2);
  const dMinus3 = addDays(today, -3);
  const dMinus4 = addDays(today, -4);
  const dMinus5 = addDays(today, -5);
  const dMinus6 = addDays(today, -6);
  const dPlus1 = addDays(today, 1);

  const therapists: Doctor[] = [
    {
      id: 't1',
      name: 'หมอสมศรี พท.ป.',
      specialty: 'นวดรักษา · ออฟฟิศซินโดรม',
      color: DOCTOR_COLORS[0].hex,
    },
    {
      id: 't2',
      name: 'หมอวิชัย พท.ป.',
      specialty: 'จัดกระดูก · จับเส้น',
      color: DOCTOR_COLORS[1].hex,
    },
    {
      id: 't3',
      name: 'หมอมาลี พท.ป.',
      specialty: 'ประคบสมุนไพร · อยู่ไฟ · อบสมุนไพร',
      color: DOCTOR_COLORS[2].hex,
    },
    {
      id: 't4',
      name: 'หมอกิตติ พท.ป.',
      specialty: 'พอกเข่า · เผายา · กัวซา',
      color: DOCTOR_COLORS[3].hex,
    },
  ];

  const services: ServiceType[] = [
    { id: 's1', name: 'นวดไทยเพื่อการรักษา', category: 'นวดรักษา', min: 60, price: 450 },
    { id: 's2', name: 'นวดแก้อาการออฟฟิศซินโดรม', category: 'นวดรักษา', min: 60, price: 550 },
    { id: 's3', name: 'ประคบสมุนไพรสด', category: 'สมุนไพร / ประคบ / อบ', min: 30, price: 250 },
    { id: 's4', name: 'อบสมุนไพรไทย', category: 'สมุนไพร / ประคบ / อบ', min: 30, price: 250 },
    { id: 's5', name: 'นวดฝ่าเท้าและกดจุดสะท้อน', category: 'นวดเพื่อสุขภาพ', min: 60, price: 380 },
    { id: 's6', name: 'พอกเข่าสมุนไพรลดปวด', category: 'หัตถการแพทย์แผนไทย', min: 45, price: 350 },
  ];

  const patients: Patient[] = [
    { id: 'p1', name: 'สมชาย ใจดี', phone: '081-234-5678', note: 'ปวดบ่า ไหล่เรื้อรัง' },
    { id: 'p2', name: 'วิภา รักสุข', phone: '089-111-2233', note: 'แพ้น้ำมันไพล ใช้สูตรอ่อน' },
    { id: 'p3', name: 'ประเสริฐ มั่นคง', phone: '086-455-9012', note: 'ปวดเข่าซ้าย เดินขึ้นบันไดลำบาก' },
    { id: 'p4', name: 'นภาวรรณ ศรีสุข', phone: '092-310-4455', note: 'ไมเกรน ปวดต้นคอ' },
    { id: 'p5', name: 'อำนาจ สุขเจริญ', phone: '084-778-1122', note: 'สลักเพชรจม ร้าวลงขา' },
    { id: 'p6', name: 'กัญญา วงศ์คำ', phone: '095-602-8899', note: 'นอนไม่หลับ อ่อนเพลีย' },
  ];

  const appts: Appointment[] = [
    // Today
    { id: 'a1', date: today, time: '09:30', pid: 'p1', tid: 't1', sids: ['s2', 's3'], disc: 0, status: 'เสร็จสิ้น', note: 'อาการบ่าดีขึ้น' },
    { id: 'a2', date: today, time: '10:30', pid: 'p3', tid: 't4', sids: ['s6', 's1'], disc: 50, status: 'เสร็จสิ้น', note: 'พอกเข่า 45 นาที' },
    { id: 'a3', date: today, time: '13:30', pid: 'p2', tid: 't3', sids: ['s3', 's4'], disc: 0, status: 'นัดแล้ว', note: '' },
    { id: 'a4', date: today, time: '15:00', pid: 'p5', tid: 't2', sids: ['s1'], customMin: 90, pr: { s1: 650 }, disc: 0, status: 'นัดแล้ว', note: 'เพิ่มเวลาเป็น 90 นาที' },
    // Tomorrow
    { id: 'a5', date: dPlus1, time: '10:00', pid: 'p4', tid: 't1', sids: ['s2'], disc: 0, status: 'นัดแล้ว', note: '' },
    { id: 'a6', date: dPlus1, time: '14:00', pid: 'p6', tid: 't3', sids: ['s5', 's4'], disc: 0, status: 'นัดแล้ว', note: '' },
    // -1 day
    { id: 'a7', date: dMinus1, time: '09:00', pid: 'p4', tid: 't1', sids: ['s2', 's3'], disc: 0, status: 'เสร็จสิ้น', note: '' },
    { id: 'a8', date: dMinus1, time: '11:00', pid: 'p5', tid: 't2', sids: ['s1'], disc: 0, status: 'เสร็จสิ้น', note: '' },
    { id: 'a9', date: dMinus1, time: '14:00', pid: 'p3', tid: 't4', sids: ['s6'], disc: 0, status: 'เสร็จสิ้น', note: '' },
    { id: 'a10', date: dMinus1, time: '16:00', pid: 'p6', tid: 't3', sids: ['s5', 's4'], disc: 30, status: 'เสร็จสิ้น', note: '' },
    // -2 days
    { id: 'a11', date: dMinus2, time: '10:00', pid: 'p1', tid: 't1', sids: ['s1'], disc: 0, status: 'เสร็จสิ้น', note: '' },
    { id: 'a12', date: dMinus2, time: '13:00', pid: 'p2', tid: 't3', sids: ['s3', 's4'], disc: 0, status: 'เสร็จสิ้น', note: '' },
    { id: 'a13', date: dMinus2, time: '15:30', pid: 'p5', tid: 't2', sids: ['s2'], disc: 50, status: 'เสร็จสิ้น', note: '' },
    // -3 days
    { id: 'a14', date: dMinus3, time: '09:30', pid: 'p3', tid: 't4', sids: ['s6', 's3'], disc: 0, status: 'เสร็จสิ้น', note: '' },
    { id: 'a15', date: dMinus3, time: '11:30', pid: 'p4', tid: 't1', sids: ['s2'], disc: 0, status: 'เสร็จสิ้น', note: '' },
    { id: 'a16', date: dMinus3, time: '14:30', pid: 'p6', tid: 't2', sids: ['s1', 's5'], disc: 0, status: 'เสร็จสิ้น', note: '' },
    // -4 days
    { id: 'a17', date: dMinus4, time: '10:30', pid: 'p1', tid: 't2', sids: ['s1'], disc: 0, status: 'เสร็จสิ้น', note: '' },
    { id: 'a18', date: dMinus4, time: '13:30', pid: 'p2', tid: 't3', sids: ['s4', 's5'], disc: 0, status: 'เสร็จสิ้น', note: '' },
    { id: 'a19', date: dMinus4, time: '15:00', pid: 'p3', tid: 't4', sids: ['s6'], disc: 0, status: 'ยกเลิก', note: 'เลื่อนนัด' },
    // -5 days
    { id: 'a20', date: dMinus5, time: '09:00', pid: 'p5', tid: 't1', sids: ['s2', 's3'], disc: 0, status: 'เสร็จสิ้น', note: '' },
    { id: 'a21', date: dMinus5, time: '11:00', pid: 'p6', tid: 't3', sids: ['s5'], disc: 0, status: 'เสร็จสิ้น', note: '' },
    { id: 'a22', date: dMinus5, time: '14:00', pid: 'p4', tid: 't4', sids: ['s6', 's1'], disc: 50, status: 'เสร็จสิ้น', note: '' },
    // -6 days
    { id: 'a23', date: dMinus6, time: '10:00', pid: 'p1', tid: 't1', sids: ['s1', 's3'], disc: 0, status: 'เสร็จสิ้น', note: '' },
    { id: 'a24', date: dMinus6, time: '13:00', pid: 'p3', tid: 't2', sids: ['s2'], disc: 0, status: 'เสร็จสิ้น', note: '' },
    { id: 'a25', date: dMinus6, time: '15:30', pid: 'p2', tid: 't3', sids: ['s3', 's4'], disc: 0, status: 'เสร็จสิ้น', note: '' },
  ];

  return { patients, therapists, services, appts };
}

export function loadClinicData(): ClinicData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as ClinicData;
    }
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy) as ClinicData;
      return parsed;
    }
  } catch {
    // Fallback to seed data when storage cannot be parsed
  }
  return createSeedData();
}

export function saveClinicData(data: ClinicData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage quota errors
  }
}

export function getApptDuration(appt: Appointment, services: ServiceType[]): number {
  if (typeof appt.customMin === 'number' && appt.customMin > 0) {
    return appt.customMin;
  }
  const sum = appt.sids.reduce((acc, sid) => {
    const svc = services.find((s) => s.id === sid);
    return acc + (svc ? svc.min : 0);
  }, 0);
  return sum > 0 ? sum : 60;
}

export function getApptSubtotal(appt: Appointment, services: ServiceType[]): number {
  return appt.sids.reduce((acc, sid) => {
    if (appt.pr && appt.pr[sid] != null) {
      return acc + Number(appt.pr[sid]);
    }
    const svc = services.find((s) => s.id === sid);
    return acc + (svc ? svc.price : 0);
  }, 0);
}

export function getApptTotal(appt: Appointment, services: ServiceType[]): number {
  return Math.max(0, getApptSubtotal(appt, services) - Number(appt.disc || 0));
}

export function isApptCounted(appt: Appointment, scope: RevenueScope = 'active'): boolean {
  if (scope === 'completed') {
    return appt.status === 'เสร็จสิ้น';
  }
  return appt.status !== 'ยกเลิก';
}

export function sortApptsByTime(a: Appointment, b: Appointment): number {
  return a.date.localeCompare(b.date) || a.time.localeCompare(b.time);
}
