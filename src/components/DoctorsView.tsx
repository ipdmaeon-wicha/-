import React from 'react';
import { Edit3, Plus } from 'lucide-react';
import { ClinicData, Doctor } from '../types';
import { baht, num, pad, ymd } from '../utils/date';
import { getApptTotal, isApptCounted } from '../utils/storage';

interface DoctorsViewProps {
  data: ClinicData;
  currentMonth: Date;
  onAddDoctor: () => void;
  onEditDoctor: (doc: Doctor) => void;
}

export const DoctorsView: React.FC<DoctorsViewProps> = ({
  data,
  currentMonth,
  onAddDoctor,
  onEditDoctor,
}) => {
  const todayStr = ymd(new Date());
  const monthKey = `${currentMonth.getFullYear()}-${pad(
    currentMonth.getMonth() + 1
  )}`;

  const totalAllRevenue = data.appts
    .filter((a) => isApptCounted(a, 'active'))
    .reduce((sum, a) => sum + getApptTotal(a, data.services), 0);

  return (
    <div className="space-y-5">
      <section className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              รายชื่อหมอแพทย์แผนไทย ({num(data.therapists.length)} ท่าน)
            </h2>
            <p className="text-base text-slate-600 mt-0.5">
              กำหนดสีประจำตัวที่แตกต่างกันให้หมอแต่ละท่าน เพื่อแยกดูในปฏิทินและรายงานได้อย่างชัดเจน
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium text-slate-600">รายได้สะสมทุกหมอ</div>
              <div className="text-2xl font-bold text-blue-700 tabular-nums">
                {baht(totalAllRevenue)}
              </div>
            </div>
            <button
              type="button"
              onClick={onAddDoctor}
              className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-base font-semibold whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              เพิ่มหมอแพทย์แผนไทย
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.therapists.map((doc) => {
            const allAppts = data.appts.filter(
              (a) => a.tid === doc.id && isApptCounted(a, 'active')
            );
            const todayAppts = allAppts.filter((a) => a.date === todayStr);
            const monthAppts = allAppts.filter((a) =>
              a.date.startsWith(monthKey)
            );

            const todayRev = todayAppts.reduce(
              (sum, a) => sum + getApptTotal(a, data.services),
              0
            );
            const monthRev = monthAppts.reduce(
              (sum, a) => sum + getApptTotal(a, data.services),
              0
            );
            const allRev = allAppts.reduce(
              (sum, a) => sum + getApptTotal(a, data.services),
              0
            );

            return (
              <div
                key={doc.id}
                className="rounded-xl border border-slate-200 overflow-hidden bg-white"
              >
                <div
                  style={{ backgroundColor: doc.color }}
                  className="px-5 py-3.5 text-white flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="text-xl font-bold">{doc.name}</div>
                    <div className="text-sm opacity-90">
                      {doc.specialty || 'แพทย์แผนไทย'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onEditDoctor(doc)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white text-slate-900 hover:bg-slate-100 text-sm font-bold whitespace-nowrap shrink-0"
                  >
                    <Edit3 className="w-4 h-4" />
                    แก้ไขชื่อ / สี
                  </button>
                </div>

                <div className="p-4 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                    <div className="text-sm font-semibold text-slate-600">วันนี้</div>
                    <div className="text-xl font-bold text-slate-900 tabular-nums mt-0.5">
                      {baht(todayRev)}
                    </div>
                    <div className="text-xs text-slate-500 tabular-nums">
                      {todayAppts.length} เคส
                    </div>
                  </div>

                  <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                    <div className="text-sm font-semibold text-slate-600">เดือนนี้</div>
                    <div className="text-xl font-bold text-blue-700 tabular-nums mt-0.5">
                      {baht(monthRev)}
                    </div>
                    <div className="text-xs text-slate-500 tabular-nums">
                      {monthAppts.length} เคส
                    </div>
                  </div>

                  <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                    <div className="text-sm font-semibold text-slate-600">รวมทั้งหมด</div>
                    <div className="text-xl font-bold text-slate-900 tabular-nums mt-0.5">
                      {baht(allRev)}
                    </div>
                    <div className="text-xs text-slate-500 tabular-nums">
                      {allAppts.length} เคส
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
