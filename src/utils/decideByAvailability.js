export default function decideByAvailability(options) {
  const { source, resultNone, resultFew, resultNormal } = options;
  if (source === 0) return resultNone;
  if (source <= 5) return resultFew;
  return resultNormal;
}
