export function isValidIndianMobile(raw: string): boolean {
  const digits = raw.replace(/\D/g, "");
  const last10 = digits.slice(-10);
  return /^[6-9]\d{9}$/.test(last10);
}

export function normalizeIndianMobile(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return digits.slice(-10);
}

export type BookingFormErrors = Partial<
  Record<
    | "fullName"
    | "whatsapp"
    | "activity"
    | "preferredDate"
    | "preferredTime"
    | "area"
    | "age"
    | "consent",
    string
  >
>;

export function validateBookingInput(input: {
  fullName: string;
  whatsapp: string;
  activity: string;
  preferredDate: string;
  preferredTime: string;
  area: string;
  isAdult: boolean;
  agreesToContact: boolean;
}): BookingFormErrors {
  const errors: BookingFormErrors = {};

  if (!input.fullName || input.fullName.trim().length < 2) {
    errors.fullName = "Please enter your full name.";
  }
  if (!isValidIndianMobile(input.whatsapp)) {
    errors.whatsapp = "Enter a valid 10-digit Indian mobile number.";
  }
  if (!input.activity) {
    errors.activity = "Please choose an activity.";
  }
  if (!input.preferredDate) {
    errors.preferredDate = "Please pick a date.";
  }
  if (!input.preferredTime) {
    errors.preferredTime = "Please pick a time.";
  }
  if (!input.area || input.area.trim().length < 2) {
    errors.area = "Please tell us the area in Bangalore.";
  }
  if (!input.isAdult || !input.agreesToContact) {
    errors.consent = "Both checkboxes are required.";
  }

  return errors;
}
