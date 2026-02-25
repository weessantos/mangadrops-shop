// src/utils/volumeDates.js

// YYYY-MM-DD na timezone do Brasil (São Paulo)
export function todayBR() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

// Gera: { 1: "2026-02-25", 2: "2026-02-25", ... }
export function makeAddedAtByVolume(start, end, date = todayBR()) {
  const obj = {};
  for (let v = start; v <= end; v++) obj[v] = date;
  return obj;
}