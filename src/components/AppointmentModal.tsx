import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import {
  Appointment,
  AppointmentStatus,
  ClinicData,
  Patient,
} from '../types';
import { baht, hm, tm, uid } from '../utils/date';
import { getApptDuration, isApptCounted } from '../utils/storage';

interface AppointmentModalProps {
  open: boolean;
  data: ClinicData;
  editingAppt: Appointment | null;
  defaultDate: string;
  defaultPatientId?: string;
  onClose: () => void;
  onSave: (appt: Appointment, newPatient?: Patient) => void;
  onDelete: (apptId: string) => void;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  open,
  data,
  editingAppt,
  defaultDate,
  defaultPatientId,
  onClose,
  onSave,
  onDelete,
}) => {
  const [date, setDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState('10:00');
  const [durationMin, setDurationMin] = useState(60);
  const [isCustomDuration, setIsCustomDuration] = useState(false);

  const [patientId, setPatientId] = useState<string>('new');
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientPhone, setNewPatientPhone] = useState('');

  const [doctorId, setDoctorId] = useState('');
  const [selectedSids, setSelectedSids] = useState<string[]>([]);
  const [priceOverrides, setPriceOverrides] = useState<Record<string, number>>({});
  const [discount, setDiscount] = useState<number>(0);
  const [status, setStatus] = useState<AppointmentStatus>('นัดแล้ว');
  const [note, setNote] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [armedDelete, setArmedDelete] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrorMsg('');
    setArmedDelete(false);

    if (editingAppt) {
      setDate(editingAppt.date);
      setStartTime(editingAppt.time);
      const dur = getApptDuration(editingAppt, data.services);
      setDurationMin(dur);
      setIsCustomDuration(
        typeof editingAppt.customMin === 'number' && editingAppt.customMin > 0
      );
      setPatientId(editingAppt.pid);
      setNewPatientName('');
      setNewPatientPhone('');
      setDoctorId(editingAppt.tid);
      setSelectedSids(editingAppt.sids);

      const initialPrices: Record<string, number> = {};
      for (const s of data.services) {
        initialPrices[s.id] =
          editingAppt.pr && editingAppt.pr[s.id] != null
            ? editingAppt.pr[s.id]
            : s.price;
      }
      setPriceOverrides(initialPrices);
      setDiscount(editingAppt.disc || 0);
      setStatus(editingAppt.status);
      setNote(editingAppt.note || '');
    } else {
      setDate(defaultDate);
      setStartTime('10:00');
      const firstSvc = data.services[0];
      setSelectedSids(firstSvc ? [firstSvc.id] : []);
      setDurationMin(firstSvc ? firstSvc.min : 60);
      setIsCustomDuration(false);
      setPatientId(
        defaultPatientId || (data.patients[0]?.id ?? 'new')
      );
      setNewPatientName('');
      setNewPatientPhone('');
      setDoctorId(data.therapists[0]?.id || '');

      const initialPrices: Record<string, number> = {};
      for (const s of data.services) {
        initialPrices[s.id] = s.price;
      }
      setPriceOverrides(initialPrices);
      setDiscount(0);
      setStatus('นัดแล้ว');
      setNote('');
    }
  }, [open, editingAppt, defaultDate, defaultPatientId, data.patients, data.therapists, data.services]);

  const serviceCalculatedMin = useMemo(() => {
    const sum = selectedSids.reduce((acc, sid) => {
      const svc = data.services.find((s) => s.id === sid);
      return acc + (svc ? svc.min : 0);
    }, 0);
    return sum > 0 ? sum : 60;
  }, [selectedSids, data.services]);

  const endTime = useMemo(
    () => hm(tm(startTime) + Math.max(5, durationMin || 60)),
    [startTime, durationMin]
  );

  const handleToggleService = (sid: string) => {
    const next = selectedSids.includes(sid)
      ? selectedSids.filter((id) => id !== sid)
      : [...selectedSids, sid];
    setSelectedSids(next);

    if (!isCustomDuration) {
      const sum = next.reduce((acc, id) => {
        const svc = data.services.find((s) => s.id === id);
        return acc + (svc ? svc.min : 0);
      }, 0);
      setDurationMin(sum > 0 ? sum : 60);
    }
  };

  const handleEndTimeChange = (nextEndTime: string) => {
    const startM = tm(startTime);
    const endM = tm(nextEndTime);
    let diff = endM - startM;
    if (diff <= 0) diff += 1440;
    if (diff >= 5 && diff <= 600) {
      setDurationMin(diff);
      setIsCustomDuration(true);
    }
  };

  const subtotal = useMemo(() => {
    return selectedSids.reduce((acc, sid) => {
      const p = priceOverrides[sid];
      if (p != null) return acc + Number(p);
      const svc = data.services.find((s) => s.id === sid);
      return acc + (svc ? svc.price : 0);
    }, 0);
  }, [selectedSids, priceOverrides, data.services]);

  const netTotal = Math.max(0, subtotal - Number(discount || 0));

  const conflictWarning = useMemo(() => {
    if (!date || !startTime || !doctorId || status === 'ยกเลิก') return '';
    const startM = tm(startTime);
    const endM = startM + Math.max(5, durationMin || 60);
    for (const other of data.appts) {
      if (editingAppt && other.id === editingAppt.id) continue;
      if (!isApptCounted(other, 'active')) continue;
      if (other.date !== date || other.tid !== doctorId) continue;
      const oStart = tm(other.time);
      const oDur = getApptDuration(other, data.services);
      const oEnd = oStart + oDur;
      if (startM < oEnd && oStart < endM) {
        const patName =
          data.patients.find((p) => p.id === other.pid)?.name || 'ผู้ป่วย';
        return `หมอท่านนี้มีนัดซ้อนเวลา ${other.time}–${hm(oEnd)} (${patName})`;
      }
    }
    return '';
  }, [date, startTime, durationMin, doctorId, status, data.appts, data.services, data.patients, editingAppt]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    let finalPid = patientId;
    let createdPatient: Patient | undefined;

    if (patientId === 'new') {
      const trimmedName = newPatientName.trim();
      if (!trimmedName) {
        setErrorMsg('กรุณากรอกชื่อผู้ป่วยใหม่');
        return;
      }
      finalPid = uid();
      createdPatient = {
        id: finalPid,
        name: trimmedName,
        phone: newPatientPhone.trim(),
        note: '',
      };
    }

    if (!doctorId) {
      setErrorMsg('กรุณาเลือกหมอแพทย์แผนไทย');
      return;
    }
    if (selectedSids.length === 0) {
      setErrorMsg('กรุณาเลือกประเภทการให้บริการอย่างน้อย 1 รายการ');
      return;
    }
    if (!date || !startTime) {
      setErrorMsg('กรุณาระบุวันที่และเวลาเริ่มนัด');
      return;
    }

    const prToSave: Record<string, number> = {};
    for (const sid of selectedSids) {
      prToSave[sid] = Number(priceOverrides[sid] ?? 0);
    }

    const appt: Appointment = {
      id: editingAppt ? editingAppt.id : uid(),
      date,
      time: startTime,
      customMin: isCustomDuration ? Math.max(5, Number(durationMin) || 60) : undefined,
      pid: finalPid,
      tid: doctorId,
      sids: selectedSids,
      pr: prToSave,
      disc: Math.max(0, Number(discount) || 0),
      status,
      note: note.trim(),
    };

    onSave(appt, createdPatient);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <h3 className="text-xl font-bold text-slate-900">
            {editingAppt ? 'แก้ไขนัดหมาย และเวลาให้บริการ' : 'เพิ่มนัดหมายใหม่'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
            className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Date & Time Editing Section */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-base font-bold text-slate-900">
                วันและเวลาที่นัดหมาย (แก้ไขเวลาได้โดยตรง)
              </span>
              {isCustomDuration && (
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomDuration(false);
                    setDurationMin(serviceCalculatedMin);
                  }}
                  className="text-sm font-semibold text-blue-700 hover:underline"
                >
                  รีเซ็ตตามเวลาบริการ ({serviceCalculatedMin} นาที)
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  วันที่
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-base font-semibold text-slate-900 tabular-nums"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  เวลาเริ่ม
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-base font-semibold text-slate-900 tabular-nums"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  เวลาสิ้นสุด
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => handleEndTimeChange(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-base font-semibold text-slate-900 tabular-nums"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  ระยะเวลา (นาที)
                </label>
                <input
                  type="number"
                  min={5}
                  step={5}
                  value={durationMin}
                  onChange={(e) => {
                    setDurationMin(Math.max(5, Number(e.target.value) || 5));
                    setIsCustomDuration(true);
                  }}
                  className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-base font-semibold text-slate-900 tabular-nums"
                />
              </div>
            </div>
          </div>

          {/* Patient Selection */}
          <div>
            <label className="block text-base font-bold text-slate-900 mb-1.5">
              ผู้ป่วย
            </label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-base font-medium text-slate-900"
            >
              <option value="new">+ ลงทะเบียนผู้ป่วยใหม่ทันที</option>
              {data.patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.phone ? `(${p.phone})` : ''}
                </option>
              ))}
            </select>

            {patientId === 'new' && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-blue-50/70 border border-blue-200">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    ชื่อ-นามสกุลผู้ป่วยใหม่
                  </label>
                  <input
                    type="text"
                    value={newPatientName}
                    onChange={(e) => setNewPatientName(e.target.value)}
                    placeholder="เช่น สมหญิง ใจดี"
                    className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-base text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    เบอร์โทรศัพท์
                  </label>
                  <input
                    type="tel"
                    value={newPatientPhone}
                    onChange={(e) => setNewPatientPhone(e.target.value)}
                    placeholder="08x-xxx-xxxx"
                    className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-base text-slate-900 tabular-nums"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Doctor Selector with Distinct Color Coding */}
          <div>
            <label className="block text-base font-bold text-slate-900 mb-2">
              หมอแพทย์แผนไทย (แยกสีประจำตัวหมอ)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {data.therapists.map((doc) => {
                const selected = doctorId === doc.id;
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => setDoctorId(doc.id)}
                    style={{
                      backgroundColor: selected ? doc.color : '#ffffff',
                      borderColor: doc.color,
                      color: selected ? '#ffffff' : '#0f172a',
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-opacity min-h-[48px]"
                  >
                    <span
                      className="w-4 h-4 rounded-sm shrink-0 border border-white/50"
                      style={{
                        backgroundColor: selected ? '#ffffff' : doc.color,
                      }}
                    />
                    <span className="text-base font-bold truncate">
                      {doc.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {conflictWarning && (
              <div className="mt-2.5 flex items-center gap-2 text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3.5 py-2.5 text-sm font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{conflictWarning}</span>
              </div>
            )}
          </div>

          {/* Service Types Checklist & Inline Price Edit */}
          <div>
            <label className="block text-base font-bold text-slate-900 mb-2">
              ประเภทการให้บริการ (เลือกได้หลายรายการ และแก้ราคาเฉพาะนัดนี้ได้)
            </label>
            <div className="space-y-2">
              {data.services.map((svc) => {
                const checked = selectedSids.includes(svc.id);
                return (
                  <div
                    key={svc.id}
                    className={`flex flex-wrap items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border transition-colors ${
                      checked
                        ? 'bg-blue-50/70 border-blue-400'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-[200px]">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleToggleService(svc.id)}
                        className="w-5 h-5 accent-blue-700 rounded cursor-pointer"
                      />
                      <div>
                        <div className="text-base font-semibold text-slate-900">
                          {svc.name}
                        </div>
                        <div className="text-sm text-slate-600 tabular-nums">
                          {svc.category || 'นวดรักษา'} · {svc.min} นาที
                        </div>
                      </div>
                    </label>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm text-slate-600">ราคา</span>
                      <input
                        type="number"
                        min={0}
                        value={priceOverrides[svc.id] ?? svc.price}
                        onChange={(e) =>
                          setPriceOverrides((prev) => ({
                            ...prev,
                            [svc.id]: Math.max(0, Number(e.target.value) || 0),
                          }))
                        }
                        className="w-28 h-10 px-3 rounded-lg border border-slate-300 bg-white text-right text-base font-bold text-slate-900 tabular-nums"
                      />
                      <span className="text-sm text-slate-600">บาท</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Discount & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-bold text-slate-900 mb-1.5">
                ส่วนลด (บาท)
              </label>
              <input
                type="number"
                min={0}
                value={discount}
                onChange={(e) =>
                  setDiscount(Math.max(0, Number(e.target.value) || 0))
                }
                className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-base font-bold text-slate-900 tabular-nums"
              />
            </div>

            <div>
              <label className="block text-base font-bold text-slate-900 mb-1.5">
                สถานะนัดหมาย
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl">
                {(['นัดแล้ว', 'เสร็จสิ้น', 'ยกเลิก'] as AppointmentStatus[]).map(
                  (st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatus(st)}
                      className={`h-9 rounded-lg text-sm font-bold transition-colors ${
                        status === st
                          ? st === 'เสร็จสิ้น'
                            ? 'bg-emerald-700 text-white'
                            : st === 'ยกเลิก'
                            ? 'bg-rose-700 text-white'
                            : 'bg-blue-700 text-white'
                          : 'text-slate-700 hover:bg-white'
                      }`}
                    >
                      {st}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-base font-bold text-slate-900 mb-1.5">
              หมายเหตุเพิ่มเติม
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="อาการสำคัญ จุดที่เน้น หรือคำแนะนำ"
              className="w-full p-3 rounded-lg border border-slate-300 bg-white text-base text-slate-900"
            />
          </div>

          {/* Summary Box */}
          <div className="rounded-xl bg-slate-100 border border-slate-200 p-4 space-y-1.5">
            <div className="flex justify-between text-base text-slate-700 tabular-nums">
              <span>
                ค่าบริการ ({selectedSids.length} รายการ · {durationMin} นาที)
              </span>
              <span className="font-semibold">{baht(subtotal)}</span>
            </div>
            <div className="flex justify-between text-base text-slate-700 tabular-nums">
              <span>ส่วนลด</span>
              <span className="font-semibold">−{baht(discount)}</span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-slate-300 text-xl font-bold text-blue-800 tabular-nums">
              <span>ยอดชำระสุทธิ</span>
              <span className="text-2xl">{baht(netTotal)}</span>
            </div>
          </div>

          {errorMsg && (
            <div className="text-base font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-4 py-2.5">
              {errorMsg}
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-2 flex flex-wrap items-center justify-end gap-3">
            {editingAppt && (
              <button
                type="button"
                onClick={() => {
                  if (!armedDelete) {
                    setArmedDelete(true);
                    return;
                  }
                  onDelete(editingAppt.id);
                }}
                className="mr-auto inline-flex items-center gap-1.5 h-11 px-4 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 text-base font-semibold whitespace-nowrap"
              >
                <Trash2 className="w-4 h-4" />
                {armedDelete ? 'กดอีกครั้งเพื่อยืนยันลบ' : 'ลบนัดหมาย'}
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
              บันทึกนัดหมาย
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
