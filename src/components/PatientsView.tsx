import React, { useMemo, useState } from 'react';
import { CalendarPlus, Edit3, Plus, Search } from 'lucide-react';
import { ClinicData, Patient } from '../types';
import { baht, num } from '../utils/date';
import { getApptTotal, isApptCounted } from '../utils/storage';

interface PatientsViewProps {
  data: ClinicData;
  onAddPatient: () => void;
  onEditPatient: (patient: Patient) => void;
  onBookPatient: (patient: Patient) => void;
}

export const PatientsView: React.FC<PatientsViewProps> = ({
  data,
  onAddPatient,
  onEditPatient,
  onBookPatient,
}) => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data.patients;
    return data.patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.phone.toLowerCase().includes(q) ||
        p.note.toLowerCase().includes(q)
    );
  }, [data.patients, query]);

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            ทะเบียนผู้ป่วย ({num(data.patients.length)} ราย)
          </h2>
          <p className="text-base text-slate-600 mt-0.5">
            ค้นหาชื่อ เบอร์โทร หรืออาการ เพื่อดูประวัติและนัดหมายได้ทันที
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาชื่อ หรือเบอร์โทร..."
              className="h-11 pl-11 pr-4 w-64 sm:w-72 rounded-lg border border-slate-300 bg-white text-base text-slate-900"
            />
          </div>

          <button
            type="button"
            onClick={onAddPatient}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-base font-semibold whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            ลงทะเบียนผู้ป่วยใหม่
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-lg font-semibold text-slate-700">
            {query ? 'ไม่พบข้อมูลผู้ป่วยที่ค้นหา' : 'ยังไม่มีข้อมูลผู้ป่วย'}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-200 mt-2">
          {filtered.map((patient) => {
            const visits = data.appts.filter(
              (a) => a.pid === patient.id && isApptCounted(a, 'active')
            );
            const totalSpent = visits.reduce(
              (sum, a) => sum + getApptTotal(a, data.services),
              0
            );

            return (
              <div
                key={patient.id}
                className="py-4 flex flex-wrap items-center justify-between gap-4"
              >
                <div className="min-w-[240px] flex-1">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="text-lg font-bold text-slate-900">
                      {patient.name}
                    </span>
                    {patient.phone && (
                      <span className="text-base font-medium text-slate-600 tabular-nums">
                        {patient.phone}
                      </span>
                    )}
                  </div>
                  <div className="text-base text-slate-600 mt-1">
                    {patient.note || 'ไม่มีหมายเหตุอาการ'} · มาใช้บริการ{' '}
                    <span className="font-bold text-slate-900 tabular-nums">
                      {num(visits.length)}
                    </span>{' '}
                    ครั้ง · ยอดรวม{' '}
                    <span className="font-bold text-blue-700 tabular-nums">
                      {baht(totalSpent)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onBookPatient(patient)}
                    className="inline-flex items-center gap-1.5 h-11 px-4 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-800 text-base font-semibold whitespace-nowrap"
                  >
                    <CalendarPlus className="w-4 h-4" />
                    นัดหมายใหม่
                  </button>
                  <button
                    type="button"
                    onClick={() => onEditPatient(patient)}
                    className="inline-flex items-center gap-1.5 h-11 px-4 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-base font-semibold whitespace-nowrap"
                  >
                    <Edit3 className="w-4 h-4" />
                    แก้ไข
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
