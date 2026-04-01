import { config } from "../config/index";
import type { AppointmentSlot, AvailabilitySnapshot } from "../types";

interface ApiOfficeResponse {
  officeId: number;
  appointments: number[];
}

interface ApiResponse {
  offices?: ApiOfficeResponse[];
}

interface AvailableDay {
  time: string;
}

interface AvailableDaysResponse {
  availableDays?: AvailableDay[];
}

interface RouteParams {
  serviceId: number;
  officeId: number;
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function toDisplayDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

function toDisplayTime(date: Date): string {
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function fromIsoDateToDisplayDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  if (!year || !month || !day) {
    return isoDate;
  }

  return `${day}.${month}.${year}`;
}

function createFallbackDaySlot(isoDate: string): AppointmentSlot {
  const displayDate = fromIsoDateToDisplayDate(isoDate);
  return {
    date: displayDate,
    time: "day-available",
    displayText: `${displayDate} available day detected (times endpoint empty)`
  };
}

export function parseRouteParams(appointmentUrl: string): RouteParams {
  const serviceMatch = appointmentUrl.match(/\/services\/(\d+)/i);
  const officeMatch = appointmentUrl.match(/\/locations\/(\d+)/i);

  if (!serviceMatch || !officeMatch) {
    throw new Error("Unable to parse serviceId/officeId from APPOINTMENT_URL");
  }

  return {
    serviceId: Number(serviceMatch[1]),
    officeId: Number(officeMatch[1])
  };
}

async function fetchAppointmentsForDate(
  isoDate: string,
  officeId: number,
  serviceId: number
): Promise<AppointmentSlot[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.requestTimeoutMs);

  try {
    const query = new URLSearchParams({
      date: isoDate,
      officeId: String(officeId),
      serviceId: String(serviceId),
      serviceCount: String(config.serviceCount)
    });

    const url = `${config.appointmentApiBaseUrl}?${query.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        accept: "*/*",
        referer: "https://stadt.muenchen.de/"
      },
      signal: controller.signal
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json().catch(() => ({}))) as ApiResponse;
    const office = payload.offices?.find((entry) => entry.officeId === officeId);
    const timestamps = office?.appointments ?? [];

    return timestamps.map((timestamp) => {
      const dateObj = new Date(timestamp * 1000);
      const displayDate = toDisplayDate(dateObj);
      const displayTime = toDisplayTime(dateObj);

      return {
        date: displayDate,
        time: displayTime,
        displayText: `${displayDate} ${displayTime}`
      };
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchAvailableDays(
  startDate: Date,
  endDate: Date,
  officeId: number,
  serviceId: number
): Promise<string[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.requestTimeoutMs);

  try {
    const query = new URLSearchParams({
      startDate: toIsoDate(startDate),
      endDate: toIsoDate(endDate),
      officeId: String(officeId),
      serviceId: String(serviceId),
      serviceCount: String(config.serviceCount)
    });

    const url = `${config.availableDaysApiBaseUrl}?${query.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        accept: "*/*",
        referer: "https://stadt.muenchen.de/"
      },
      signal: controller.signal
    });

    console.debug(`Available days API response status: ${response.status}`);

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json().catch(() => ({}))) as AvailableDaysResponse;

    console.debug(`Available days API payload: ${JSON.stringify(payload)}`);

    return (payload.availableDays ?? [])
      .map((entry) => entry.time)
      .filter((value): value is string => typeof value === "string" && value.length > 0);
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchAvailabilitySnapshotFromApi(
  now = new Date()
): Promise<AvailabilitySnapshot> {
  const { officeId, serviceId } = parseRouteParams(config.appointmentUrl);
  const slots: AppointmentSlot[] = [];

  const startDate = new Date(now);
  const endDate = new Date(now);
  endDate.setDate(now.getDate() + config.lookaheadDays - 1);

  const availableIsoDates = await fetchAvailableDays(
    startDate,
    endDate,
    officeId,
    serviceId
  );

  for (const isoDate of availableIsoDates) {
    const daySlots = await fetchAppointmentsForDate(isoDate, officeId, serviceId);

    if (daySlots.length > 0) {
      slots.push(...daySlots);
    } else {
      slots.push(createFallbackDaySlot(isoDate));
    }
  }

  const uniqueSlots = Array.from(
    new Map(slots.map((slot) => [`${slot.date}|${slot.time}`, slot])).values()
  ).sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

  return {
    checkedAt: new Date().toISOString(),
    hasAvailability: uniqueSlots.length > 0,
    slots: uniqueSlots
  };
}
