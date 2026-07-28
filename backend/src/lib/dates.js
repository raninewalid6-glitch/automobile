// Renvoie une date SQL au format "AAAA-MM-JJ" (sans décalage de fuseau horaire)
export function toDateString(value) {
  if (!(value instanceof Date)) return value;
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
