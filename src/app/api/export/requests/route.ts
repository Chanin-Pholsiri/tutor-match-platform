import { getSession } from "@/lib/auth";
import { buildRequestsWorkbook } from "@/lib/export";

export async function GET() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return new Response(null, { status: 403 });
  }

  const buffer = await buildRequestsWorkbook();
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="requests-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}
