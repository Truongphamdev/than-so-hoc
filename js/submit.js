// Đóng gói và gửi thông tin khách về webhook của workflow (n8n, Make, Zapier...).

const REQUEST_TIMEOUT_MS = 10000;

const pad = (number) => String(number).padStart(2, "0");

export function buildPayload(lead, result, meta) {
  const { day, month, year } = lead.birth;
  return {
    fullName: lead.fullName,
    birthDate: `${year}-${pad(month)}-${pad(day)}`,
    question: lead.question,
    contactType: lead.contact.type,
    contact: lead.contact.value,
    rulingNumber: result.rulingNumber,
    source: meta.source,
    submittedAt: meta.submittedAt,
  };
}

export async function sendLead(payload, { url, fetchImpl = globalThis.fetch }) {
  if (!url) return { status: "demo" };
  try {
    const response = await fetchImpl(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    return response.ok ? { status: "sent" } : { status: "failed", reason: `HTTP ${response.status}` };
  } catch (error) {
    return { status: "failed", reason: error.message };
  }
}
