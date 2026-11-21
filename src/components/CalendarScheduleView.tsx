import React, { useMemo, useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit3,
  Plus,
  UserCheck,
} from 'lucide-react';
import {
  Appointment,
  AppointmentStatus,
  ClinicData,
  getDoctorColorMeta,
} from '../types';
import { DN, MN, baht, hm, pad, thDate, tm, ymd } from '../utils/date';
import {
  getApptDuration,
  getApptTotal,
  isApptCounted,
  sortApptsByTime,
} from '../utils/storage';

interface CalendarScheduleViewProps {
  data: ClinicData;
  currentMonth: Date;
  selectedDate: string;
  onChangeMonth: (nextMonth: Date) => void;
  onSelectDate: (dateStr: string) => void;
  onAddAppt: (dateStr?: string) => void;
  onEditAppt: (appt: Appointment) => void;
  onQuickStatusChange: (apptId: string, status: AppointmentStatus) => void;
}

export const CalendarScheduleView: React.FC<CalendarScheduleViewProps> = ({
  data,
  currentMonth,
  selectedDate,
  onChangeMonth,
  onSelectDate,
  onAddAppt,
  onEditAppt,
  onQuickStatusChange,
}) => {
  const [doctorFilter, setDoctorFilter] = useState<string>('all');

  const todayStr = ymd(new Date());
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const monthKey = `${year}-${pad(month + 1)}`;

  const doctorMap = useMemo(
    () => new Map(data.therapists.map((t) => [t.id, t])),
    [data.therapists]
  );
  const patientMap = useMemo(
    () => new Map(data.patients.map((p) => [p.id, p])),
    [data.patients]
  );
  const serviceMap = useMemo(
    () => new Map(data.services.map((s) => [s.id, s])),
    [data.services]
  );

  const visibleAppts = useMemo(() => {
    if (doctorFilter === 'all') return data.appts;
    return data.appts.filter((a) => a.tid === doctorFilter);
  }, [data.appts, doctorFilter]);

  const monthActiveAppts = useMemo(
    () =>
      data.appts.filter(
        (a) => a.date.startsWith(monthKey) && isApptCounted(a, 'active')
      ),
    [data.appts, monthKey]
  );

  const monthTotalRevenue = useMemo(
    () =>
      monthActiveAppts.reduce(
        (sum, a) => sum + getApptTotal(a, data.services),
        0
      ),
    [monthActiveAppts, data.services]
  );

  const calendarCells = useMemo(() => {
    const first = new Date(year, month, 1);
    const start = new Date(year, month, 1 - first.getDay());
    const cells: { dateStr: string; dayNum: number; inMonth: boolean }[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      cells.push({
        dateStr: ymd(d),
        dayNum: d.getDate(),
        inMonth: d.getMonth() === month,
      });
    }
    return cells;
  }, [year, month]);

  const apptsByDate = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const a of visibleAppts) {
      const list = map.get(a.date) || [];
      list.push(a);
      map.set(a.date, list);
    }
    for (const [, list] of map) {
      list.sort(sortApptsByTime);
    }
    return map;
  }, [visibleAppts]);

  const selectedDayAllAppts = useMemo(
    () =>
      data.appts
        .filter((a) => a.date === selectedDate)
        .sort(sortApptsByTime),
    [data.appts, selectedDate]
  );

  const selectedDayVisibleAppts = useMemo(
    () =>
      visibleAppts
        .filter((a) => a.date === selectedDate)
        .sort(sortApptsByTime),
    [visibleAppts, selectedDate]
  );

  const selectedDayActiveAppts = useMemo(
    () => selectedDayAllAppts.filter((a) => isApptCounted(a, 'active')),
    [selectedDayAllAppts]
  );

  const selectedDayRevenue = useMemo(
    () =>
      selectedDayActiveAppts.reduce(
        (sum, a) => sum + getApptTotal(a, data.services),
        0
      ),
    [selectedDayActiveAppts, data.services]
  );

  return (
    <div className="space-y-5">
      {/* Monthly Revenue Summary & Distinct Doctor Color Legend */}
      <section className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              สรุปรายได้ประจำเดือน {MN[month]} {year + 543}
            </h2>
            <p className="text-base text-slate-600 mt-0.5">
              กดเลือกชื่อหมอแพทย์แผนไทยเพื่อกรองตารางนัดและดูสีประจำตัวหมอ
            </p>
          </div>
          <div className="flex items-baseline gap-6">
            <div className="text-right">
              <div className="text-sm font-medium text-slate-600">จำนวนนัดเดือนนี้</div>
              <div className="text-2xl font-bold text-slate-900 tabular-nums">
                {monthActiveAppts.length.toLocaleString('th-TH')} นัด
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-slate-600">รายได้รวมเดือนนี้</div>
              <div className="text-3xl font-bold text-blue-700 tabular-nums">
                {baht(monthTotalRevenue)}
              </div>
            </div>
          </div>
        </div>

        {/* Doctor Filter & Monthly Per-Doctor Revenue Cards */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <button
            type="button"
            onClick={() => setDoctorFilter('all')}
            className={`text-left rounded-xl p-3.5 border transition-colors min-h-[44px] ${
              doctorFilter === 'all'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-50 text-slate-900 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="text-sm font-semibold">แสดงหมอทุกท่าน</div>
            <div className="text-xl font-bold tabular-nums mt-1">
              {baht(monthTotalRevenue)}
            </div>
            <div
              className={`text-sm mt-0.5 tabular-nums ${
                doctorFilter === 'all' ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              รวม {monthActiveAppts.length} นัด
            </div>
          </button>

          {data.therapists.map((doc) => {
            const docAppts = monthActiveAppts.filter((a) => a.tid === doc.id);
            const docRev = docAppts.reduce(
              (sum, a) => sum + getApptTotal(a, data.services),
              0
            );
            const isSelected = doctorFilter === doc.id;
            const meta = getDoctorColorMeta(doc.color);

            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => setDoctorFilter(isSelected ? 'all' : doc.id)}
                style={{
                  backgroundColor: isSelected ? doc.color : meta.soft,
                  borderColor: doc.color,
                  color: isSelected ? '#ffffff' : meta.ink,
                }}
                className="text-left rounded-xl p-3.5 border-2 transition-opacity hover:opacity-95 min-h-[44px]"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-sm shrink-0 border border-white/40"
                    style={{
                      backgroundColor: isSelected ? '#ffffff' : doc.color,
                    }}
                  />
                  <span className="text-base font-bold truncate">
                    {doc.name}
                  </span>
                </div>
                <div className="text-xl font-bold tabular-nums mt-1">
                  {baht(docRev)}
                </div>
                <div
                  className="text-sm mt-0.5 tabular-nums opacity-90"
                >
                  {docAppts.length} นัดในเดือนนี้
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Split: Calendar + Daily Schedule */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Monthly Calendar Grid */}
        <section className="xl:col-span-7 bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <CalendarIcon className="w-6 h-6 text-blue-700" />
              <h2 className="text-2xl font-bold text-slate-900">
                {MN[month]} {year + 543}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onChangeMonth(new Date(year, month - 1, 1))}
                aria-label="เดือนก่อนหน้า"
                className="inline-flex items-center justify-center w-11 h-11 rounded-lg border border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  onChangeMonth(new Date(now.getFullYear(), now.getMonth(), 1));
                  onSelectDate(ymd(now));
                }}
                className="px-4 h-11 rounded-lg border border-slate-300 bg-white text-base font-semibold text-slate-800 hover:bg-slate-100 whitespace-nowrap"
              >
                วันนี้
              </button>
              <button
                type="button"
                onClick={() => onChangeMonth(new Date(year, month + 1, 1))}
                aria-label="เดือนถัดไป"
                className="inline-flex items-center justify-center w-11 h-11 rounded-lg border border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 mb-2">
            {DN.map((dayName, idx) => (
              <div
                key={dayName}
                className={`text-center text-sm font-bold py-1.5 ${
                  idx === 0 ? 'text-rose-700' : 'text-slate-600'
                }`}
              >
                {dayName}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {calendarCells.map((cell) => {
              const dayList = apptsByDate.get(cell.dateStr) || [];
              const isToday = cell.dateStr === todayStr;
              const isSelected = cell.dateStr === selectedDate;

              return (
                <button
                  key={cell.dateStr}
                  type="button"
                  onClick={() => {
                    onSelectDate(cell.dateStr);
                    const picked = new Date(`${cell.dateStr}T00:00:00`);
                    if (
                      picked.getMonth() !== month ||
                      picked.getFullYear() !== year
                    ) {
                      onChangeMonth(
                        new Date(picked.getFullYear(), picked.getMonth(), 1)
                      );
                    }
                  }}
                  className={`min-h-[104px] rounded-xl p-1.5 text-left flex flex-col gap-1 border transition-colors overflow-hidden ${
                    isSelected
                      ? 'bg-blue-50 border-blue-700 ring-1 ring-blue-700'
                      : 'bg-slate-50/70 border-slate-200 hover:border-blue-400 hover:bg-white'
                  } ${!cell.inMonth ? 'opacity-45' : ''}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold tabular-nums ${
                        isToday
                          ? 'bg-blue-700 text-white'
                          : isSelected
                          ? 'text-blue-800'
                          : 'text-slate-800'
                      }`}
                    >
                      {cell.dayNum}
                    </span>
                    {dayList.length > 0 && (
                      <span className="text-xs font-semibold text-slate-600 tabular-nums md:hidden">
                        {dayList.length}
                      </span>
                    )}
                  </div>

                  <div className="hidden md:flex flex-col gap-1 w-full">
                    {dayList.slice(0, 3).map((appt) => {
                      const doc = doctorMap.get(appt.tid);
                      const pat = patientMap.get(appt.pid);
                      const firstName = pat
                        ? pat.name.split(' ')[0]
                        : '(ลบแล้ว)';
                      const isCanceled = appt.status === 'ยกเลิก';

                      return (
                        <div
                          key={appt.id}
                          style={{
                            backgroundColor: doc?.color || '#475569',
                            color: '#ffffff',
                          }}
                          className={`px-1.5 py-0.5 rounded text-xs font-semibold truncate tabular-nums ${
                            isCanceled ? 'opacity-45 line-through' : ''
                          }`}
                        >
                          {appt.time} {firstName}
                        </div>
                      );
                    })}
                    {dayList.length > 3 && (
                      <div className="text-xs font-semibold text-slate-600 px-1">
                        +{dayList.length - 3} นัด
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Selected Date Daily Schedule & Revenue Panel */}
        <aside className="xl:col-span-5 bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {thDate(selectedDate)}
              </h2>
              <p className="text-sm text-slate-600 mt-0.5 tabular-nums">
                ทั้งหมด {selectedDayActiveAppts.length} นัด · รายได้วันนี้{' '}
                <span className="font-bold text-blue-700">
                  {baht(selectedDayRevenue)}
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => onAddAppt(selectedDate)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-base font-semibold whitespace-nowrap min-h-[44px]"
            >
              <Plus className="w-5 h-5" />
              เพิ่มนัดวันนี้
            </button>
          </div>

          {selectedDayVisibleAppts.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-lg font-semibold text-slate-700">
                ยังไม่มีรายการนัดหมายในวันนี้
              </p>
              <p className="text-base text-slate-500 mt-1">
                กดปุ่ม “เพิ่มนัดวันนี้” เพื่อลงตารางนัดให้หมอแพทย์แผนไทย
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {selectedDayVisibleAppts.map((appt) => {
                const doc = doctorMap.get(appt.tid);
                const pat = patientMap.get(appt.pid);
                const duration = getApptDuration(appt, data.services);
                const endTime = hm(tm(appt.time) + duration);
                const total = getApptTotal(appt, data.services);
                const docColor = doc?.color || '#475569';
                const serviceList = appt.sids
                  .map((sid) => serviceMap.get(sid)?.name || '(ลบแล้ว)')
                  .join(' · ');

                return (
                  <div
                    key={appt.id}
                    className={`rounded-xl border border-slate-200 overflow-hidden bg-white ${
                      appt.status === 'ยกเลิก' ? 'opacity-65' : ''
                    }`}
                  >
                    {/* Distinct Doctor Color Header Strip */}
                    <div
                      style={{ backgroundColor: docColor }}
                      className="px-4 py-2 text-white flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 font-bold text-base truncate">
                        <UserCheck className="w-4 h-4 shrink-0" />
                        <span className="truncate">
                          {doc?.name || '(ลบแล้ว)'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm font-semibold tabular-nums shrink-0">
                        <Clock className="w-4 h-4" />
                        <span>
                          {appt.time}–{endTime} ({duration} นาที)
                        </span>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-lg font-bold text-slate-900">
                            {pat?.name || '(ลบแล้ว)'}
                          </div>
                          {pat?.phone && (
                            <div className="text-sm text-slate-600 tabular-nums">
                              โทร {pat.phone}
                            </div>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xl font-bold text-slate-900 tabular-nums">
                            {appt.status === 'ยกเลิก' ? '฿0' : baht(total)}
                          </div>
                          {appt.disc > 0 && appt.status !== 'ยกเลิก' && (
                            <div className="text-xs text-slate-500 tabular-nums">
                              ส่วนลด {baht(appt.disc)}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-2 text-base text-slate-700">
                        {serviceList}
                      </div>

                      {appt.note && (
                        <div className="mt-1.5 text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-200">
                          หมายเหตุ: {appt.note}
                        </div>
                      )}

                      {/* Quick Actions: Status & Edit Time/Services */}
                      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                          {(['นัดแล้ว', 'เสร็จสิ้น', 'ยกเลิก'] as AppointmentStatus[]).map(
                            (st) => {
                              const active = appt.status === st;
                              return (
                                <button
                                  key={st}
                                  type="button"
                                  onClick={() =>
                                    onQuickStatusChange(appt.id, st)
                                  }
                                  className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors whitespace-nowrap ${
                                    active
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
                              );
                            }
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => onEditAppt(appt)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-sm font-semibold text-slate-800 whitespace-nowrap"
                        >
                          <Edit3 className="w-4 h-4" />
                          แก้ไขเวลา / บริการ
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Daily Revenue Breakdown by Doctor */}
          {selectedDayActiveAppts.length > 0 && (
            <div className="mt-5 pt-4 border-t border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between text-lg font-bold text-slate-900">
                <span>รวมรายได้วันนี้ ({selectedDayActiveAppts.length} เคส)</span>
                <span className="text-2xl text-blue-700 tabular-nums">
                  {baht(selectedDayRevenue)}
                </span>
              </div>

              <div className="space-y-2 pt-1">
                {data.therapists.map((doc) => {
                  const list = selectedDayActiveAppts.filter(
                    (a) => a.tid === doc.id
                  );
                  if (list.length === 0) return null;
                  const rev = list.reduce(
                    (sum, a) => sum + getApptTotal(a, data.services),
                    0
                  );
                  return (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between text-base py-1.5 px-3 rounded-lg bg-slate-50 border border-slate-200"
                    >
                      <div className="flex items-center gap-2.5 font-semibold text-slate-800">
                        <span
                          className="w-3.5 h-3.5 rounded-sm shrink-0"
                          style={{ backgroundColor: doc.color }}
                        />
                        <span>{doc.name}</span>
                        <span className="text-sm font-normal text-slate-600 tabular-nums">
                          ({list.length} เคส)
                        </span>
                      </div>
                      <span className="font-bold text-slate-900 tabular-nums">
                        {baht(rev)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
