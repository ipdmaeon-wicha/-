import * as XLSX from 'xlsx';
import {
  Appointment,
  ClinicData,
  RevenueScope,
} from '../types';
import { hm, thShortDate, tm } from './date';
import {
  getApptDuration,
  getApptSubtotal,
  getApptTotal,
  isApptCounted,
  sortApptsByTime,
} from './storage';

function fitColumnWidths(rows: Record<string, string | number>[]): XLSX.ColInfo[] {
  if (!rows.length) return [];
  const keys = Object.keys(rows[0]);
  return keys.map((key) => {
    let maxLen = key.length + 4;
    for (const row of rows) {
      const val = String(row[key] ?? '');
      if (val.length + 3 > maxLen) {
        maxLen = val.length + 3;
      }
    }
    return { wch: Math.min(Math.max(maxLen, 12), 45) };
  });
}

export function exportClinicReportExcel(options: {
  data: ClinicData;
  dates: string[];
  scope: RevenueScope;
  fileName: string;
  reportTitle: string;
}): void {
  const { data, dates, scope, fileName } = options;
  const dateSet = new Set(dates);

  const filteredAppts = data.appts
    .filter((a) => dateSet.has(a.date))
    .sort(sortApptsByTime);

  const countedAppts = filteredAppts.filter((a) => isApptCounted(a, scope));

  // Sheet 1: Daily Summary
  const dailyRows: Record<string, string | number>[] = dates.map((d) => {
    const dayAppts = countedAppts.filter((a) => a.date === d);
    const row: Record<string, string | number> = {
      'วันที่': d,
      'วัน/เดือน/ปี (พ.ศ.)': thShortDate(d),
      'จำนวนเคสทั้งหมด': dayAppts.length,
    };

    for (const doc of data.therapists) {
      const docAppts = dayAppts.filter((a) => a.tid === doc.id);
      const docRev = docAppts.reduce(
        (sum, a) => sum + getApptTotal(a, data.services),
        0
      );
      row[`${doc.name} (บาท)`] = docRev;
      row[`${doc.name} (เคส)`] = docAppts.length;
    }

    const subtotal = dayAppts.reduce(
      (sum, a) => sum + getApptSubtotal(a, data.services),
      0
    );
    const disc = dayAppts.reduce((sum, a) => sum + Number(a.disc || 0), 0);
    const total = dayAppts.reduce(
      (sum, a) => sum + getApptTotal(a, data.services),
      0
    );

    row['ค่าบริการก่อนหักส่วนลด (บาท)'] = subtotal;
    row['ส่วนลดรวม (บาท)'] = disc;
    row['รายได้สุทธิรวม (บาท)'] = total;
    return row;
  });

  // Grand total row for Sheet 1
  const totalRow: Record<string, string | number> = {
    'วันที่': 'รวมทั้งหมด',
    'วัน/เดือน/ปี (พ.ศ.)': `${dates.length} วัน`,
    'จำนวนเคสทั้งหมด': countedAppts.length,
  };
  for (const doc of data.therapists) {
    const docAppts = countedAppts.filter((a) => a.tid === doc.id);
    totalRow[`${doc.name} (บาท)`] = docAppts.reduce(
      (sum, a) => sum + getApptTotal(a, data.services),
      0
    );
    totalRow[`${doc.name} (เคส)`] = docAppts.length;
  }
  totalRow['ค่าบริการก่อนหักส่วนลด (บาท)'] = countedAppts.reduce(
    (sum, a) => sum + getApptSubtotal(a, data.services),
    0
  );
  totalRow['ส่วนลดรวม (บาท)'] = countedAppts.reduce(
    (sum, a) => sum + Number(a.disc || 0),
    0
  );
  totalRow['รายได้สุทธิรวม (บาท)'] = countedAppts.reduce(
    (sum, a) => sum + getApptTotal(a, data.services),
    0
  );
  dailyRows.push(totalRow);

  // Sheet 2: Doctor Summary
  const grandTotal = countedAppts.reduce(
    (sum, a) => sum + getApptTotal(a, data.services),
    0
  );

  const doctorRows: Record<string, string | number>[] = data.therapists.map((doc) => {
    const docAppts = countedAppts.filter((a) => a.tid === doc.id);
    const docSub = docAppts.reduce(
      (sum, a) => sum + getApptSubtotal(a, data.services),
      0
    );
    const docDisc = docAppts.reduce((sum, a) => sum + Number(a.disc || 0), 0);
    const docTotal = docAppts.reduce(
      (sum, a) => sum + getApptTotal(a, data.services),
      0
    );
    const avg = docAppts.length ? Math.round(docTotal / docAppts.length) : 0;
    const share = grandTotal > 0 ? Number(((docTotal / grandTotal) * 100).toFixed(1)) : 0;

    return {
      'ชื่อหมอแพทย์แผนไทย': doc.name,
      'ความเชี่ยวชาญ': doc.specialty || '-',
      'จำนวนเคส': docAppts.length,
      'ค่าบริการรวม (บาท)': docSub,
      'ส่วนลด (บาท)': docDisc,
      'รายได้สุทธิ (บาท)': docTotal,
      'เฉลี่ยต่อเคส (บาท)': avg,
      'สัดส่วนรายได้ (%)': share,
    };
  });

  doctorRows.push({
    'ชื่อหมอแพทย์แผนไทย': 'รวมทั้งหมด',
    'ความเชี่ยวชาญ': '-',
    'จำนวนเคส': countedAppts.length,
    'ค่าบริการรวม (บาท)': countedAppts.reduce(
      (sum, a) => sum + getApptSubtotal(a, data.services),
      0
    ),
    'ส่วนลด (บาท)': countedAppts.reduce(
      (sum, a) => sum + Number(a.disc || 0),
      0
    ),
    'รายได้สุทธิ (บาท)': grandTotal,
    'เฉลี่ยต่อเคส (บาท)': countedAppts.length
      ? Math.round(grandTotal / countedAppts.length)
      : 0,
    'สัดส่วนรายได้ (%)': grandTotal > 0 ? 100 : 0,
  });

  // Sheet 3: Appointment Details
  const detailRows: Record<string, string | number>[] = filteredAppts.map((a: Appointment) => {
    const patient = data.patients.find((p) => p.id === a.pid);
    const doctor = data.therapists.find((t) => t.id === a.tid);
    const duration = getApptDuration(a, data.services);
    const endTime = hm(tm(a.time) + duration);
    const serviceNames = a.sids
      .map((sid) => data.services.find((s) => s.id === sid)?.name || '(บริการที่ลบแล้ว)')
      .join(', ');

    return {
      'วันที่': a.date,
      'วัน/เดือน/ปี (พ.ศ.)': thShortDate(a.date),
      'เวลาเริ่ม': a.time,
      'เวลาสิ้นสุด': endTime,
      'ระยะเวลา (นาที)': duration,
      'ชื่อผู้ป่วย': patient?.name || '(ลบแล้ว)',
      'เบอร์โทร': patient?.phone || '-',
      'หมอแพทย์แผนไทย': doctor?.name || '(ลบแล้ว)',
      'ประเภทการให้บริการ': serviceNames,
      'ค่าบริการ (บาท)': getApptSubtotal(a, data.services),
      'ส่วนลด (บาท)': Number(a.disc || 0),
      'ยอดสุทธิ (บาท)': a.status === 'ยกเลิก' ? 0 : getApptTotal(a, data.services),
      'สถานะ': a.status,
      'หมายเหตุ': a.note || '-',
    };
  });

  const wb = XLSX.utils.book_new();

  const wsDaily = XLSX.utils.json_to_sheet(dailyRows);
  wsDaily['!cols'] = fitColumnWidths(dailyRows);
  XLSX.utils.book_append_sheet(wb, wsDaily, 'สรุปรายวัน');

  const wsDoc = XLSX.utils.json_to_sheet(doctorRows);
  wsDoc['!cols'] = fitColumnWidths(doctorRows);
  XLSX.utils.book_append_sheet(wb, wsDoc, 'สรุปแยกตามหมอ');

  const wsDetail = XLSX.utils.json_to_sheet(
    detailRows.length
      ? detailRows
      : [
          {
            'หมายเหตุ': 'ไม่มีรายการนัดหมายในช่วงวันที่ที่เลือก',
          },
        ]
  );
  wsDetail['!cols'] = fitColumnWidths(detailRows.length ? detailRows : [{ 'หมายเหตุ': 'ไม่มีรายการนัดหมายในช่วงวันที่ที่เลือก' }]);
  XLSX.utils.book_append_sheet(wb, wsDetail, 'รายการนัดหมาย');

  XLSX.writeFile(wb, `${fileName}.xlsx`);
}
