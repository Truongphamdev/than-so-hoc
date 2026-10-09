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

function digitsOfBirth({ day, month, year }) {
  return `${day}${month}${year}`.split("").map(Number);
}

function sumDigits(number) {
  return String(number).split("").reduce((total, digit) => total + Number(digit), 0);
}

export function rulingNumber(birth) {
  let total = digitsOfBirth(birth).reduce((sum, digit) => sum + digit, 0);
  while (total > MAX_RULING_NUMBER && total !== MASTER_RULING_NUMBER) {
    total = sumDigits(total);
  }
  return total;
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

export function weekdayName({ day, month, year }) {
  return WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
}
