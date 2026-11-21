import React, { useEffect, useState } from 'react';
import { Check, Trash2, X } from 'lucide-react';
import {
  DOCTOR_COLORS,
  Doctor,
  Patient,
  SERVICE_CATEGORIES,
  ServiceType,
} from '../types';
import { uid } from '../utils/date';

interface PatientModalProps {
  open: boolean;
  editingPatient: Patient | null;
  onClose: () => void;
  onSave: (patient: Patient) => void;
  onDelete: (id: string) => void;
}

export const PatientModal: React.FC<PatientModalProps> = ({
  open,
  editingPatient,
  onClose,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [err, setErr] = useState('');
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErr('');
    setArmed(false);
    setName(editingPatient?.name || '');
    setPhone(editingPatient?.phone || '');
    setNote(editingPatient?.note || '');
  }, [open, editingPatient]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErr('กรุณากรอกชื่อ-นามสกุลผู้ป่วย');
      return;
    }
    onSave({
      id: editingPatient ? editingPatient.id : uid(),
      name: name.trim(),
      phone: phone.trim(),
      note: note.trim(),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">
            {editingPatient ? 'แก้ไขข้อมูลผู้ป่วย' : 'ลงทะเบียนผู้ป่วยใหม่'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
            className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-base font-bold text-slate-900 mb-1.5">
              ชื่อ-นามสกุล
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น สมชาย ใจดี"
              className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-base text-slate-900"
            />
          </div>

          <div>
            <label className="block text-base font-bold text-slate-900 mb-1.5">
              เบอร์โทรศัพท์
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08x-xxx-xxxx"
              className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-base text-slate-900 tabular-nums"
            />
          </div>

          <div>
            <label className="block text-base font-bold text-slate-900 mb-1.5">
              หมายเหตุ (โรคประจำตัว, อาการแพ้, จุดที่ปวด)
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-300 bg-white text-base text-slate-900"
            />
          </div>

          {err && (
            <div className="text-base font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-4 py-2">
              {err}
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            {editingPatient && (
              <button
                type="button"
                onClick={() => {
                  if (!armed) return setArmed(true);
                  onDelete(editingPatient.id);
                }}
                className="mr-auto inline-flex items-center gap-1.5 h-11 px-4 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 text-base font-semibold"
              >
                <Trash2 className="w-4 h-4" />
                {armed ? 'กดอีกครั้งเพื่อยืนยันลบ' : 'ลบ'}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-base font-semibold"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="h-11 px-6 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-base font-semibold"
            >
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface DoctorModalProps {
  open: boolean;
  editingDoctor: Doctor | null;
  defaultColor: string;
  onClose: () => void;
  onSave: (doctor: Doctor) => void;
  onDelete: (id: string) => void;
}

export const DoctorModal: React.FC<DoctorModalProps> = ({
  open,
  editingDoctor,
  defaultColor,
  onClose,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [color, setColor] = useState(defaultColor);
  const [err, setErr] = useState('');
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErr('');
    setArmed(false);
    setName(editingDoctor?.name || '');
    setSpecialty(editingDoctor?.specialty || '');
    setColor(editingDoctor?.color || defaultColor);
  }, [open, editingDoctor, defaultColor]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErr('กรุณากรอกชื่อหมอแพทย์แผนไทย');
      return;
    }
    onSave({
      id: editingDoctor ? editingDoctor.id : uid(),
      name: name.trim(),
      specialty: specialty.trim(),
      color,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">
            {editingDoctor
              ? 'แก้ไขข้อมูลและสีประจำตัวหมอ'
              : 'เพิ่มหมอแพทย์แผนไทย'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
            className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-base font-bold text-slate-900 mb-1.5">
              ชื่อหมอแพทย์แผนไทย
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น หมอสมศรี พท.ป."
              className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-base text-slate-900"
            />
          </div>

          <div>
            <label className="block text-base font-bold text-slate-900 mb-1.5">
              ความเชี่ยวชาญ / หมายเหตุ
            </label>
            <input
              type="text"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              placeholder="เช่น นวดรักษา · ประคบสมุนไพร"
              className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-base text-slate-900"
            />
          </div>

          <div>
            <label className="block text-base font-bold text-slate-900 mb-2">
              เลือกสีประจำตัวหมอ (แสดงในปฏิทินและตารางสรุปรายได้)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {DOCTOR_COLORS.map((opt) => {
                const selected = color.toLowerCase() === opt.hex.toLowerCase();
                return (
                  <button
                    key={opt.hex}
                    type="button"
                    onClick={() => setColor(opt.hex)}
                    style={{ backgroundColor: opt.hex }}
                    className={`h-12 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1 transition-transform ${
                      selected ? 'ring-4 ring-slate-900 scale-[1.03]' : 'opacity-85 hover:opacity-100'
                    }`}
                  >
                    {selected && <Check className="w-4 h-4 shrink-0" />}
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex items-center gap-3">
              <label
                htmlFor="custom-doc-color"
                className="text-sm font-semibold text-slate-700"
              >
                หรือเลือกสีอื่นเอง:
              </label>
              <input
                id="custom-doc-color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-12 h-9 rounded cursor-pointer border border-slate-300"
              />
              <span className="text-sm font-mono text-slate-600">{color}</span>
            </div>
          </div>

          {err && (
            <div className="text-base font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-4 py-2">
              {err}
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            {editingDoctor && (
              <button
                type="button"
                onClick={() => {
                  if (!armed) return setArmed(true);
                  onDelete(editingDoctor.id);
                }}
                className="mr-auto inline-flex items-center gap-1.5 h-11 px-4 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 text-base font-semibold"
              >
                <Trash2 className="w-4 h-4" />
                {armed ? 'กดอีกครั้งเพื่อยืนยันลบ' : 'ลบ'}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-base font-semibold"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="h-11 px-6 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-base font-semibold"
            >
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ServiceModalProps {
  open: boolean;
  editingService: ServiceType | null;
  onClose: () => void;
  onSave: (svc: ServiceType) => void;
  onDelete: (id: string) => void;
}

export const ServiceModal: React.FC<ServiceModalProps> = ({
  open,
  editingService,
  onClose,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>(SERVICE_CATEGORIES[0]);
  const [min, setMin] = useState(60);
  const [price, setPrice] = useState(400);
  const [err, setErr] = useState('');
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErr('');
    setArmed(false);
    setName(editingService?.name || '');
    setCategory(editingService?.category || SERVICE_CATEGORIES[0]);
    setMin(editingService?.min || 60);
    setPrice(editingService?.price ?? 400);
  }, [open, editingService]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErr('กรุณากรอกชื่อประเภทการให้บริการ');
      return;
    }
    onSave({
      id: editingService ? editingService.id : uid(),
      name: name.trim(),
      category,
      min: Math.max(5, Number(min) || 60),
      price: Math.max(0, Number(price) || 0),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">
            {editingService
              ? 'แก้ไขประเภทการให้บริการ'
              : 'เพิ่มประเภทการให้บริการ'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
            className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-base font-bold text-slate-900 mb-1.5">
              ชื่อบริการ
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น นวดไทยเพื่อการรักษา"
              className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-base text-slate-900"
            />
          </div>

          <div>
            <label className="block text-base font-bold text-slate-900 mb-1.5">
              หมวดหมู่บริการ
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-base text-slate-900"
            >
              {SERVICE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-bold text-slate-900 mb-1.5">
                ระยะเวลา (นาที)
              </label>
              <input
                type="number"
                min={5}
                step={5}
                value={min}
                onChange={(e) => setMin(Math.max(5, Number(e.target.value) || 5))}
                className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-base font-bold text-slate-900 tabular-nums"
              />
            </div>

            <div>
              <label className="block text-base font-bold text-slate-900 mb-1.5">
                ค่าบริการ (บาท)
              </label>
              <input
                type="number"
                min={0}
                value={price}
                onChange={(e) =>
                  setPrice(Math.max(0, Number(e.target.value) || 0))
                }
                className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-base font-bold text-slate-900 tabular-nums"
              />
            </div>
          </div>

          {err && (
            <div className="text-base font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-4 py-2">
              {err}
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            {editingService && (
              <button
                type="button"
                onClick={() => {
                  if (!armed) return setArmed(true);
                  onDelete(editingService.id);
                }}
                className="mr-auto inline-flex items-center gap-1.5 h-11 px-4 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 text-base font-semibold"
              >
                <Trash2 className="w-4 h-4" />
                {armed ? 'กดอีกครั้งเพื่อยืนยันลบ' : 'ลบ'}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-base font-semibold"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="h-11 px-6 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-base font-semibold"
            >
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
