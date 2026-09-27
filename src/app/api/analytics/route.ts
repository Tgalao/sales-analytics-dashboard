import { NextResponse, type NextRequest } from "next/server";
import { getAnalytics } from "@/lib/analytics";
import { addDays, daysBetween, isIsoDate, toIsoDate } from "@/lib/dates";

export const dynamic = "force-dynamic";

const MAX_RANGE_DAYS = 366 * 10;

// GET /api/analytics?from=YYYY-MM-DD&to=YYYY-MM-DD
// Both dates are inclusive. Defaults to the last 12 months.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const to = params.get("to") ?? toIsoDate(new Date());
  const from = params.get("from") ?? addDays(to, -364);

  if (!isIsoDate(from) || !isIsoDate(to)) {
    return NextResponse.json({ error: "`from` and `to` must be dates in YYYY-MM-DD format." }, { status: 400 });
  }
  if (from > to) {
    return NextResponse.json({ error: "`from` must be on or before `to`." }, { status: 400 });
  }
  if (daysBetween(from, to) > MAX_RANGE_DAYS) {
    return NextResponse.json({ error: "Date range is limited to 10 years." }, { status: 400 });
  }

  try {
    return NextResponse.json(await getAnalytics({ from, to }));
  } catch (error) {
    console.error("Failed to load analytics", error);
    return NextResponse.json({ error: "Could not load analytics. Is the database running and seeded?" }, { status: 500 });
  }
}
