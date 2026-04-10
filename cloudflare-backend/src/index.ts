import { Hono } from "hono";
import { cors } from "hono/cors";
import { z } from "zod";

type Env = {
  Bindings: {
    DB: D1Database;
    CORS_ORIGIN: string;
    API_TOKEN?: string;
  };
};

const createCampaignSchema = z.object({
  customerId: z.string().min(3),
  campaignName: z.string().min(3),
  needType: z.string().min(2),
  requestedLeads: z.number().int().min(1),
  geoArea: z.string().min(2),
  targetSegment: z.string().min(2),
  qualityLevel: z.string().min(2),
  isExclusive: z.boolean().default(false),
  budgetMax: z.number().int().min(1),
  maxPricePerLead: z.number().int().min(1),
  quotaRequested: z.number().int().min(1),
});

const rejectLeadSchema = z.object({
  campaignId: z.string().min(3),
  leadExternalId: z.string().min(3),
  reason: z.enum([
    "HORS_CIBLE",
    "NUMERO_INJOIGNABLE",
    "EMAIL_INVALIDE",
    "DOUBLON",
    "BUDGET_INCOMPATIBLE",
    "DELAI_DEPASSE",
    "AUTRE",
  ]),
  details: z.string().max(500).optional(),
});

const app = new Hono<Env>();

app.use("*", async (c, next) => {
  const publicPaths = ["/health"];
  if (publicPaths.includes(c.req.path)) {
    await next();
    return;
  }

  const expectedToken = c.env.API_TOKEN;
  if (!expectedToken) {
    await next();
    return;
  }

  const header = c.req.header("authorization");
  if (header !== `Bearer ${expectedToken}`) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  await next();
});

app.use(
  "*",
  cors({
    origin: (origin, c) => {
      const allowed = c.env.CORS_ORIGIN;
      return origin && origin === allowed ? origin : allowed;
    },
    allowMethods: ["GET", "POST", "PATCH", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

app.get("/health", (c) => c.json({ ok: true, service: "jmm-backend" }));

app.post("/v1/campaigns", async (c) => {
  const payload = await c.req.json();
  const parsed = createCampaignSchema.safeParse(payload);
  if (!parsed.success) {
    return c.json({ error: "Invalid payload", details: parsed.error.flatten() }, 400);
  }

  const id = crypto.randomUUID();
  const estimatedCost = parsed.data.requestedLeads * parsed.data.maxPricePerLead;
  const feasibilityScore = Math.max(
    20,
    Math.min(98, Math.round((parsed.data.budgetMax / Math.max(1, estimatedCost)) * 100)),
  );

  await c.env.DB.prepare(
    `INSERT INTO campaigns (
      id, customer_id, campaign_name, need_type, requested_leads,
      geo_area, target_segment, quality_level, is_exclusive,
      budget_max, max_price_per_lead, quota_requested, estimated_cost, feasibility_score
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      parsed.data.customerId,
      parsed.data.campaignName,
      parsed.data.needType,
      parsed.data.requestedLeads,
      parsed.data.geoArea,
      parsed.data.targetSegment,
      parsed.data.qualityLevel,
      parsed.data.isExclusive ? 1 : 0,
      parsed.data.budgetMax,
      parsed.data.maxPricePerLead,
      parsed.data.quotaRequested,
      estimatedCost,
      feasibilityScore,
    )
    .run();

  return c.json({ ok: true, id, feasibilityScore, estimatedCost }, 201);
});

app.get("/v1/campaigns/:id", async (c) => {
  const id = c.req.param("id");
  const row = await c.env.DB.prepare("SELECT * FROM campaigns WHERE id = ?")
    .bind(id)
    .first<Record<string, unknown>>();

  if (!row) {
    return c.json({ error: "Campaign not found" }, 404);
  }

  return c.json({ ok: true, campaign: row });
});

app.patch("/v1/campaigns/:id/quota", async (c) => {
  const id = c.req.param("id");
  const payload = await c.req.json().catch(() => ({}));
  const increment = typeof payload.increment === "number" ? payload.increment : 1;

  await c.env.DB.prepare(
    `UPDATE campaigns
     SET quota_consumed = quota_consumed + ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  )
    .bind(increment, id)
    .run();

  const row = await c.env.DB.prepare(
    "SELECT quota_requested, quota_consumed FROM campaigns WHERE id = ?"
  )
    .bind(id)
    .first<{ quota_requested: number; quota_consumed: number }>();

  if (!row) {
    return c.json({ error: "Campaign not found" }, 404);
  }

  return c.json({
    ok: true,
    quotaRequested: row.quota_requested,
    quotaConsumed: row.quota_consumed,
    quotaRemaining: Math.max(0, row.quota_requested - row.quota_consumed),
  });
});

app.post("/v1/leads/reject", async (c) => {
  const payload = await c.req.json();
  const parsed = rejectLeadSchema.safeParse(payload);
  if (!parsed.success) {
    return c.json({ error: "Invalid payload", details: parsed.error.flatten() }, 400);
  }

  const id = crypto.randomUUID();

  await c.env.DB.prepare(
    `INSERT INTO lead_rejections (id, campaign_id, lead_external_id, reason, details)
     VALUES (?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      parsed.data.campaignId,
      parsed.data.leadExternalId,
      parsed.data.reason,
      parsed.data.details || null,
    )
    .run();

  return c.json({ ok: true, id }, 201);
});

app.patch("/v1/leads/reject/:id/review", async (c) => {
  const id = c.req.param("id");
  const payload = await c.req.json().catch(() => ({}));
  const decision = payload.decision;

  if (decision !== "ACCEPT" && decision !== "REJECT") {
    return c.json({ error: "Decision must be ACCEPT or REJECT" }, 400);
  }

  const replacementExternalId =
    decision === "ACCEPT" ? `replacement-${crypto.randomUUID()}` : null;

  await c.env.DB.prepare(
    `UPDATE lead_rejections
     SET status = ?, replacement_external_id = ?, resolved_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  )
    .bind(
      decision === "ACCEPT" ? "ACCEPTED" : "REJECTED",
      replacementExternalId,
      id,
    )
    .run();

  return c.json({
    ok: true,
    status: decision === "ACCEPT" ? "ACCEPTED" : "REJECTED",
    replacementExternalId,
  });
});

export default app;
