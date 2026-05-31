const i18n = {
  en: {
    eyebrow: "Overhead Hoist Transport",
    title: "OHT Scheduling System",
    lightMode: "Light Mode",
    darkMode: "Dark Mode",
    inputs: "Inputs",
    method: "Method",
    compare: "Compare",
    ohtCount: "OHT Count",
    excelUpload: "Upload Excel/CSV",
    imageUpload: "Import Photo",
    runPhotoOcr: "Read Table with OCR",
    ocrHint: "Photo import is for reference. Use OCR only when you want to read a table from the photo.",
    quickEntry: "Quick Entry",
    addTask: "Add Task",
    loadSample: "Load Sample",
    run: "Run Schedule",
    export: "Export Excel",
    taskData: "Task Data",
    taskHint: "Columns: Task, Lot, Route, Start-Ready Time, Transport Time, Required Arrival Time",
    task: "Task",
    tool: "Route",
    arrival: "Start-Ready Time",
    processing: "Transport Time",
    due: "Required Arrival Time",
    gantt: "Gantt Chart",
    ganttHint: "Hover bars to inspect task timing.",
    results: "Schedule Result",
    start: "Start",
    finish: "Finish",
    delay: "Delay",
    makespan: "Makespan",
    totalTardiness: "Total Tardiness",
    averageDelay: "Average Delay",
    maxDelay: "Max Delay",
    best: "Recommended method: ",
    noData: "No schedule yet. Add tasks and run scheduling.",
  },
  zh: {
    eyebrow: "自動化天車搬運",
    title: "OHT 排程系統",
    lightMode: "亮色模式",
    darkMode: "深色模式",
    inputs: "輸入設定",
    method: "排程方法",
    compare: "比較",
    ohtCount: "OHT 數量",
    excelUpload: "上傳 Excel/CSV",
    imageUpload: "匯入照片",
    runPhotoOcr: "用 OCR 讀取表格",
    ocrHint: "照片匯入可作為參考；需要從照片讀取表格時再使用 OCR。",
    quickEntry: "快速輸入",
    addTask: "新增任務",
    loadSample: "載入範例",
    run: "開始排程",
    export: "匯出 Excel",
    taskData: "任務資料",
    taskHint: "欄位：任務、Lot、路徑、可開始時間、搬運時間、需求到達時間",
    task: "任務",
    tool: "路徑",
    arrival: "可開始時間",
    processing: "搬運時間",
    due: "需求到達時間",
    gantt: "甘特圖",
    ganttHint: "滑過長條可查看任務時間。",
    results: "排程結果",
    start: "開始",
    finish: "完成",
    delay: "延遲",
    makespan: "完工時間",
    totalTardiness: "總延遲",
    averageDelay: "平均延遲",
    maxDelay: "最大延遲",
    best: "建議方法：",
    noData: "尚未排程。請新增任務後執行排程。",
  },
};

const sampleTasks = [
  { id: "T1", lot: "L001", tool: "A-B", arrival: 0, processing: 10, due: 30 },
  { id: "T2", lot: "L002", tool: "B-C", arrival: 5, processing: 8, due: 20 },
  { id: "T3", lot: "L003", tool: "A-C", arrival: 8, processing: 14, due: 38 },
  { id: "T4", lot: "L004", tool: "C-D", arrival: 12, processing: 6, due: 28 },
  { id: "T5", lot: "L005", tool: "B-D", arrival: 16, processing: 11, due: 45 },
];

const columnAliases = {
  id: ["task", "job", "id", "任務", "工作"],
  lot: ["lot", "批號"],
  tool: ["route", "path", "fromto", "from-to", "tool", "machine", "路徑", "路段", "機台"],
  arrival: ["startreadytime", "readytime", "starttime", "arrival", "arrivaltime", "可開始時間", "開始時間", "到達"],
  processing: ["transporttime", "movetime", "traveltime", "processing", "processtime", "processingtime", "搬運時間", "移動時間", "加工"],
  due: ["requiredarrivaltime", "requiredarrival", "duetime", "duedate", "due", "deadline", "需求到達時間", "需求時間", "交期"],
};

let tasks = structuredClone(sampleTasks);
let schedule = [];
let language = "en";
let selectedPhotoFile = null;

const $ = (id) => document.getElementById(id);
const numberValue = (value) => Number.parseFloat(String(value).replace(/[^\d.-]/g, "")) || 0;

function translate() {
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const text = i18n[language][node.dataset.i18n];
    if (text) node.textContent = text;
  });
  $("themeToggle").textContent = document.documentElement.classList.contains("light")
    ? i18n[language].darkMode
    : i18n[language].lightMode;
  renderResults();
}

function renderTasks() {
  $("taskRows").innerHTML = tasks
    .map(
      (task, index) => `
        <tr>
          <td><input value="${escapeHtml(task.id)}" data-field="id" data-index="${index}" /></td>
          <td><input value="${escapeHtml(task.lot)}" data-field="lot" data-index="${index}" /></td>
          <td><input value="${escapeHtml(task.tool)}" data-field="tool" data-index="${index}" /></td>
          <td><input type="number" value="${task.arrival}" data-field="arrival" data-index="${index}" /></td>
          <td><input type="number" value="${task.processing}" data-field="processing" data-index="${index}" /></td>
          <td><input type="number" value="${task.due}" data-field="due" data-index="${index}" /></td>
          <td><button class="delete" data-delete="${index}" type="button">x</button></td>
        </tr>
      `,
    )
    .join("");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function sanitizeTasks() {
  tasks = tasks
    .map((task, index) => ({
      id: String(task.id || `T${index + 1}`).trim(),
      lot: String(task.lot || `L${String(index + 1).padStart(3, "0")}`).trim(),
      tool: String(task.tool || "A-B").trim(),
      arrival: Math.max(0, numberValue(task.arrival)),
      processing: Math.max(1, numberValue(task.processing)),
      due: Math.max(0, numberValue(task.due)),
    }))
    .filter((task) => task.id);
}

function scheduleBy(method) {
  sanitizeTasks();
  const ohtCount = Math.max(1, Math.min(999, Number.parseInt($("ohtCount").value, 10) || 1));
  const ohtReady = Array.from({ length: ohtCount }, () => 0);
  const remaining = [...tasks];
  const result = [];

  while (remaining.length) {
    const bestOht = ohtReady
      .map((ready, index) => ({ ready, index }))
      .sort((a, b) => a.ready - b.ready || a.index - b.index)[0];
    const nextArrival = Math.min(...remaining.map((task) => task.arrival));
    const dispatchTime = Math.max(bestOht.ready, nextArrival);
    const available = remaining.filter((task) => task.arrival <= dispatchTime);
    const task = available.sort((a, b) => {
      if (method === "EDD") {
        return a.due - b.due || a.processing - b.processing || a.arrival - b.arrival || a.id.localeCompare(b.id);
      }
      return a.processing - b.processing || a.due - b.due || a.arrival - b.arrival || a.id.localeCompare(b.id);
    })[0];

    const start = Math.max(task.arrival, bestOht.ready);
    const finish = start + task.processing;
    ohtReady[bestOht.index] = finish;
    result.push({
      ...task,
      method,
      oht: `OHT${bestOht.index + 1}`,
      start,
      finish,
      delay: Math.max(0, finish - task.due),
    });
    remaining.splice(remaining.indexOf(task), 1);
  }

  return result;
}

function analyze(rows) {
  const makespan = rows.length ? Math.max(...rows.map((row) => row.finish)) : 0;
  const totalTardiness = rows.reduce((sum, row) => sum + row.delay, 0);
  return {
    makespan,
    totalTardiness,
    averageDelay: rows.length ? totalTardiness / rows.length : 0,
    maxDelay: rows.length ? Math.max(...rows.map((row) => row.delay)) : 0,
  };
}

function runSchedule() {
  const method = $("methodSelect").value;
  schedule = method === "COMPARE" ? [...scheduleBy("EDD"), ...scheduleBy("SPT")] : scheduleBy(method);
  renderResults();
}

function renderMetrics() {
  const groups = schedule.reduce((acc, row) => {
    acc[row.method] = acc[row.method] || [];
    acc[row.method].push(row);
    return acc;
  }, {});
  const metrics = Object.entries(groups).map(([method, rows]) => ({ method, ...analyze(rows) }));
  $("comparePanel").innerHTML = metrics
    .flatMap((metric) => [
      metricCard(`${metric.method} ${i18n[language].makespan}`, metric.makespan),
      metricCard(`${metric.method} ${i18n[language].totalTardiness}`, metric.totalTardiness),
      metricCard(`${metric.method} ${i18n[language].averageDelay}`, metric.averageDelay.toFixed(1)),
      metricCard(`${metric.method} ${i18n[language].maxDelay}`, metric.maxDelay),
    ])
    .join("");

  if (metrics.length > 1) {
    const best = [...metrics].sort(
      (a, b) => a.totalTardiness - b.totalTardiness || a.makespan - b.makespan,
    )[0];
    $("recommendation").textContent = `${i18n[language].best}${best.method}`;
  } else {
    $("recommendation").textContent = "";
  }
}

function metricCard(label, value) {
  return `<article class="metric"><span>${escapeHtml(label)}</span><strong>${value}</strong></article>`;
}

function renderResults() {
  renderMetrics();
  $("resultRows").innerHTML = schedule
    .map(
      (row) => `
        <tr>
          <td>${row.method}</td>
          <td>${escapeHtml(row.id)}</td>
          <td>${escapeHtml(row.lot)}</td>
          <td>${escapeHtml(row.tool)}</td>
          <td>${row.oht}</td>
          <td>${row.start}</td>
          <td>${row.finish}</td>
          <td>${row.delay}</td>
        </tr>
      `,
    )
    .join("");
  renderGantt();
}

function renderGantt() {
  if (!schedule.length) {
    $("ganttChart").innerHTML = `<p class="muted">${i18n[language].noData}</p>`;
    return;
  }

  const maxFinish = Math.max(...schedule.map((row) => row.finish), 1);
  const lanes = [...new Set(schedule.map((row) => row.oht))].sort();
  $("ganttChart").innerHTML = lanes
    .map((lane) => {
      const bars = schedule
        .filter((row) => row.oht === lane)
        .map((row) => {
          const left = (row.start / maxFinish) * 100;
          const width = Math.max(4, ((row.finish - row.start) / maxFinish) * 100);
          const title = `${row.method} ${row.id} ${row.start}-${row.finish}, ${i18n[language].delay}: ${row.delay}`;
          return `<div class="bar ${row.method}" style="left:${left}%;width:${width}%;" title="${escapeHtml(title)}">${escapeHtml(row.id)} ${escapeHtml(row.lot)}</div>`;
        })
        .join("");
      return `<div class="lane"><strong>${lane}</strong><div class="track">${bars}</div></div>`;
    })
    .join("");
}

function normalizeHeader(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[\s_\-:：()（）/\\|]/g, "");
}

function findColumn(headers, key) {
  const aliases = columnAliases[key].map(normalizeHeader);
  return headers.findIndex((header) =>
    aliases.some((alias) => header === alias || header.includes(alias) || alias.includes(header)),
  );
}

function hasKnownHeaders(row) {
  const headers = row.map(normalizeHeader);
  return Object.keys(columnAliases).filter((key) => findColumn(headers, key) >= 0).length >= 2;
}

function compactOcrRow(row) {
  const cells = row.map((cell) => String(cell || "").trim()).filter(Boolean);
  if (cells.length <= 6) return cells;

  const numericIndexes = cells
    .map((cell, index) => ({ cell, index }))
    .filter(({ cell }) => /^-?\d+(\.\d+)?$/.test(cell))
    .map(({ index }) => index);

  if (numericIndexes.length >= 3) {
    const timeIndexes = numericIndexes.slice(-3);
    const prefix = cells.slice(0, timeIndexes[0]);
    const id = prefix[0] || "";
    const lot = prefix[1] || "";
    const route = prefix.slice(2).join(" ") || cells[timeIndexes[0] - 1] || "";
    return [id, lot, route, cells[timeIndexes[0]], cells[timeIndexes[1]], cells[timeIndexes[2]]];
  }

  return [cells[0], cells[1], cells.slice(2, -3).join(" "), ...cells.slice(-3)];
}

function parseRows(rows) {
  const cleanedRows = rows
    .map((row) => compactOcrRow(Array.isArray(row) ? row : []))
    .filter((row) => row.length && row.some((cell) => String(cell).trim()));
  if (!cleanedRows.length) return [];

  const headerIndex = cleanedRows.findIndex(hasKnownHeaders);
  const hasHeader = headerIndex >= 0;
  const headers = hasHeader ? cleanedRows[headerIndex].map(normalizeHeader) : [];
  const dataRows = hasHeader ? cleanedRows.slice(headerIndex + 1) : cleanedRows;
  const indexMap = hasHeader
    ? {
        id: findColumn(headers, "id"),
        lot: findColumn(headers, "lot"),
        tool: findColumn(headers, "tool"),
        arrival: findColumn(headers, "arrival"),
        processing: findColumn(headers, "processing"),
        due: findColumn(headers, "due"),
      }
    : { id: 0, lot: 1, tool: 2, arrival: 3, processing: 4, due: 5 };

  const get = (row, key, fallback) => {
    const index = indexMap[key];
    return index >= 0 && row[index] !== undefined && row[index] !== "" ? row[index] : fallback;
  };

  return dataRows
    .filter((row) => row.length >= 6)
    .map((row, index) => ({
      id: get(row, "id", `T${index + 1}`),
      lot: get(row, "lot", `L${String(index + 1).padStart(3, "0")}`),
      tool: get(row, "tool", "A-B"),
      arrival: get(row, "arrival", 0),
      processing: get(row, "processing", 1),
      due: get(row, "due", 0),
    }));
}

function handleDataFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    if (file.name.toLowerCase().endsWith(".csv")) {
      const rows = String(reader.result)
        .split(/\r?\n/)
        .map((line) => line.split(","));
      tasks = parseRows(rows);
    } else if (window.XLSX) {
      const workbook = XLSX.read(reader.result, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      tasks = parseRows(XLSX.utils.sheet_to_json(sheet, { header: 1 }));
    } else {
      alert("XLSX library is unavailable. Use CSV or check network access.");
    }
    sanitizeTasks();
    renderTasks();
  };
  file.name.toLowerCase().endsWith(".csv") ? reader.readAsText(file) : reader.readAsArrayBuffer(file);
}

function ocrTextToRows(text) {
  return String(text)
    .split(/\r?\n/)
    .map((line) => line.replace(/[|｜]/g, " ").trim())
    .filter(Boolean)
    .map((line) => {
      const wideSplit = line.split(/\s{2,}|\t+/).filter(Boolean);
      return wideSplit.length >= 6 ? wideSplit : line.split(/\s+/).filter(Boolean);
    });
}

async function handleOcrFile(file) {
  if (!window.Tesseract) {
    $("ocrStatus").textContent = "Tesseract.js is unavailable. Check network access.";
    return;
  }

  $("ocrStatus").textContent = language === "zh" ? "OCR 辨識中..." : "OCR running...";
  let result;
  try {
    result = await Tesseract.recognize(file, "eng+chi_tra");
  } catch {
    result = await Tesseract.recognize(file, "eng");
  }

  const importedTasks = parseRows(ocrTextToRows(result.data.text));
  if (importedTasks.length) {
    tasks = importedTasks;
    sanitizeTasks();
    renderTasks();
    $("ocrStatus").textContent =
      language === "zh" ? `OCR 已匯入 ${tasks.length} 筆資料。` : `OCR imported ${tasks.length} rows.`;
  } else {
    $("ocrStatus").textContent =
      language === "zh"
        ? "OCR 完成，但沒有找到可匯入的任務列。照片表格請使用：任務、Lot、路徑、可開始時間、搬運時間、需求到達時間。沒有表頭也可以，但每列需照這個順序。"
        : "OCR completed, but no task rows were found. Use columns: Task, Lot, Route, Start-Ready Time, Transport Time, Required Arrival Time. Headerless rows may use the same order.";
  }
}

function handlePhotoFile(file) {
  selectedPhotoFile = file;
  $("photoImage").src = URL.createObjectURL(file);
  $("photoPreview").hidden = false;
  $("ocrStatus").textContent =
    language === "zh"
      ? "照片已匯入，可直接參考；需要讀取表格時再按 OCR。"
      : "Photo imported for reference. Click OCR only if you want to read a table.";
}

function exportExcel() {
  if (!schedule.length) runSchedule();
  const analysisRows = Object.entries(
    schedule.reduce((acc, row) => {
      acc[row.method] = acc[row.method] || [];
      acc[row.method].push(row);
      return acc;
    }, {}),
  ).map(([method, rows]) => ({ method, ...analyze(rows) }));

  if (window.XLSX) {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(schedule), "Schedule Result");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(analysisRows), "Analysis");
    XLSX.writeFile(workbook, "OHT_Schedule_Result.xlsx");
    return;
  }

  const csv = schedule.map((row) => Object.values(row).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "OHT_Schedule_Result.csv";
  link.click();
  URL.revokeObjectURL(link.href);
}

$("taskRows").addEventListener("input", (event) => {
  const { index, field } = event.target.dataset;
  if (index === undefined || !field) return;
  tasks[index][field] = ["arrival", "processing", "due"].includes(field)
    ? numberValue(event.target.value)
    : event.target.value;
});

$("taskRows").addEventListener("click", (event) => {
  const index = event.target.dataset.delete;
  if (index === undefined) return;
  tasks.splice(Number.parseInt(index, 10), 1);
  renderTasks();
});

$("addTask").addEventListener("click", () => {
  tasks.push({
    id: `T${tasks.length + 1}`,
    lot: `L${String(tasks.length + 1).padStart(3, "0")}`,
    tool: "A-B",
    arrival: 0,
    processing: 5,
    due: 20,
  });
  renderTasks();
});
$("loadSample").addEventListener("click", () => {
  tasks = structuredClone(sampleTasks);
  schedule = [];
  renderTasks();
  renderResults();
});
$("runSchedule").addEventListener("click", runSchedule);
$("exportExcel").addEventListener("click", exportExcel);
$("languageSelect").addEventListener("change", (event) => {
  language = event.target.value;
  translate();
});
$("themeToggle").addEventListener("click", () => {
  document.documentElement.classList.toggle("light");
  translate();
});
$("dataFile").addEventListener("change", (event) => event.target.files[0] && handleDataFile(event.target.files[0]));
$("photoFile").addEventListener("change", (event) => event.target.files[0] && handlePhotoFile(event.target.files[0]));
$("runPhotoOcr").addEventListener("click", () => {
  if (selectedPhotoFile) handleOcrFile(selectedPhotoFile);
});

renderTasks();
renderResults();
translate();
