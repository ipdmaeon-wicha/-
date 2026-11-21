import React, { useMemo, useState } from 'react';
import { Edit3, Plus } from 'lucide-react';
import { ClinicData, SERVICE_CATEGORIES, ServiceType } from '../types';
import { baht, num } from '../utils/date';

interface ServicesViewProps {
  data: ClinicData;
  onAddService: () => void;
  onEditService: (svc: ServiceType) => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({
  data,
  onAddService,
  onEditService,
}) => {
  const [catFilter, setCatFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    if (catFilter === 'all') return data.services;
    return data.services.filter(
      (s) => (s.category || 'อื่นๆ') === catFilter
    );
  }, [data.services, catFilter]);

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            ประเภทการให้บริการ ({num(data.services.length)} รายการ)
          </h2>
          <p className="text-base text-slate-600 mt-0.5">
            เพิ่ม แก้ไข หรือปรับระยะเวลาและอัตราค่าบริการของคลินิกได้ตลอดเวลา
          </p>
        </div>

        <button
          type="button"
          onClick={onAddService}
          className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-base font-semibold whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          เพิ่มประเภทบริการ
        </button>
      </div>

      {/* Category Filter Buttons */}
      <div className="mt-4 flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setCatFilter('all')}
          className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
            catFilter === 'all'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          ทั้งหมด ({data.services.length})
        </button>
        {SERVICE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCatFilter(cat)}
            className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
              catFilter === cat
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-lg font-semibold text-slate-700">
            ไม่มีรายการบริการในหมวดหมู่นี้
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-200 mt-4">
          {filtered.map((svc) => (
            <div
              key={svc.id}
              className="py-4 flex flex-wrap items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-[220px]">
                <div className="text-lg font-bold text-slate-900">
                  {svc.name}
                </div>
                <div className="text-base text-slate-600 mt-0.5 tabular-nums">
                  {svc.category || 'นวดรักษา'} · ระยะเวลา {svc.min} นาที
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-2xl font-bold text-blue-700 tabular-nums">
                  {baht(svc.price)}
                </div>
                <button
                  type="button"
                  onClick={() => onEditService(svc)}
                  className="inline-flex items-center gap-1.5 h-11 px-4 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-base font-semibold whitespace-nowrap"
                >
                  <Edit3 className="w-4 h-4" />
                  แก้ไข
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
