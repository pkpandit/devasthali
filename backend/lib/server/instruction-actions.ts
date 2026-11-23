"use server";

import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { prisma } from "@/lib/server/prisma";
import { requireRole } from "@/lib/server/auth";
import { recordAuditEvent } from "@/lib/server/audit";
import { slugify } from "@/lib/server/slug";
import {
  generalInstructionCreateSchema,
  generalInstructionUpdateSchema,
  generalInstructionDeleteSchema,
  toggleGeneralInstructionStatusSchema,
  reorderGeneralInstructionsSchema,
  instructionOverviewUpdateSchema,
  computeInstructionDiff,
} from "@/lib/validation/instructions";

export interface InstructionActionState<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

async function getClientIp(): Promise<string> {
  try {
    const headerList = await headers();
    const forwardedFor = headerList.get("x-forwarded-for");
    if (forwardedFor) {
      return forwardedFor.split(",")[0].trim();
    }
    return headerList.get("x-real-ip") || "127.0.0.1";
  } catch {
    return "127.0.0.1";
  }
}

function triggerInstructionRevalidation() {
  revalidateTag("instructions", "max");
  revalidatePath("/admin/students-parents/instructions");
}

async function generateUniqueInstructionSlug(ruleText: string, excludeId?: string): Promise<string> {
  const words = ruleText.trim().split(/\s+/).slice(0, 6).join(" ");
  const baseSlug = slugify(words) || "instruction-rule";

  const existing = await prisma.generalInstruction.findMany({
    where: {
      slug: { startsWith: baseSlug },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { slug: true },
  });

  const existingSlugs = new Set(existing.map((s) => s.slug));
  if (!existingSlugs.has(baseSlug)) return baseSlug;

  let counter = 2;
  while (existingSlugs.has(`${baseSlug}-${counter}`)) {
    counter++;
  }
  return `${baseSlug}-${counter}`;
}

// ==========================================
// 1. GENERAL INSTRUCTION ACTIONS
// ==========================================

export async function createGeneralInstructionAction(
  rawInput: unknown
): Promise<InstructionActionState<{ id: string; slug: string }>> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parsed = generalInstructionCreateSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const slug = await generateUniqueInstructionSlug(parsed.data.ruleText);

    let displayOrder = parsed.data.displayOrder;
    if (displayOrder === 0) {
      const maxOrder = await prisma.generalInstruction.aggregate({
        _max: { displayOrder: true },
      });
      displayOrder = (maxOrder._max.displayOrder ?? 0) + 1;
    }

    const created = await prisma.$transaction(async (tx) => {
      const inst = await tx.generalInstruction.create({
        data: {
          slug,
          ruleText: parsed.data.ruleText,
          category: parsed.data.category,
          isCritical: parsed.data.isCritical,
          displayOrder,
          isPublished: parsed.data.isPublished,
        },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "INSTRUCTION_CREATED",
          entityType: "GeneralInstruction",
          entityId: inst.id,
          metadata: {
            slug: inst.slug,
            category: inst.category,
            isCritical: inst.isCritical,
            displayOrder: inst.displayOrder,
          },
          ipAddress: clientIp,
        },
        tx
      );

      return inst;
    });

    triggerInstructionRevalidation();

    return {
      success: true,
      data: { id: created.id, slug: created.slug },
    };
  } catch (err: unknown) {
    console.error("[createGeneralInstructionAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create instruction.",
    };
  }
}

export async function updateGeneralInstructionAction(
  rawInput: unknown
): Promise<InstructionActionState<{ id: string; slug: string }>> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parsed = generalInstructionUpdateSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const current = await prisma.generalInstruction.findUnique({
      where: { id: parsed.data.id },
    });

    if (!current) {
      return { success: false, error: "General instruction not found." };
    }

    const updatePayload: Record<string, unknown> = {};
    if (parsed.data.ruleText !== undefined) updatePayload.ruleText = parsed.data.ruleText;
    if (parsed.data.category !== undefined) updatePayload.category = parsed.data.category;
    if (parsed.data.isCritical !== undefined) updatePayload.isCritical = parsed.data.isCritical;
    if (parsed.data.displayOrder !== undefined) updatePayload.displayOrder = parsed.data.displayOrder;
    if (parsed.data.isPublished !== undefined) updatePayload.isPublished = parsed.data.isPublished;

    const diff = computeInstructionDiff(
      current as unknown as Record<string, unknown>,
      updatePayload
    );

    const updated = await prisma.$transaction(async (tx) => {
      const inst = await tx.generalInstruction.update({
        where: { id: current.id },
        data: updatePayload,
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "INSTRUCTION_UPDATED",
          entityType: "GeneralInstruction",
          entityId: inst.id,
          metadata: { diff },
          ipAddress: clientIp,
        },
        tx
      );

      return inst;
    });

    triggerInstructionRevalidation();

    return {
      success: true,
      data: { id: updated.id, slug: updated.slug },
    };
  } catch (err: unknown) {
    console.error("[updateGeneralInstructionAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update instruction.",
    };
  }
}

export async function deleteGeneralInstructionAction(
  rawInput: unknown
): Promise<InstructionActionState<{ id: string }>> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parsed = generalInstructionDeleteSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const current = await prisma.generalInstruction.findUnique({
      where: { id: parsed.data.id },
    });

    if (!current) {
      return { success: false, error: "General instruction not found." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.generalInstruction.delete({
        where: { id: current.id },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "INSTRUCTION_DELETED",
          entityType: "GeneralInstruction",
          entityId: current.id,
          metadata: { slug: current.slug, category: current.category },
          ipAddress: clientIp,
        },
        tx
      );
    });

    triggerInstructionRevalidation();

    return {
      success: true,
      data: { id: current.id },
    };
  } catch (err: unknown) {
    console.error("[deleteGeneralInstructionAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete instruction.",
    };
  }
}

export async function toggleGeneralInstructionStatusAction(
  rawInput: unknown
): Promise<InstructionActionState<{ id: string; isPublished: boolean }>> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parsed = toggleGeneralInstructionStatusSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const current = await prisma.generalInstruction.findUnique({
      where: { id: parsed.data.id },
    });

    if (!current) {
      return { success: false, error: "General instruction not found." };
    }

    const nextPublished = !current.isPublished;

    const updated = await prisma.$transaction(async (tx) => {
      const inst = await tx.generalInstruction.update({
        where: { id: current.id },
        data: { isPublished: nextPublished },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "INSTRUCTION_TOGGLED",
          entityType: "GeneralInstruction",
          entityId: inst.id,
          metadata: { from: current.isPublished, to: nextPublished },
          ipAddress: clientIp,
        },
        tx
      );

      return inst;
    });

    triggerInstructionRevalidation();

    return {
      success: true,
      data: { id: updated.id, isPublished: updated.isPublished },
    };
  } catch (err: unknown) {
    console.error("[toggleGeneralInstructionStatusAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to toggle instruction status.",
    };
  }
}

export async function reorderGeneralInstructionsAction(
  rawInput: unknown
): Promise<InstructionActionState<null>> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parsed = reorderGeneralInstructionsSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < parsed.data.orderedIds.length; i++) {
        const id = parsed.data.orderedIds[i];
        await tx.generalInstruction.update({
          where: { id },
          data: { displayOrder: i + 1 },
        });
      }

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "INSTRUCTIONS_REORDERED",
          entityType: "GeneralInstruction",
          entityId: "bulk-reorder",
          metadata: { orderedIds: parsed.data.orderedIds },
          ipAddress: clientIp,
        },
        tx
      );
    });

    triggerInstructionRevalidation();

    return {
      success: true,
      data: null,
    };
  } catch (err: unknown) {
    console.error("[reorderGeneralInstructionsAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to reorder instructions.",
    };
  }
}

// ==========================================
// 2. INSTRUCTION OVERVIEW ACTIONS
// ==========================================

export async function updateInstructionOverviewAction(
  rawInput: unknown
): Promise<InstructionActionState<{ id: string }>> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parsed = instructionOverviewUpdateSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const current = await prisma.instructionOverview.findUnique({
      where: { id: "default" },
    });

    const diff = computeInstructionDiff(
      (current as unknown as Record<string, unknown>) || {},
      parsed.data as Record<string, unknown>
    );

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.instructionOverview.upsert({
        where: { id: "default" },
        update: {
          badgeText: parsed.data.badgeText ?? null,
          title: parsed.data.title ?? null,
          subtitle: parsed.data.subtitle ?? null,
          cardTitle: parsed.data.cardTitle ?? null,
          cardSubtitle: parsed.data.cardSubtitle ?? null,
        },
        create: {
          id: "default",
          badgeText: parsed.data.badgeText ?? null,
          title: parsed.data.title ?? null,
          subtitle: parsed.data.subtitle ?? null,
          cardTitle: parsed.data.cardTitle ?? null,
          cardSubtitle: parsed.data.cardSubtitle ?? null,
        },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "INSTRUCTION_OVERVIEW_UPDATED",
          entityType: "InstructionOverview",
          entityId: "default",
          metadata: { diff },
          ipAddress: clientIp,
        },
        tx
      );

      return result;
    });

    triggerInstructionRevalidation();

    return {
      success: true,
      data: { id: updated.id },
    };
  } catch (err: unknown) {
    console.error("[updateInstructionOverviewAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update instruction overview.",
    };
  }
}
