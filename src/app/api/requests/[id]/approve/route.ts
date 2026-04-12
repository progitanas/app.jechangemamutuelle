import { NextResponse } from "next/server";
import { requireOrganizationRole } from "@/lib/organization";

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireOrganizationRole(["OWNER", "MANAGER"]);
    const { id } = await params;
    return NextResponse.json(
      {
        error: "Approbation campagne temporairement indisponible",
        requestId: id,
      },
      { status: 501 },
    );
  } catch {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }
}
