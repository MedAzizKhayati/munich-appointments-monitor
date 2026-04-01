import type { AppointmentSlot } from "../types";

function slotKey(slot: AppointmentSlot): string {
  return `${slot.date}|${slot.time}`;
}

export function detectNewSlots(
  previous: AppointmentSlot[],
  current: AppointmentSlot[]
): AppointmentSlot[] {
  const previousKeys = new Set(previous.map(slotKey));
  return current.filter((slot) => !previousKeys.has(slotKey(slot)));
}
