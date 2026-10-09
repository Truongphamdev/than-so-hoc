import { CONFIG } from "./config.js";
import { RULING_NUMBERS, LOCKED_TOPICS } from "./content.js";
import { rulingNumber, birthChart, findArrows, weekdayName, CHART_LAYOUT } from "./numerology.js";
import { isRealDate, validateLead } from "./validate.js";
import { buildPayload, sendLead } from "./submit.js";

const FIELD_NAMES = ["fullName", "birth", "question", "contact", "consent"];
const FIRST_INPUT_OF_FIELD = { fullName: "fullName", birth: "day", question: "question", contact: "contact", consent: "consent" };

const STATUS_TEXT = {
  sending: () => "Đang gửi thông tin của bạn…",
  sent: (contact) => `Đã nhận thông tin. Bản luận giải riêng sẽ được gửi tới ${contact}.`,
  demo: () => "Trang đang chạy thử nên thông tin của bạn chưa được gửi đi.",
  failed: () => "Chưa gửi được thông tin vì lỗi kết nối. Kiểm tra mạng rồi bấm “Gửi lại thông tin”.",
};

const $ = (selector) => document.querySelector(selector);
const form = $("#form-tra-cuu");
const resultSection = $("#ket-qua");
const calendarPage = $("[data-cal-page]");
const retryButton = $("[data-retry]");

let pendingPayload = null;
let pendingContact = "";

function addOptions(select, values, labelOf) {
  const options = values.map((value) => {
    const option = document.createElement("option");
    option.value = String(value);
    option.textContent = labelOf(value);
    return option;
  });
  select.append(...options);
}

function range(from, to) {
  const step = from <= to ? 1 : -1;
  return Array.from({ length: Math.abs(to - from) + 1 }, (_, index) => from + index * step);
}

function setUpSelects() {
  const thisYear = new Date().getFullYear();
  addOptions(form.day, range(1, 31), (day) => String(day));
  addOptions(form.month, range(1, 12), (month) => `Tháng ${month}`);
  addOptions(form.year, range(thisYear, CONFIG.OLDEST_BIRTH_YEAR), (year) => String(year));
}

function todayAsBirth() {
  const now = new Date();
  return { day: now.getDate(), month: now.getMonth() + 1, year: now.getFullYear() };
}

function showOnCalendar(date, caption) {
  $("[data-cal-month]").textContent = `Tháng ${date.month} năm ${date.year}`;
  $("[data-cal-day]").textContent = String(date.day);
  $("[data-cal-weekday]").textContent = weekdayName(date);
  $("[data-cal-caption]").textContent = caption;
}

function updateCalendar() {
  const picked = { day: Number(form.day.value), month: Number(form.month.value), year: Number(form.year.value) };
  const complete = form.day.value && form.month.value && form.year.value;
  if (!complete) {
    showOnCalendar(todayAsBirth(), "Hôm nay. Chọn ngày sinh để lật lịch.");
  } else if (isRealDate(picked.day, picked.month, picked.year)) {
    showOnCalendar(picked, "Ngày bạn chào đời");
  } else {
    showOnCalendar(todayAsBirth(), "Ngày vừa chọn không có trên lịch.");
  }
}

function showErrors(errors) {
  for (const name of FIELD_NAMES) {
    const message = errors[name] ?? "";
    $(`#err-${name}`).textContent = message;
    $(`[data-field="${name}"]`).classList.toggle("has-error", Boolean(message));
  }
  const firstInvalid = FIELD_NAMES.find((name) => errors[name]);
  if (firstInvalid) form[FIRST_INPUT_OF_FIELD[firstInvalid]].focus();
}

function clearError(name) {
  $(`#err-${name}`).textContent = "";
  $(`[data-field="${name}"]`).classList.remove("has-error");
}

function clearErrorsWhenEdited() {
  for (const name of FIELD_NAMES) {
    const field = $(`[data-field="${name}"]`);
    field.addEventListener("input", () => clearError(name));
    field.addEventListener("change", () => clearError(name));
  }
}

function fillList(list, items) {
  list.replaceChildren(...items.map((text) => {
    const item = document.createElement("li");
    item.textContent = text;
    return item;
  }));
}

function renderChart(chart) {
  const cells = CHART_LAYOUT.flat().map((digit) => {
    const cell = document.createElement("div");
    cell.className = chart[digit] > 0 ? "chart__cell" : "chart__cell is-empty";
    cell.textContent = String(digit).repeat(chart[digit]);
    return cell;
  });
  const container = $("[data-result-chart]");
  const present = Object.entries(chart).filter(([, count]) => count > 0).map(([digit, count]) => `số ${digit} có ${count} lần`);
  container.setAttribute("aria-label", `Biểu đồ ngày sinh: ${present.join(", ")}.`);
  container.replaceChildren(...cells);
}

function renderArrows(arrows) {
  const container = $("[data-result-arrows]");
  if (arrows.length === 0) {
    const note = document.createElement("p");
    note.textContent = "Biểu đồ của bạn chưa có đường nào đủ ba số. Điều này rất thường gặp và không phải điểm yếu.";
    container.replaceChildren(note);
    return;
  }
  container.replaceChildren(...arrows.map((arrow) => {
    const line = document.createElement("p");
    const name = document.createElement("strong");
    name.textContent = `Mũi tên ${arrow.name} (${arrow.id}). `;
    line.append(name, arrow.meaning);
    return line;
  }));
}

function givenName(fullName) {
  return fullName.split(" ").at(-1);
}

function renderResult(lead, number) {
  const reading = RULING_NUMBERS[number];
  const chart = birthChart(lead.birth);
  $("[data-result-heading]").textContent = `${givenName(lead.fullName)}, con số chủ đạo của bạn là ${number}`;
  $("[data-result-title]").textContent = reading.title;
  $("[data-result-summary]").textContent = reading.summary;
  fillList($("[data-result-strengths]"), reading.strengths);
  fillList($("[data-result-watch]"), reading.watch);
  renderChart(chart);
  renderArrows(findArrows(chart));
  const topics = lead.question ? [...LOCKED_TOPICS, `Câu hỏi của bạn: “${lead.question}”`] : LOCKED_TOPICS;
  fillList($("[data-result-locked]"), topics);
  $("[data-cal-number]").textContent = String(number);
  $("[data-cal-title]").textContent = reading.title;
}

function setStatus(state, contact = "") {
  const status = $("[data-result-status]");
  status.dataset.state = state;
  status.textContent = STATUS_TEXT[state](contact);
  retryButton.hidden = state !== "failed";
}

async function deliver() {
  setStatus("sending");
  const outcome = await sendLead(pendingPayload, { url: CONFIG.WEBHOOK_URL });
  if (outcome.status === "failed") console.error("[than-so-hoc] gửi webhook thất bại:", outcome.reason);
  setStatus(outcome.status, pendingContact);
}

function revealResult() {
  calendarPage.classList.add("is-torn");
  resultSection.hidden = false;
  const heading = $("[data-result-heading]");
  heading.focus({ preventScroll: true });
  resultSection.scrollIntoView({ block: "start" });
}

function onSubmit(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  const checked = validateLead({ ...data, consent: form.consent.checked });
  if (checked.spam) return;
  showErrors(checked.errors);
  if (!checked.ok) return;

  const lead = checked.value;
  const number = rulingNumber(lead.birth);
  renderResult(lead, number);
  revealResult();

  const source = new URLSearchParams(location.search).get("utm_source") || "direct";
  pendingPayload = buildPayload(lead, { rulingNumber: number }, { source, submittedAt: new Date().toISOString() });
  pendingContact = lead.contact.type === "phone" ? `Zalo ${lead.contact.value}` : lead.contact.value;
  deliver();
}

function onReset() {
  resultSection.hidden = true;
  calendarPage.classList.remove("is-torn");
  form.scrollIntoView({ block: "start" });
  form.day.focus({ preventScroll: true });
}

function init() {
  document.querySelectorAll("[data-brand]").forEach((node) => { node.textContent = CONFIG.BRAND_NAME; });
  $("[data-year]").textContent = String(new Date().getFullYear());
  setUpSelects();
  updateCalendar();
  clearErrorsWhenEdited();
  for (const select of [form.day, form.month, form.year]) select.addEventListener("change", updateCalendar);
  form.addEventListener("submit", onSubmit);
  retryButton.addEventListener("click", deliver);
  $("[data-reset]").addEventListener("click", onReset);
}

init();
