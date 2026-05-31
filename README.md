# OHT Scheduling System

Open `index.html` in a browser to run the app.

## Features

- Manual task table entry and sample data
- Excel, XLS, and CSV import through SheetJS when CDN access is available
- Photo import with preview
- Optional OCR table reading from the imported photo through Tesseract.js when CDN access is available
- EDD and SPT scheduling across 1 to 999 OHT vehicles
- EDD/SPT comparison with makespan, total tardiness, average delay, and max delay
- OHT Gantt chart
- Dark and light modes
- English and Traditional Chinese UI
- Excel export to `OHT_Schedule_Result.xlsx` when SheetJS is available, with CSV fallback

## Required Columns

The importer accepts English or Chinese headers matching these concepts:

- Task / 任務
- Lot
- Route / Path / 路徑
- Start-Ready Time / Ready Time / 可開始時間
- Transport Time / Move Time / 搬運時間
- Required Arrival Time / Required Arrival / 需求到達時間

Legacy headers such as Tool, Machine, Arrival, Processing, Due, 機台, 到達, 加工, and 交期 are still accepted for compatibility.

For photo OCR, the table can include headers or omit headers. If headers are omitted, each row must follow this order:

`Task, Lot, Route, Start-Ready Time, Transport Time, Required Arrival Time`

## Scheduling Rules

For both EDD and SPT, scheduling is dynamic:

1. Select the OHT with the earliest available time.
2. Find tasks whose start-ready time is less than or equal to that OHT available time.
3. If no task is available, advance that OHT to the next earliest start-ready time.
4. EDD selects the available task with the earliest required arrival time.
5. SPT selects the available task with the shortest transport time.
6. Assign the selected task to that OHT and update the OHT available time to the task finish time.
