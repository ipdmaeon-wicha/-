import React, { useMemo, useState } from 'react';
import { Calendar, FileSpreadsheet } from 'lucide-react';
import { ClinicData, RevenueScope } from '../types';
import {
  addDays,
  baht,
  getLastNDays,
  num,
  thShortDate,
  ymd,
} from '../utils/date';
import { exportClinicReportExcel } from '../utils/excel';
import {
  getApptSubtotal,
  getApptTotal,
  isApptCounted,
} from '../utils/storage';

interface Dashboard7DayViewProps {
  data: ClinicData;
  onJumpToDate: (dateStr: string) => void;
}

export const Dashboard7DayView: React.FC<Dashboard7DayViewProps> = ({
  data,
  onJumpToDate,
}) => {
  const todayStr = ymd(new Date());
  const [anchorDate, setAnchorDate] = useState<string>(todayStr);
  const [scope, setScope] = useState<RevenueScope>('active');

  // Custom date range export state
  const [exportFrom, setExportFrom] = useState<string>(addDays(todayStr, -6));
  const [exportTo, setExportTo] = useState<string>(todayStr);

  const last7Days = useMemo(
    () => getLastNDays(anchorDate, 7),
    [anchorDate]
  );

  const daySet = useMemo(() => new Set(last7Days), [last7Days]);

  const apptsIn7Days = useMemo(
    () =>
      data.appts.filter(
        (a) => daySet.has(a.date) && isApptCounted(a, scope)
      ),
    [data.appts, daySet, scope]
  );

  const totalRevenue7d = useMemo(
    () =>
      apptsIn7Days.reduce(
        (sum, a) => sum + getApptTotal(a, data.services),
        0
      ),
    [apptsIn7Days, data.services]
  );

  const totalSubtotal7d = useMemo(
    () =>
      apptsIn7Days.reduce(
        (sum, a) => sum + getApptSubtotal(a, data.services),
        0
      ),
    [apptsIn7Days, data.services]
  );

  const totalDiscount7d = useMemo(
    () => apptsIn7Days.reduce((sum, a) => sum + Number(a.disc || 0), 0),
    [apptsIn7Days]
  );

  const totalCases7d = apptsIn7Days.length;
  const avgPerCase = totalCases7d > 0 ? Math.round(totalRevenue7d / totalCases7d) : 0;

  // Daily breakdown ordered newest first (anchorDate down to -6 days) for fast front-desk scanning
  const dailyRows = useMemo(() => {
    const ordered = [...last7Days].reverse();
    return ordered.map((dateStr) => {
      const dayAppts = apptsIn7Days.filter((a) => a.date === dateStr);
      const dayTotal = dayAppts.reduce(
        (sum, a) => sum + getApptTotal(a, data.services),
        0
      );
      const dayDisc = dayAppts.reduce(
        (sum, a) => sum + Number(a.disc || 0),
        0
      );

      const byDoctor = new Map<string, { count: number; revenue: number }>();
      for (const doc of data.therapists) {
        const docList = dayAppts.filter((a) => a.tid === doc.id);
        byDoctor.set(doc.id, {
          count: docList.length,
          revenue: docList.reduce(
            (sum, a) => sum + getApptTotal(a, data.services),
            0
          ),
        });
      }

      return {
        dateStr,
        label: thShortDate(dateStr),
        isToday: dateStr === todayStr,
        count: dayAppts.length,
        discount: dayDisc,
        total: dayTotal,
        byDoctor,
      };
    });
  }, [last7Days, apptsIn7Days, data.services, data.therapists, todayStr]);

  const doctorTotals7d = useMemo(() => {
    return data.therapists.map((doc) => {
      const docAppts = apptsIn7Days.filter((a) => a.tid === doc.id);
      const revenue = docAppts.reduce(
        (sum, a) => sum + getApptTotal(a, data.services),
        0
      );
      const count = docAppts.length;
      const avg = count > 0 ? Math.round(revenue / count) : 0;
      const share =
        totalRevenue7d > 0 ? ((revenue / totalRevenue7d) * 100).toFixed(1) : '0.0';
      return { doc, count, revenue, avg, share };
    });
  }, [data.therapists, data.services, apptsIn7Days, totalRevenue7d]);

  const handleExport7Days = () => {
    exportClinicReportExcel({
      data,
      dates: last7Days,
      scope,
      fileName: `รายงานคลินิก_7วัน_${last7Days[0]}_ถึง_${last7Days[last7Days.length - 1]}`,
      reportTitle: 'สรุปรายได้ย้อนหลัง 7 วัน',
    });
  };

  const handleExportCustomRange = () => {
    if (!exportFrom || !exportTo || exportFrom > exportTo) return;
    const dates: string[] = [];
    let cursor = exportFrom;
    let safety = 0;
    while (cursor <= exportTo && safety < 366) {
      dates.push(cursor);
      cursor = addDays(cursor, 1);
      safety++;
    }
    exportClinicReportExcel({
      data,
      dates,
      scope,
      fileName: `รายงานคลินิก_${exportFrom}_ถึง_${exportTo}`,
      reportTitle: `รายงานรายได้ ${exportFrom} ถึง ${exportTo}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Control & Export Bar */}
      <section className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              แดชบอร์ดสรุปตัวเลขรายวัน ย้อนหลัง 7 วัน
            </h2>
            <p className="text-base text-slate-600 mt-0.5">
              ช่วงวันที่ {thShortDate(last7Days[0])} – {thShortDate(last7Days[6])} · แสดงตัวเลขชัดเจนครบทุกหมอ
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Revenue Scope Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setScope('active')}
                className={`px-3.5 py-2 rounded-md text-sm font-semibold transition-colors whitespace-nowrap ${
                  scope === 'active'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                นัดแล้ว + เสร็จสิ้น
              </button>
              <button
                type="button"
                onClick={() => setScope('completed')}
                className={`px-3.5 py-2 rounded-md text-sm font-semibold transition-colors whitespace-nowrap ${
                  scope === 'completed'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                เฉพาะเสร็จสิ้นแล้ว
              </button>
            </div>

            {/* Anchor Date Input */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="anchor-date"
                className="text-sm font-semibold text-slate-700 whitespace-nowrap"
              >
                ถึงวันที่:
              </label>
              <input
                id="anchor-date"
                type="date"
                value={anchorDate}
                onChange={(e) => e.target.value && setAnchorDate(e.target.value)}
                className="h-11 px-3 rounded-lg border border-slate-300 bg-white text-base font-semibold text-slate-900 tabular-nums"
              />
            </div>

            <button
              type="button"
              onClick={handleExport7Days}
              className="inline-flex items-center gap-2 px-5 h-11 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-base font-semibold whitespace-nowrap"
            >
              <FileSpreadsheet className="w-5 h-5" />
              ส่งออก Excel 7 วัน (.xlsx)
            </button>
          </div>
        </div>

        {/* 4 Large Numeric KPIs */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-base font-semibold text-slate-600">
              รายได้สุทธิรวม 7 วัน
            </div>
            <div className="text-3xl font-bold text-blue-700 tabular-nums mt-1">
              {baht(totalRevenue7d)}
            </div>
            <div className="text-sm text-slate-600 mt-1 tabular-nums">
              ก่อนหักส่วนลด {baht(totalSubtotal7d)}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-base font-semibold text-slate-600">
              จำนวนผู้รับบริการรวม 7 วัน
            </div>
            <div className="text-3xl font-bold text-slate-900 tabular-nums mt-1">
              {num(totalCases7d)} เคส
            </div>
            <div className="text-sm text-slate-600 mt-1 tabular-nums">
              เฉลี่ยวันละ {(totalCases7d / 7).toFixed(1)} เคส
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-base font-semibold text-slate-600">
              รายได้เฉลี่ยต่อเคส
            </div>
            <div className="text-3xl font-bold text-slate-900 tabular-nums mt-1">
              {baht(avgPerCase)}
            </div>
            <div className="text-sm text-slate-600 mt-1 tabular-nums">
              เฉลี่ยต่อวัน {baht(Math.round(totalRevenue7d / 7))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-base font-semibold text-slate-600">
              ส่วนลดรวม 7 วัน
            </div>
            <div className="text-3xl font-bold text-slate-900 tabular-nums mt-1">
              {baht(totalDiscount7d)}
            </div>
            <div className="text-sm text-slate-600 mt-1">
              {scope === 'completed' ? 'นับเฉพาะเคสเสร็จสิ้น' : 'รวมนัดแล้วและเสร็จสิ้น'}
            </div>
          </div>
        </div>
      </section>

      {/* Revenue Broken Down by Thai Traditional Medicine Doctor (Numeric Grid) */}
      <section className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h3 className="text-xl font-bold text-slate-900">
            สรุปรายได้แยกตามหมอแพทย์แผนไทย (ย้อนหลัง 7 วัน)
          </h3>
          <span className="text-base font-semibold text-slate-600 tabular-nums">
            รวม {data.therapists.length} ท่าน
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {doctorTotals7d.map(({ doc, count, revenue, avg, share }) => (
            <div
              key={doc.id}
              className="rounded-xl border border-slate-200 overflow-hidden bg-white"
            >
              <div
                style={{ backgroundColor: doc.color }}
                className="px-4 py-2.5 text-white flex items-center justify-between gap-2"
              >
                <span className="text-base font-bold truncate">{doc.name}</span>
                <span className="text-sm font-semibold tabular-nums shrink-0">
                  {share}%
                </span>
              </div>
              <div className="p-4 space-y-2">
                <div className="text-2xl font-bold text-slate-900 tabular-nums">
                  {baht(revenue)}
                </div>
                <div className="flex items-center justify-between text-base text-slate-700 pt-2 border-t border-slate-100 tabular-nums">
                  <span>จำนวนเคส</span>
                  <span className="font-bold">{num(count)} เคส</span>
                </div>
                <div className="flex items-center justify-between text-base text-slate-700 tabular-nums">
                  <span>เฉลี่ยต่อเคส</span>
                  <span className="font-bold">{baht(avg)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7-Day Numeric Table (No Charts/Graphs) */}
      <section className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              ตารางตัวเลขรายได้รายวัน ย้อนหลัง 7 วัน
            </h3>
            <p className="text-sm text-slate-600 mt-0.5">
              คลิกที่วันที่ในตารางเพื่อเปิดดูรายละเอียดตารางนัดของวันนั้น
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-slate-300 bg-slate-50">
                <th className="py-3.5 px-4 text-base font-bold text-slate-800 whitespace-nowrap">
                  วันที่
                </th>
                <th className="py-3.5 px-3 text-base font-bold text-slate-800 text-right whitespace-nowrap">
                  เคสรวม
                </th>
                {data.therapists.map((doc) => (
                  <th
                    key={doc.id}
                    className="py-3.5 px-3 text-base font-bold text-slate-900 text-right whitespace-nowrap"
                  >
                    <div className="inline-flex items-center justify-end gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-sm shrink-0"
                        style={{ backgroundColor: doc.color }}
                      />
                      <span>{doc.name}</span>
                    </div>
                  </th>
                ))}
                <th className="py-3.5 px-3 text-base font-bold text-slate-800 text-right whitespace-nowrap">
                  ส่วนลด
                </th>
                <th className="py-3.5 px-4 text-base font-bold text-blue-800 text-right whitespace-nowrap">
                  รายได้สุทธิรวม
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {dailyRows.map((row) => (
                <tr
                  key={row.dateStr}
                  className={`hover:bg-blue-50/60 transition-colors ${
                    row.isToday ? 'bg-blue-50/40' : ''
                  }`}
                >
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onJumpToDate(row.dateStr)}
                      className="inline-flex items-center gap-2 text-left text-base font-bold text-slate-900 hover:text-blue-700"
                    >
                      <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                      <span>{row.label}</span>
                      {row.isToday && (
                        <span className="text-sm font-bold text-blue-700">
                          · วันนี้
                        </span>
                      )}
                    </button>
                  </td>

                  <td className="py-3.5 px-3 text-right text-lg font-bold text-slate-900 tabular-nums whitespace-nowrap">
                    {num(row.count)}
                  </td>

                  {data.therapists.map((doc) => {
                    const stats = row.byDoctor.get(doc.id) || {
                      count: 0,
                      revenue: 0,
                    };
                    return (
                      <td
                        key={doc.id}
                        className="py-3.5 px-3 text-right tabular-nums whitespace-nowrap"
                      >
                        <div
                          className={`text-base font-bold ${
                            stats.revenue > 0
                              ? 'text-slate-900'
                              : 'text-slate-400'
                          }`}
                        >
                          {baht(stats.revenue)}
                        </div>
                        <div className="text-xs text-slate-500">
                          {stats.count} เคส
                        </div>
                      </td>
                    );
                  })}

                  <td className="py-3.5 px-3 text-right text-base text-slate-700 tabular-nums whitespace-nowrap">
                    {baht(row.discount)}
                  </td>

                  <td className="py-3.5 px-4 text-right text-xl font-bold text-blue-700 tabular-nums whitespace-nowrap">
                    {baht(row.total)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-300 bg-slate-100">
                <td className="py-4 px-4 text-lg font-bold text-slate-900 whitespace-nowrap">
                  รวมทั้งหมด 7 วัน
                </td>
                <td className="py-4 px-3 text-right text-xl font-bold text-slate-900 tabular-nums whitespace-nowrap">
                  {num(totalCases7d)}
                </td>
                {doctorTotals7d.map(({ doc, count, revenue }) => (
                  <td
                    key={doc.id}
                    className="py-4 px-3 text-right tabular-nums whitespace-nowrap"
                  >
                    <div className="text-lg font-bold text-slate-900">
                      {baht(revenue)}
                    </div>
                    <div className="text-xs font-semibold text-slate-600">
                      {num(count)} เคส
                    </div>
                  </td>
                ))}
                <td className="py-4 px-3 text-right text-lg font-bold text-slate-800 tabular-nums whitespace-nowrap">
                  {baht(totalDiscount7d)}
                </td>
                <td className="py-4 px-4 text-right text-2xl font-bold text-blue-800 tabular-nums whitespace-nowrap">
                  {baht(totalRevenue7d)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* Custom Date Range Excel Export */}
      <section className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              ส่งออกรายงานสรุปเป็นไฟล์ Excel ตามช่วงวันที่ต้องการ
            </h3>
            <p className="text-base text-slate-600 mt-0.5">
              ไฟล์ .xlsx ประกอบด้วย 3 ชีท: สรุปรายวัน, สรุปแยกตามหมอแพทย์แผนไทย และรายการนัดหมายทั้งหมด
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label
                htmlFor="exp-from"
                className="block text-sm font-semibold text-slate-700 mb-1"
              >
                ตั้งแต่วันที่
              </label>
              <input
                id="exp-from"
                type="date"
                value={exportFrom}
                onChange={(e) => setExportFrom(e.target.value)}
                className="h-11 px-3 rounded-lg border border-slate-300 bg-white text-base font-semibold text-slate-900 tabular-nums"
              />
            </div>
            <div>
              <label
                htmlFor="exp-to"
                className="block text-sm font-semibold text-slate-700 mb-1"
              >
                ถึงวันที่
              </label>
              <input
                id="exp-to"
                type="date"
                value={exportTo}
                onChange={(e) => setExportTo(e.target.value)}
                className="h-11 px-3 rounded-lg border border-slate-300 bg-white text-base font-semibold text-slate-900 tabular-nums"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                const now = new Date();
                const start = new Date(now.getFullYear(), now.getMonth(), 1);
                const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                setExportFrom(ymd(start));
                setExportTo(ymd(end));
              }}
              className="h-11 px-4 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-base font-semibold text-slate-800 whitespace-nowrap"
            >
              เลือกทั้งเดือนนี้
            </button>

            <button
              type="button"
              onClick={handleExportCustomRange}
              disabled={!exportFrom || !exportTo || exportFrom > exportTo}
              className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-base font-semibold whitespace-nowrap"
            >
              <FileSpreadsheet className="w-5 h-5" />
              ดาวน์โหลดไฟล์ Excel
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
