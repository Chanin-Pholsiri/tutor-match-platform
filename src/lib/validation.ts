import { z } from "zod";
import { GRADE_LEVELS, THAI_PROVINCES } from "./constants";

const email = z.email({ message: "อีเมลไม่ถูกต้อง" });
const password = z
  .string()
  .min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
const name = z.string().trim().min(1, "กรุณากรอกชื่อ");
const phone = z
  .string()
  .trim()
  .regex(/^0\d{8,9}$/, "เบอร์โทรไม่ถูกต้อง")
  .optional()
  .or(z.literal(""));
const lineId = z.string().trim().max(50).optional().or(z.literal(""));

export const registerParentSchema = z.object({
  name,
  email,
  phone,
  password,
  lineId,
});

export const registerTutorSchema = z.object({
  name,
  email,
  phone,
  password,
  lineId,
  province: z.enum(THAI_PROVINCES as unknown as [string, ...string[]]),
  district: z.string().trim().max(100).optional().or(z.literal("")),
  bio: z.string().trim().max(2000).optional().or(z.literal("")),
  teachingHistory: z.string().trim().max(2000).optional().or(z.literal("")),
  hourlyRateMin: z.coerce.number().min(0).max(100000),
  hourlyRateMax: z.coerce.number().min(0).max(100000),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
});

export const tutorProfileSchema = z.object({
  bio: z.string().trim().max(2000).optional().or(z.literal("")),
  teachingHistory: z.string().trim().max(2000).optional().or(z.literal("")),
  province: z.enum(THAI_PROVINCES as unknown as [string, ...string[]]),
  district: z.string().trim().max(100).optional().or(z.literal("")),
  hourlyRateMin: z.coerce.number().min(0).max(100000),
  hourlyRateMax: z.coerce.number().min(0).max(100000),
  lineId: lineId,
  subjects: z
    .array(
      z.object({
        subjectId: z.string().min(1),
        level: z.enum(GRADE_LEVELS as unknown as [string, ...string[]]),
      }),
    )
    .min(1, "กรุณาเลือกอย่างน้อย 1 วิชา"),
});

export const learningRequestSchema = z.object({
  tutorId: z.string().min(1),
  subjectId: z.string().min(1),
  level: z.enum(GRADE_LEVELS as unknown as [string, ...string[]]),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
  proposedPrice: z.coerce.number().min(1).max(1000000),
});

export const counterOfferSchema = z.object({
  requestId: z.string().min(1),
  proposedPrice: z.coerce.number().min(1).max(1000000),
  note: z.string().trim().max(500).optional().or(z.literal("")),
});

export const rejectTutorSchema = z.object({
  tutorProfileId: z.string().min(1),
  rejectionReason: z.string().trim().min(1, "กรุณาระบุเหตุผล").max(1000),
});

export const reviewSchema = z.object({
  requestId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const jobPostSchema = z
  .object({
    subjectId: z.string().min(1, "กรุณาเลือกวิชา"),
    level: z.enum(GRADE_LEVELS as unknown as [string, ...string[]]),
    province: z.enum(THAI_PROVINCES as unknown as [string, ...string[]]),
    district: z.string().trim().max(100).optional().or(z.literal("")),
    startDate: z.iso.date({ message: "กรุณาระบุวันที่เริ่ม" }),
    endDate: z.iso.date({ message: "กรุณาระบุวันที่สิ้นสุด" }),
    schedule: z.string().trim().max(300).optional().or(z.literal("")),
    budgetMin: z.coerce.number().min(0).max(100000).optional(),
    budgetMax: z.coerce.number().min(0).max(100000).optional(),
    description: z.string().trim().max(2000).optional().or(z.literal("")),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: "วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่ม",
    path: ["endDate"],
  });

export const jobProposalSchema = z.object({
  jobPostId: z.string().min(1),
  message: z.string().trim().min(1, "กรุณาแนะนำตัวสั้น ๆ").max(1000),
  proposedPrice: z.coerce.number().min(1).max(1000000),
});
