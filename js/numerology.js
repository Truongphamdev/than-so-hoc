// Phép tính thần số học theo trường phái Pythagoras (cách tính phổ biến ở Việt Nam):
// con số chủ đạo nằm trong khoảng 2 đến 11, cộng thêm số đặc biệt 22.
// Toàn bộ là hàm thuần, không đụng tới DOM, để test được bằng Node.

const MAX_RULING_NUMBER = 11;
const MASTER_RULING_NUMBER = 22;

const WEEKDAYS = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

// Hàng trên cùng trước. Cột trái là 1-2-3 đọc từ dưới lên.
export const CHART_LAYOUT = Object.freeze([
  Object.freeze([3, 6, 9]),
  Object.freeze([2, 5, 8]),
  Object.freeze([1, 4, 7]),
]);

const ARROWS = Object.freeze([
  { id: "1-5-9", name: "Quyết tâm", meaning: "Đã đặt mục tiêu thì theo đến cùng, ít khi bỏ giữa chừng." },
  { id: "3-5-7", name: "Nhạy bén", meaning: "Cảm nhận tốt về con người và hoàn cảnh, hay tin vào trực giác." },
  { id: "3-6-9", name: "Trí tuệ", meaning: "Học nhanh, nhớ lâu, thích phân tích trước khi kết luận." },
  { id: "2-5-8", name: "Cân bằng cảm xúc", meaning: "Hiểu cảm xúc của mình và người khác, giữ được bình tĩnh." },
  { id: "1-4-7", name: "Thực tế", meaning: "Thích việc làm ra kết quả cụ thể, khéo tay, giỏi tổ chức." },
  { id: "1-2-3", name: "Kế hoạch", meaning: "Thích sắp xếp trước, làm việc có trình tự rõ ràng." },
  { id: "4-5-6", name: "Ý chí", meaning: "Bền bỉ, chịu được áp lực để hoàn thành việc đã nhận." },
  { id: "7-8-9", name: "Hoạt động", meaning: "Nhiều năng lượng, khó ngồi yên, hợp với việc cần di chuyển." },
].map((arrow) => Object.freeze(arrow)));

// Mũi tên trống: cả ba ô trên một đường đều không có số. Đường 1-2-3 không có bản trống.
const EMPTY_ARROWS = Object.freeze([
  { id: "1-5-9", name: "Trì hoãn", meaning: "Hay chần chừ trước việc quan trọng. Chia việc thành bước nhỏ sẽ dễ bắt đầu hơn." },
  { id: "3-5-7", name: "Hoài nghi", meaning: "Khó tin điều chưa tự kiểm chứng. Cởi mở hơn với góc nhìn của người khác sẽ nhẹ lòng." },
  { id: "3-6-9", name: "Trí nhớ ngắn hạn", meaning: "Dễ quên nếu không ghi lại. Thói quen ghi chép và học đều đặn giúp ích nhiều." },
  { id: "2-5-8", name: "Nhạy cảm", meaning: "Dễ tổn thương vì lời nói của người khác. Nói ra cảm xúc thay vì giữ trong lòng." },
  { id: "4-5-6", name: "Uất giận", meaning: "Hay thất vọng khi kỳ vọng vào người khác. Hạ bớt kỳ vọng thì đỡ bực bội." },
  { id: "1-4-7", name: "Hỗn độn", meaning: "Khó giữ nề nếp trong sinh hoạt. Một lịch trình đơn giản hằng ngày là điểm tựa tốt." },
  { id: "7-8-9", name: "Thụ động", meaning: "Ngại chủ động hành động. Vận động thể chất đều giúp có thêm đà." },
].map((arrow) => Object.freeze(arrow)));

function digitsOfBirth({ day, month, year }) {
  return `${day}${month}${year}`.split("").map(Number);
}

function sumDigits(number) {
  return String(number).split("").reduce((total, digit) => total + Number(digit), 0);
}

const last = (items) => items[items.length - 1];
const isFinalRulingNumber = (total) => total <= MAX_RULING_NUMBER || total === MASTER_RULING_NUMBER;

// Từng lượt cộng, để hiện cho khách thấy con số của họ ra từ đâu.
export function rulingSteps(birth) {
  const firstParts = digitsOfBirth(birth);
  const first = { parts: firstParts, total: firstParts.reduce((sum, digit) => sum + digit, 0) };
  const steps = [first];
  while (!isFinalRulingNumber(last(steps).total)) {
    const parts = String(last(steps).total).split("").map(Number);
    steps.push({ parts, total: parts.reduce((sum, digit) => sum + digit, 0) });
  }
  return steps;
}

export function rulingNumber(birth) {
  return last(rulingSteps(birth)).total;
}

export function birthChart(birth) {
  const empty = Object.fromEntries(Array.from({ length: 9 }, (_, index) => [index + 1, 0]));
  return digitsOfBirth(birth)
    .filter((digit) => digit !== 0)
    .reduce((chart, digit) => ({ ...chart, [digit]: chart[digit] + 1 }), empty);
}

export function findArrows(chart) {
  return ARROWS.filter((arrow) => arrow.id.split("-").every((digit) => chart[digit] > 0));
}

export function findEmptyArrows(chart) {
  return EMPTY_ARROWS.filter((arrow) => arrow.id.split("-").every((digit) => chart[digit] === 0));
}

export function missingNumbers(chart) {
  return Object.keys(chart).map(Number).filter((digit) => chart[digit] === 0).sort((a, b) => a - b);
}

// Năm cá nhân chạy theo chu kỳ 9 năm, luôn rút về một chữ số.
export function personalYear({ day, month }, year) {
  let total = sumDigits(`${day}${month}${year}`);
  while (total > 9) total = sumDigits(total);
  return total;
}

export function weekdayName({ day, month, year }) {
  return WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
}
