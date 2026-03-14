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
export function makeAddedAtByVolume(start, end, date) {

  const result = {}

  const value =
    date ||
    new Date().toISOString().slice(0, 10)

  for (let i = start; i <= end; i++) {
    result[i] = value
  }

  return result
}