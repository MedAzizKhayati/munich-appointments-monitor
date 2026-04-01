export interface AppointmentSlot {
  date: string;
  time: string;
  displayText: string;
}

export interface AvailabilitySnapshot {
  checkedAt: string;
  hasAvailability: boolean;
  slots: AppointmentSlot[];
}

export interface JobResult {
  snapshot: AvailabilitySnapshot;
  newlyAvailableSlots: AppointmentSlot[];
}
