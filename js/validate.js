// Kiểm tra và làm sạch dữ liệu form trước khi tính toán hoặc gửi đi.
// Hàm thuần: nhận dữ liệu thô, trả về đối tượng mới, không sửa đầu vào.

const MIN_BIRTH_YEAR = 1900;
const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 80;
export const MAX_QUESTION_LENGTH = 500;

const PHONE_PATTERN = /^0\d{9}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isRealDate(day, month, year, today = new Date()) {
  if (![day, month, year].every(Number.isInteger)) return false;
  if (year < MIN_BIRTH_YEAR) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  const exists = date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  if (!exists) return false;
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return date.getTime() <= todayUtc;
}

export function normalizeContact(raw) {
  const text = String(raw ?? "").trim();
  if (!text) return null;
  if (text.includes("@")) {
    const email = text.toLowerCase();
    return EMAIL_PATTERN.test(email) ? { type: "email", value: email } : null;
  }
  const phone = text.replace(/[\s.\-()]/g, "").replace(/^\+?84/, "0");
  return PHONE_PATTERN.test(phone) ? { type: "phone", value: phone } : null;
}

function cleanName(raw) {
  return String(raw ?? "").trim().replace(/\s+/g, " ");
}

export function validateLead(input, today = new Date()) {
  if (String(input.website ?? "").trim() !== "") {
    return { ok: false, spam: true, errors: {}, value: null };
  }

  const fullName = cleanName(input.fullName);
  const birth = { day: Number(input.day), month: Number(input.month), year: Number(input.year) };
  const question = String(input.question ?? "").trim();
  const contact = normalizeContact(input.contact);

  const errors = {};
  if (fullName.length < MIN_NAME_LENGTH) {
    errors.fullName = "Nhập họ tên đầy đủ như trên giấy khai sinh.";
  } else if (fullName.length > MAX_NAME_LENGTH) {
    errors.fullName = `Họ tên dài tối đa ${MAX_NAME_LENGTH} ký tự.`;
  }
  if (!input.day || !input.month || !input.year) {
    errors.birth = "Chọn đủ ngày, tháng và năm sinh.";
  } else if (!isRealDate(birth.day, birth.month, birth.year, today)) {
    errors.birth = "Ngày này không có trên lịch hoặc chưa tới. Kiểm tra lại ngày và tháng.";
  }
  if (question.length > MAX_QUESTION_LENGTH) {
    errors.question = `Câu hỏi dài tối đa ${MAX_QUESTION_LENGTH} ký tự. Rút gọn lại giúp mình nhé.`;
  }
  if (!contact) {
    errors.contact = "Nhập số Zalo 10 chữ số hoặc địa chỉ email để nhận bản luận giải.";
  }
  if (input.consent !== true) {
    errors.consent = "Đánh dấu đồng ý để chúng tôi được dùng thông tin này cho bản luận giải.";
  }

  const ok = Object.keys(errors).length === 0;
  return { ok, spam: false, errors, value: ok ? { fullName, birth, question, contact } : null };
}
