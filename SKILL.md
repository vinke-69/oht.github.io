---
name: oht-scheduling-system
description: Build, adapt, or troubleshoot an OHT (Overhead Hoist Transport) scheduling web app. Use when the user asks for OHT dispatching, EDD/SPT scheduling, lot transport tables, photo/Excel import, Gantt charts, tardiness metrics, Excel export, or changes to the bundled OHT scheduling system template.
---

# OHT Scheduling System

Use this skill to create or update an OHT scheduling web app based on the bundled template in `assets/oht-scheduling-system/`.

## Template

The template is a static browser app:

- `assets/oht-scheduling-system/index.html`
- `assets/oht-scheduling-system/styles.css`
- `assets/oht-scheduling-system/app.js`
- `assets/oht-scheduling-system/README.md`

Copy the template into the requested output location before modifying it. The app can run directly from `index.html` without a build step.

## Core Data Columns

Use these user-facing columns:

- `Task` / `任務`
- `Lot`
- `Route` / `路徑`
- `Start-Ready Time` / `可開始時間`
- `Transport Time` / `搬運時間`
- `Required Arrival Time` / `需求到達時間`

Keep old import aliases compatible when practical: `Tool`, `Machine`, `Arrival`, `Processing`, `Due`, `機台`, `到達`, `加工`, `交期`.

## Scheduling Rules

EDD and SPT must be dynamic dispatching rules, not global pre-sorts.

For each assignment:

1. Select the OHT with the earliest available time.
2. Find tasks whose `Start-Ready Time` is less than or equal to that OHT available time.
3. If no task is available, advance that OHT to the next earliest `Start-Ready Time`.
4. EDD selects the available task with the earliest `Required Arrival Time`.
5. SPT selects the available task with the shortest `Transport Time`.
6. Assign the task to the OHT, set `start = max(Start-Ready Time, OHT available time)`, set `finish = start + Transport Time`, and update the OHT available time.

Delay is `max(0, finish - Required Arrival Time)`.

## Required Features

Preserve these capabilities unless the user asks to remove them:

- Manual task table entry
- Sample data
- Excel, XLS, and CSV import
- Photo import with preview
- Optional OCR table reading from the imported photo
- EDD scheduling
- SPT scheduling
- EDD/SPT comparison
- Metrics: makespan, total tardiness, average delay, max delay
- OHT Gantt chart
- Excel export with CSV fallback
- English and Traditional Chinese UI
- Dark and light mode

## Photo OCR Guidance

Photo import must not force OCR. Uploading a photo should show a preview only. OCR should run only when the user clicks the OCR button.

For OCR imports, accept either header rows or headerless rows. Headerless rows must follow:

`Task, Lot, Route, Start-Ready Time, Transport Time, Required Arrival Time`

When OCR produces extra cells, prefer the last three numeric cells as the three time fields.

## Verification

After editing:

1. Run JavaScript syntax validation on `app.js`.
2. Check that `index.html` still references `styles.css` and `app.js`.
3. If browser automation is available, open `index.html`, run EDD/SPT/Compare, and verify result rows and Gantt bars render.
