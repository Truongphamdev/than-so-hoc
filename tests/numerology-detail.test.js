import { test } from "node:test";
import assert from "node:assert/strict";
import { rulingSteps, rulingNumber, birthChart, findEmptyArrows, missingNumbers, personalYear } from "../js/numerology.js";

test("các bước cộng cho thấy từng chữ số và tổng của mỗi lượt", () => {
  assert.deepEqual(rulingSteps({ day: 15, month: 8, year: 1990 }), [
    { parts: [1, 5, 8, 1, 9, 9, 0], total: 33 },
    { parts: [3, 3], total: 6 },
  ]);
});

test("ngày sinh ra thẳng 11 hoặc 22 chỉ có một bước", () => {
  assert.equal(rulingSteps({ day: 1, month: 1, year: 2007 }).length, 1);
  assert.deepEqual(rulingSteps({ day: 1, month: 1, year: 1991 }).at(-1), { parts: [1, 1, 1, 9, 9, 1], total: 22 });
});

test("bước cuối luôn trùng với con số chủ đạo", () => {
  for (const birth of [{ day: 29, month: 11, year: 1988 }, { day: 28, month: 9, year: 1990 }, { day: 5, month: 5, year: 2000 }]) {
    assert.equal(rulingSteps(birth).at(-1).total, rulingNumber(birth));
  }
});

test("tìm được mũi tên trống khi cả ba ô trên một đường đều không có số", () => {
  // 15/8/1990 có 1 5 8 9, trống 2 3 4 6 7: không đường nào trống trọn ba ô
  assert.deepEqual(findEmptyArrows(birthChart({ day: 15, month: 8, year: 1990 })), []);
  // 1/1/2000 chỉ có số 1 và 2
  const ids = findEmptyArrows(birthChart({ day: 1, month: 1, year: 2000 })).map((arrow) => arrow.id);
  assert.deepEqual(ids.sort(), ["3-5-7", "3-6-9", "4-5-6", "7-8-9"]);
});

test("mũi tên trống có tên riêng, khác tên mũi tên đủ số", () => {
  const arrows = findEmptyArrows(birthChart({ day: 2, month: 2, year: 2022 }));
  const byId = Object.fromEntries(arrows.map((arrow) => [arrow.id, arrow.name]));
  assert.equal(byId["1-5-9"], "Trì hoãn");
  assert.equal(byId["1-4-7"], "Hỗn độn");
});

test("liệt kê các số còn thiếu trong biểu đồ theo thứ tự tăng dần", () => {
  assert.deepEqual(missingNumbers(birthChart({ day: 15, month: 8, year: 1990 })), [2, 3, 4, 6, 7]);
  assert.deepEqual(missingNumbers(birthChart({ day: 23, month: 5, year: 1987 })), [4, 6]);
});

test("năm cá nhân cộng ngày, tháng sinh với năm đang xét rồi rút về 1 đến 9", () => {
  assert.equal(personalYear({ day: 17, month: 2 }, 2026), 2); // 1+7+2+2+0+2+6 = 20 -> 2
  assert.equal(personalYear({ day: 15, month: 8 }, 2026), 6); // 24 -> 6
  assert.equal(personalYear({ day: 9, month: 9 }, 2025), 9);  // 27 -> 9
});

test("năm cá nhân không giữ 11 hay 22 mà rút tiếp", () => {
  assert.equal(personalYear({ day: 1, month: 9 }, 2026), 2); // 20 -> 2
  assert.equal(personalYear({ day: 1, month: 1 }, 2025), 2); // 11 -> 2
});
