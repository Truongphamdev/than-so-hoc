import { test } from "node:test";
import assert from "node:assert/strict";
import { buildPayload, sendLead } from "../js/submit.js";

const lead = {
  fullName: "Nguyễn Thị Mai",
  birth: { day: 15, month: 8, year: 1990 },
  question: "Có nên đổi việc không?",
  contact: { type: "phone", value: "0912345678" },
};

test("gói dữ liệu gửi đi có ngày sinh dạng ISO và kết quả đã tính", () => {
  const payload = buildPayload(lead, { rulingNumber: 6 }, { source: "tiktok", submittedAt: "2026-10-09T03:00:00.000Z" });
  assert.deepEqual(payload, {
    fullName: "Nguyễn Thị Mai",
    birthDate: "1990-08-15",
    question: "Có nên đổi việc không?",
    contactType: "phone",
    contact: "0912345678",
    rulingNumber: 6,
    source: "tiktok",
    submittedAt: "2026-10-09T03:00:00.000Z",
  });
});

test("chưa cấu hình webhook thì không gọi mạng và báo chế độ xem thử", async () => {
  let called = false;
  const result = await sendLead({}, { url: "", fetchImpl: async () => { called = true; } });
  assert.equal(called, false);
  assert.deepEqual(result, { status: "demo" });
});

test("gửi POST dạng JSON tới webhook và báo đã gửi khi máy chủ trả 2xx", async () => {
  const calls = [];
  const fetchImpl = async (url, options) => { calls.push({ url, options }); return { ok: true, status: 200 }; };
  const result = await sendLead({ a: 1 }, { url: "https://hook.test/x", fetchImpl });
  assert.deepEqual(result, { status: "sent" });
  assert.equal(calls[0].url, "https://hook.test/x");
  assert.equal(calls[0].options.method, "POST");
  assert.equal(calls[0].options.headers["Content-Type"], "application/json");
  assert.equal(calls[0].options.body, '{"a":1}');
});

test("máy chủ trả lỗi thì báo thất bại kèm mã lỗi", async () => {
  const result = await sendLead({}, { url: "https://hook.test/x", fetchImpl: async () => ({ ok: false, status: 500 }) });
  assert.deepEqual(result, { status: "failed", reason: "HTTP 500" });
});

test("mất mạng thì báo thất bại chứ không ném lỗi", async () => {
  const fetchImpl = async () => { throw new TypeError("Failed to fetch"); };
  const result = await sendLead({}, { url: "https://hook.test/x", fetchImpl });
  assert.deepEqual(result, { status: "failed", reason: "Failed to fetch" });
});
