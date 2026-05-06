export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function normalizeToPhilippineE164(localNumber: string) {
  return `+63${digitsOnly(localNumber).slice(-10)}`;
}
