import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { utcToISODate } from "@/lib/dates";
import { toCsv } from "@/lib/csv";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  const user = await prisma.adminUser.findUnique({ where: { id: session.sub } });
  if (!user) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const type = new URL(request.url).searchParams.get("type") === "inquiries" ? "inquiries" : "bookings";

  if (type === "inquiries") {
    const inquiries = await prisma.businessInquiry.findMany({ orderBy: { createdAt: "desc" } });
    const csv = toCsv(
      [
        "reference",
        "status",
        "businessName",
        "businessType",
        "contactName",
        "email",
        "phone",
        "location",
        "estimatedKnives",
        "frequency",
        "needsPickup",
        "message",
        "adminNotes",
        "createdAt",
      ],
      inquiries.map((row) => [
        row.reference,
        row.status,
        row.businessName,
        row.businessType,
        row.contactName,
        row.email,
        row.phone,
        row.address ?? "",
        row.estimatedKnives ?? "",
        row.frequency ?? "",
        row.needsPickup ? "yes" : "no",
        row.message ?? "",
        row.adminNotes ?? "",
        row.createdAt.toISOString(),
      ]),
    );
    return csvResponse(csv, "knivpojkarna-inquiries.csv");
  }

  const bookings = await prisma.booking.findMany({ orderBy: { createdAt: "desc" } });
  const csv = toCsv(
    [
      "reference",
      "status",
      "package",
      "knives",
      "service",
      "address",
      "postalCode",
      "area",
      "inServiceArea",
      "preferredDate",
      "preferredSlot",
      "scheduledDate",
      "pickupNotes",
      "name",
      "email",
      "phone",
      "comments",
      "adminNotes",
      "estimateEUR",
      "createdAt",
    ],
    bookings.map((b) => [
      b.reference,
      b.status,
      b.packageName,
      b.knifeCount,
      b.serviceType,
      b.addressLine ?? "",
      b.postalCode ?? "",
      b.areaName ?? "",
      b.inServiceArea ? "yes" : "no",
      b.preferredDate ? utcToISODate(b.preferredDate) : "",
      b.preferredTimeSlot ?? "",
      b.scheduledDate ? utcToISODate(b.scheduledDate) : "",
      b.pickupNotes ?? "",
      b.customerName,
      b.email,
      b.phone,
      b.comments ?? "",
      b.adminNotes ?? "",
      (b.estimatedTotalCents / 100).toFixed(2),
      b.createdAt.toISOString(),
    ]),
  );
  return csvResponse(csv, "knivpojkarna-bookings.csv");
}

function csvResponse(body: string, filename: string) {
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
