import { test } from "node:test";
import assert from "node:assert/strict";
import { isRealDate, normalizeContact, validateLead } from "../js/validate.js";

const TODAY = new Date(Date.UTC(2026, 9, 9));
const good = {
  fullName: "  Nguyễn Thị   Mai ",
  day: "15", month: "8", year: "1990",
  question: "Năm nay em có nên đổi việc không?",
  contact: "0912 345 678",
  consent: true,
  website: "",
};

test("nhận ngày có thật và từ chối ngày không tồn tại", () => {
  assert.equal(isRealDate(29, 2, 2024, TODAY), true);
  assert.equal(isRealDate(29, 2, 2023, TODAY), false);
  assert.equal(isRealDate(31, 4, 1999, TODAY), false);
  assert.equal(isRealDate(0, 1, 1999, TODAY), false);
});

test("từ chối ngày sinh ở tương lai và trước năm 1900", () => {
  assert.equal(isRealDate(10, 10, 2026, TODAY), false);
  assert.equal(isRealDate(9, 10, 2026, TODAY), true);
  assert.equal(isRealDate(1, 1, 1899, TODAY), false);
});

test("chuẩn hoá số điện thoại Việt Nam về dạng 0xxxxxxxxx", () => {
  assert.deepEqual(normalizeContact("0912 345 678"), { type: "phone", value: "0912345678" });
  assert.deepEqual(normalizeContact("+84 912.345.678"), { type: "phone", value: "0912345678" });
});

test("nhận email và đưa về chữ thường", () => {
  assert.deepEqual(normalizeContact(" Mai@Example.com "), { type: "email", value: "mai@example.com" });
});

test("trả về null khi không phải số điện thoại hay email", () => {
  assert.equal(normalizeContact("12345"), null);
  assert.equal(normalizeContact("mai@"), null);
  assert.equal(normalizeContact(""), null);
});

test("dữ liệu hợp lệ được làm sạch và không có lỗi", () => {
  const result = validateLead(good, TODAY);
  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, {});
  assert.deepEqual(result.value, {
    fullName: "Nguyễn Thị Mai",
    birth: { day: 15, month: 8, year: 1990 },
    question: "Năm nay em có nên đổi việc không?",
    contact: { type: "phone", value: "0912345678" },
  });
});

test("không sửa đối tượng đầu vào", () => {
  const input = { ...good };
  validateLead(input, TODAY);
  assert.deepEqual(input, good);
});

test("báo lỗi từng ô bằng câu chỉ cách sửa", () => {
  const result = validateLead(
    { fullName: "A", day: "31", month: "2", year: "1990", question: "", contact: "abc", consent: false, website: "" },
    TODAY,
  );
  assert.equal(result.ok, false);
  assert.deepEqual(Object.keys(result.errors).sort(), ["birth", "consent", "contact", "fullName"]);
  assert.match(result.errors.birth, /không có/);
});

test("câu hỏi là tuỳ chọn nhưng bị giới hạn độ dài", () => {
  assert.equal(validateLead({ ...good, question: "" }, TODAY).ok, true);
  const long = validateLead({ ...good, question: "a".repeat(501) }, TODAY);
  assert.equal(long.ok, false);
  assert.ok(long.errors.question);
});

test("họ tên quá dài bị từ chối", () => {
  assert.ok(validateLead({ ...good, fullName: "a".repeat(81) }, TODAY).errors.fullName);
});

test("ô bẫy bot có nội dung thì coi là spam", () => {
  const result = validateLead({ ...good, website: "http://spam" }, TODAY);
  assert.equal(result.ok, false);
  assert.equal(result.spam, true);
});
