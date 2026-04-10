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

const registerSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

const profileSchema = z.object({
  email: z.email(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().optional(),
  city: z.string().optional(),
});

const passwordChangeSchema = z.object({
  email: z.email(),
  currentPassword: z.string().min(8),
  newPassword: z.string().min(10),
});

async function hashPassword(input: string) {
  const bytes = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function asIsoFuture(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

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

app.post("/v1/auth/register", async (c) => {
  const payload = await c.req.json();
  const parsed = registerSchema.safeParse(payload);
  if (!parsed.success) {
    return c.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      400,
    );
  }

  const existing = await c.env.DB.prepare(
    "SELECT id FROM users WHERE email = ?",
  )
    .bind(parsed.data.email)
    .first<{ id: string }>();

  if (existing) {
    return c.json({ error: "Email already used" }, 409);
  }

  const id = crypto.randomUUID();
  const sessionId = crypto.randomUUID();
  const usersCount = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM users",
  ).first<{ count: number }>();
  const role = (usersCount?.count || 0) === 0 ? "ADMIN" : "USER";
  const passwordHash = await hashPassword(parsed.data.password);

  await c.env.DB.batch([
    c.env.DB.prepare(
      `INSERT INTO users (id, first_name, last_name, email, password_hash, role)
       VALUES (?, ?, ?, ?, ?, ?)`,
    ).bind(
      id,
      parsed.data.firstName,
      parsed.data.lastName,
      parsed.data.email,
      passwordHash,
      role,
    ),
    c.env.DB.prepare(
      "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)",
    ).bind(sessionId, id, asIsoFuture(7)),
  ]);

  return c.json({
    ok: true,
    user: {
      id,
      email: parsed.data.email,
      role,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
    },
    sessionToken: sessionId,
  });
});

app.post("/v1/auth/login", async (c) => {
  const payload = await c.req.json();
  const parsed = loginSchema.safeParse(payload);
  if (!parsed.success) {
    return c.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      400,
    );
  }

  const user = await c.env.DB.prepare(
    "SELECT id, first_name, last_name, email, role, password_hash FROM users WHERE email = ?",
  )
    .bind(parsed.data.email)
    .first<{
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      role: string;
      password_hash: string;
    }>();

  if (!user) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const providedHash = await hashPassword(parsed.data.password);
  if (providedHash !== user.password_hash) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const sessionId = crypto.randomUUID();
  await c.env.DB.prepare(
    "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)",
  )
    .bind(sessionId, user.id, asIsoFuture(7))
    .run();

  return c.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
    },
    sessionToken: sessionId,
  });
});

app.post("/v1/auth/logout", async (c) => {
  const payload = await c.req.json().catch(() => ({}));
  const sessionToken = payload.sessionToken as string | undefined;
  if (!sessionToken) return c.json({ ok: true });

  await c.env.DB.prepare("DELETE FROM sessions WHERE id = ?")
    .bind(sessionToken)
    .run();

  return c.json({ ok: true });
});

app.get("/v1/auth/me", async (c) => {
  const sessionToken = c.req.query("sessionToken");
  if (!sessionToken) return c.json({ user: null }, 200);

  const row = await c.env.DB.prepare(
    `SELECT u.id, u.email, u.role, u.first_name, u.last_name, u.phone, u.city
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.id = ? AND s.expires_at > ?`,
  )
    .bind(sessionToken, new Date().toISOString())
    .first<{
      id: string;
      email: string;
      role: string;
      first_name: string;
      last_name: string;
      phone: string | null;
      city: string | null;
    }>();

  if (!row) return c.json({ user: null }, 200);

  return c.json({
    user: {
      id: row.id,
      email: row.email,
      role: row.role,
      firstName: row.first_name,
      lastName: row.last_name,
      phone: row.phone,
      city: row.city,
    },
  });
});

app.patch("/v1/auth/profile", async (c) => {
  const payload = await c.req.json();
  const parsed = profileSchema.safeParse(payload);

  if (!parsed.success) {
    return c.json({ error: "Invalid payload" }, 400);
  }

  await c.env.DB.prepare(
    `UPDATE users
     SET first_name = ?, last_name = ?, phone = ?, city = ?, updated_at = CURRENT_TIMESTAMP
     WHERE email = ?`,
  )
    .bind(
      parsed.data.firstName,
      parsed.data.lastName,
      parsed.data.phone || null,
      parsed.data.city || null,
      parsed.data.email,
    )
    .run();

  return c.json({ ok: true });
});

app.patch("/v1/auth/password", async (c) => {
  const payload = await c.req.json();
  const parsed = passwordChangeSchema.safeParse(payload);

  if (!parsed.success) {
    return c.json({ error: "Invalid payload" }, 400);
  }

  const user = await c.env.DB.prepare(
    "SELECT id, password_hash FROM users WHERE email = ?",
  )
    .bind(parsed.data.email)
    .first<{ id: string; password_hash: string }>();

  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  const currentHash = await hashPassword(parsed.data.currentPassword);
  if (currentHash !== user.password_hash) {
    return c.json({ error: "Current password invalid" }, 400);
  }

  const newHash = await hashPassword(parsed.data.newPassword);
  await c.env.DB.prepare(
    "UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
  )
    .bind(newHash, user.id)
    .run();

  return c.json({ ok: true });
});

app.get("/v1/campaigns", async (c) => {
  const customerId = c.req.query("customerId");
  const rows = customerId
    ? await c.env.DB.prepare(
        "SELECT * FROM campaigns WHERE customer_id = ? ORDER BY created_at DESC",
      )
        .bind(customerId)
        .all<Record<string, unknown>>()
    : await c.env.DB.prepare(
        "SELECT * FROM campaigns ORDER BY created_at DESC LIMIT 200",
      ).all<Record<string, unknown>>();

  return c.json({ ok: true, campaigns: rows.results || [] });
});

app.post("/v1/campaigns", async (c) => {
  const payload = await c.req.json();
  const parsed = createCampaignSchema.safeParse(payload);
  if (!parsed.success) {
    return c.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      400,
    );
  }

  const id = crypto.randomUUID();
  const estimatedCost =
    parsed.data.requestedLeads * parsed.data.maxPricePerLead;
  const feasibilityScore = Math.max(
    20,
    Math.min(
      98,
      Math.round((parsed.data.budgetMax / Math.max(1, estimatedCost)) * 100),
    ),
  );

  await c.env.DB.prepare(
    `INSERT INTO campaigns (
      id, customer_id, campaign_name, need_type, requested_leads,
      geo_area, target_segment, quality_level, is_exclusive,
      budget_max, max_price_per_lead, quota_requested, estimated_cost, feasibility_score
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
  const increment =
    typeof payload.increment === "number" ? payload.increment : 1;

  await c.env.DB.prepare(
    `UPDATE campaigns
     SET quota_consumed = quota_consumed + ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
  )
    .bind(increment, id)
    .run();

  const row = await c.env.DB.prepare(
    "SELECT quota_requested, quota_consumed FROM campaigns WHERE id = ?",
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
    return c.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      400,
    );
  }

  const id = crypto.randomUUID();

  await c.env.DB.prepare(
    `INSERT INTO lead_rejections (id, campaign_id, lead_external_id, reason, details)
     VALUES (?, ?, ?, ?, ?)`,
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
     WHERE id = ?`,
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
