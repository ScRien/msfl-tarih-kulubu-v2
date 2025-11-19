export default function toString(value) {
  try {
    return value.toString();
  } catch {
    return value;
  }
}
