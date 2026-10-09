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
  // AbortController thay cho AbortSignal.timeout để chạy được trên trình duyệt trong app đời cũ.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetchImpl(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    return response.ok ? { status: "sent" } : { status: "failed", reason: `HTTP ${response.status}` };
  } catch (error) {
    return { status: "failed", reason: error.message };
  } finally {
    clearTimeout(timer);
  }
}
