import { NextResponse } from "next/server";

function isAuthorized(req: Request) {
  const expected = process.env.AUTOMATION_SECRET;
  if (!expected) return false;
  return req.headers.get("authorization") === `Bearer ${expected}`;
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }

  return NextResponse.json({
    ok: true,
    suspended: 0,
    generatedRecurring: 0,
    lowBudgetNotified: 0,
  });
}
