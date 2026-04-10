type DeliveryChannel = "EMAIL" | "CSV_EXPORT" | "API" | "MANUAL";

type DeliveryPartner = {
  id: string;
  name: string;
  email: string;
  deliveryWebhookUrl: string | null;
  apiEndpoint: string | null;
  apiKey: string | null;
  csvEmail: string | null;
  crmWebhookUrl: string | null;
};

type LeadPayload = {
  id: string;
  title: string;
  description: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
};

export async function deliverLeadToPartner(params: {
  channel: DeliveryChannel;
  partner: DeliveryPartner;
  lead: LeadPayload;
  campaignName: string;
  crmRequested: boolean;
}) {
  const { channel, partner, lead, campaignName, crmRequested } = params;

  let notes = "";

  const commonPayload = {
    partnerId: partner.id,
    partnerName: partner.name,
    campaignName,
    lead,
    deliveredAt: new Date().toISOString(),
  };

  if (channel === "API" && partner.apiEndpoint) {
    const res = await fetch(partner.apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(partner.apiKey
          ? { Authorization: `Bearer ${partner.apiKey}` }
          : {}),
      },
      body: JSON.stringify(commonPayload),
    });

    notes = res.ok
      ? "API delivery success"
      : `API delivery failed (${res.status})`;
  }

  if (channel === "EMAIL" && partner.deliveryWebhookUrl) {
    const res = await fetch(partner.deliveryWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "email_delivery",
        to: partner.email,
        subject: `Lead delivery - ${campaignName}`,
        payload: commonPayload,
      }),
    });

    notes = res.ok
      ? "Email webhook delivery success"
      : `Email webhook delivery failed (${res.status})`;
  }

  if (channel === "CSV_EXPORT") {
    const csv = [
      "leadId,title,contactName,contactEmail,contactPhone",
      `${lead.id},"${lead.title}","${lead.contactName}","${lead.contactEmail}","${lead.contactPhone}"`,
    ].join("\n");

    if (partner.deliveryWebhookUrl) {
      const res = await fetch(partner.deliveryWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "csv_delivery",
          to: partner.csvEmail || partner.email,
          fileName: `${lead.id}.csv`,
          csv,
          payload: commonPayload,
        }),
      });

      notes = res.ok
        ? "CSV exported via webhook"
        : `CSV webhook export failed (${res.status})`;
    } else {
      notes = `CSV prepared for ${partner.csvEmail || partner.email}`;
    }
  }

  if (channel === "MANUAL") {
    notes = "Manual delivery confirmed by admin";
  }

  if (crmRequested && partner.crmWebhookUrl) {
    const crmRes = await fetch(partner.crmWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(partner.apiKey
          ? { Authorization: `Bearer ${partner.apiKey}` }
          : {}),
      },
      body: JSON.stringify({
        type: "crm_sync",
        payload: commonPayload,
      }),
    });

    notes = `${notes} | CRM ${crmRes.ok ? "synced" : `sync failed (${crmRes.status})`}`;
  }

  return {
    notes: notes || "Delivery processed",
  };
}
