import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/../auth";
import { z } from "zod";

const updateSchema = z.object({
  message: z.string().min(1, "Update message is required"),
  newStatus: z.enum(["PENDING", "IN_PROGRESS", "SCHEDULED", "COMPLETED"]).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { message, newStatus } = updateSchema.parse(body);

    const issue = await prisma.issue.findUnique({ where: { id } });
    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.comment.create({
        data: {
          issueId: id,
          authorId: session.user!.id,
          body: message,
        },
      });

      if (newStatus && newStatus !== issue.status) {
        await tx.issue.update({
          where: { id },
          data: { status: newStatus },
        });
      }
    });

    const updatedIssue = await prisma.issue.findUnique({
      where: { id },
      include: {
        comments: {
          include: {
            author: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        media: true,
        workOrders: true,
      },
    });

    return NextResponse.json(updatedIssue);
  } catch (error) {
    console.error("Error posting workshop update:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to post update" },
      { status: 500 }
    );
  }
}
