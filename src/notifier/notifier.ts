import type { AppointmentSlot } from "../types";

export interface NotifierContext {
  checkedAt: string;
  source: string;
}

export interface Notifier {
  notify(newSlots: AppointmentSlot[], context: NotifierContext): Promise<void>;
}
