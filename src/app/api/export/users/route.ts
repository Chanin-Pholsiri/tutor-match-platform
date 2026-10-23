import { getSession } from "@/lib/auth";
import { buildUsersWorkbook } from "@/lib/export";

export async function GET() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return new Response(null, { status: 403 });
  }

  const buffer = await buildUsersWorkbook();
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="users-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}
