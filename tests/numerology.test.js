import { test } from "node:test";
import assert from "node:assert/strict";
import { rulingNumber, birthChart, findArrows, weekdayName, CHART_LAYOUT } from "../js/numerology.js";

test("cộng mọi chữ số của ngày sinh rồi rút gọn về một số", () => {
  assert.equal(rulingNumber({ day: 15, month: 8, year: 1990 }), 6); // 33 -> 6
  assert.equal(rulingNumber({ day: 29, month: 11, year: 1988 }), 3); // 39 -> 12 -> 3
});

test("giữ nguyên tổng 10 và 11, không rút gọn tiếp", () => {
  assert.equal(rulingNumber({ day: 1, month: 1, year: 2006 }), 10);
  assert.equal(rulingNumber({ day: 1, month: 1, year: 2007 }), 11);
});

test("rút gọn về 11 thì dừng ở 11", () => {
  assert.equal(rulingNumber({ day: 9, month: 1, year: 1990 }), 11); // 29 -> 11
  assert.equal(rulingNumber({ day: 28, month: 9, year: 1990 }), 11); // 38 -> 11
});

test("tổng 22 là số đặc biệt, không rút gọn thành 4", () => {
  assert.equal(rulingNumber({ day: 1, month: 1, year: 1991 }), 22);
});

test("tổng 40 rút gọn thành 4 chứ không phải 22", () => {
  assert.equal(rulingNumber({ day: 29, month: 9, year: 1991 }), 4);
});

test("biểu đồ ngày sinh đếm số lần xuất hiện của từng số 1 đến 9, bỏ số 0", () => {
  const chart = birthChart({ day: 15, month: 8, year: 1990 });
  assert.deepEqual(chart, { 1: 2, 2: 0, 3: 0, 4: 0, 5: 1, 6: 0, 7: 0, 8: 1, 9: 2 });
});

test("biểu đồ không bị thay đổi sau khi tìm mũi tên", () => {
  const chart = birthChart({ day: 15, month: 8, year: 1990 });
  const snapshot = { ...chart };
  findArrows(chart);
  assert.deepEqual(chart, snapshot);
});

test("tìm được mũi tên khi đủ ba số trên một đường", () => {
  const arrows = findArrows(birthChart({ day: 15, month: 8, year: 1990 }));
  assert.deepEqual(arrows.map((a) => a.id), ["1-5-9"]);
  assert.equal(arrows[0].name, "Quyết tâm");
});

test("không có mũi tên nào khi không đường nào đủ ba số", () => {
  assert.deepEqual(findArrows(birthChart({ day: 1, month: 1, year: 2000 })), []);
});

test("có thể có nhiều mũi tên cùng lúc", () => {
  const ids = findArrows(birthChart({ day: 23, month: 5, year: 1987 })).map((a) => a.id);
  // các số có mặt: 1 2 3 5 7 8 9
  assert.deepEqual(ids.sort(), ["1-2-3", "1-5-9", "2-5-8", "3-5-7", "7-8-9"].sort());
});

test("bố cục biểu đồ: cột trái 1-2-3 từ dưới lên, hàng trên cùng là 3 6 9", () => {
  assert.deepEqual(CHART_LAYOUT, [[3, 6, 9], [2, 5, 8], [1, 4, 7]]);
});

test("trả về đúng thứ trong tuần của ngày sinh", () => {
  assert.equal(weekdayName({ day: 15, month: 8, year: 1990 }), "Thứ Tư");
  assert.equal(weekdayName({ day: 4, month: 10, year: 2026 }), "Chủ Nhật");
});
