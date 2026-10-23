import ExcelJS from "exceljs";
import { prisma } from "./db";
import { GRADE_LEVEL_LABELS, TUTOR_APPROVAL_LABELS } from "./constants";

async function toBuffer(workbook: ExcelJS.Workbook) {
  const buf = await workbook.xlsx.writeBuffer();
  return Buffer.from(buf);
}

export async function buildUsersWorkbook() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Users");
  sheet.columns = [
    { header: "ชื่อ", key: "name", width: 28 },
    { header: "อีเมล", key: "email", width: 28 },
    { header: "เบอร์โทร", key: "phone", width: 16 },
    { header: "LINE ID", key: "lineId", width: 18 },
    { header: "Role", key: "role", width: 12 },
    { header: "สถานะ", key: "active", width: 12 },
    { header: "สมัครเมื่อ", key: "createdAt", width: 20 },
  ];
  for (const u of users) {
    sheet.addRow({
      name: u.name,
      email: u.email,
      phone: u.phone ?? "",
      lineId: u.lineId ?? "",
      role: u.role,
      active: u.active ? "ใช้งานอยู่" : "ปิดใช้งาน",
      createdAt: u.createdAt.toISOString(),
    });
  }
  sheet.getRow(1).font = { bold: true };
  return toBuffer(workbook);
}

export async function buildTutorsWorkbook() {
  const tutors = await prisma.tutorProfile.findMany({
    include: { user: true, subjects: { include: { subject: true } } },
    orderBy: { createdAt: "desc" },
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Tutors");
  sheet.columns = [
    { header: "ชื่อ", key: "name", width: 28 },
    { header: "อีเมล", key: "email", width: 28 },
    { header: "เบอร์โทร", key: "phone", width: 16 },
    { header: "LINE ID", key: "lineId", width: 18 },
    { header: "จังหวัด", key: "province", width: 16 },
    { header: "เขต/อำเภอ", key: "district", width: 16 },
    { header: "วิชาที่สอน", key: "subjects", width: 40 },
    { header: "ราคาต่ำสุด", key: "rateMin", width: 12 },
    { header: "ราคาสูงสุด", key: "rateMax", width: 12 },
    { header: "สถานะอนุมัติ", key: "status", width: 16 },
    { header: "สมัครเมื่อ", key: "createdAt", width: 20 },
  ];
  for (const t of tutors) {
    sheet.addRow({
      name: t.user.name,
      email: t.user.email,
      phone: t.user.phone ?? "",
      lineId: t.user.lineId ?? "",
      province: t.province,
      district: t.district ?? "",
      subjects: t.subjects
        .map((s) => `${s.subject.name} (${GRADE_LEVEL_LABELS[s.level]})`)
        .join(", "),
      rateMin: t.hourlyRateMin.toString(),
      rateMax: t.hourlyRateMax.toString(),
      status: TUTOR_APPROVAL_LABELS[t.approvalStatus],
      createdAt: t.createdAt.toISOString(),
    });
  }
  sheet.getRow(1).font = { bold: true };
  return toBuffer(workbook);
}

export async function buildRequestsWorkbook() {
  const requests = await prisma.learningRequest.findMany({
    include: { parent: true, tutor: true, subject: true },
    orderBy: { createdAt: "desc" },
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Requests");
  sheet.columns = [
    { header: "ผู้ปกครอง", key: "parentName", width: 24 },
    { header: "อีเมลผู้ปกครอง", key: "parentEmail", width: 26 },
    { header: "ติวเตอร์", key: "tutorName", width: 24 },
    { header: "อีเมลติวเตอร์", key: "tutorEmail", width: 26 },
    { header: "วิชา", key: "subject", width: 20 },
    { header: "ระดับชั้น", key: "level", width: 14 },
    { header: "ราคาเริ่มต้น", key: "originalPrice", width: 12 },
    { header: "ราคาล่าสุด", key: "proposedPrice", width: 12 },
    { header: "สถานะ", key: "status", width: 14 },
    { header: "สร้างเมื่อ", key: "createdAt", width: 20 },
    { header: "อัปเดตล่าสุด", key: "updatedAt", width: 20 },
  ];
  for (const r of requests) {
    sheet.addRow({
      parentName: r.parent.name,
      parentEmail: r.parent.email,
      tutorName: r.tutor.name,
      tutorEmail: r.tutor.email,
      subject: r.subject.name,
      level: GRADE_LEVEL_LABELS[r.level],
      originalPrice: r.originalPrice.toString(),
      proposedPrice: r.proposedPrice.toString(),
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    });
  }
  sheet.getRow(1).font = { bold: true };
  return toBuffer(workbook);
}
