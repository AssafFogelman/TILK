const DISTANCES = [50, 100, 200, 500, 1000, 5000, 10000];

export const distanceMessage = (
  leadingItemDistance: number | undefined,
  trailingItemDistance: number
) => {
  let leadingItemDistanceIsSmallerThanCellNo = 0;
  let trailingItemDistanceIsSmallerThanCellNo = 0;

  const properDistance = (distance: number) => {
    if (distance >= 1000) return Math.trunc(distance / 1000) + " KM";
    return Math.trunc(distance) + " Meters";
  };

  for (let i = 0; i < DISTANCES.length; i++) {
    if (leadingItemDistance !== undefined) {
      if (leadingItemDistance > DISTANCES[i]) {
        leadingItemDistanceIsSmallerThanCellNo = i + 1;
      }
    }
    if (trailingItemDistance > DISTANCES[i]) {
      trailingItemDistanceIsSmallerThanCellNo = i + 1;
    }
  }

  if (leadingItemDistance === undefined) {
    return properDistance(DISTANCES[trailingItemDistanceIsSmallerThanCellNo]);
  }

  if (
    leadingItemDistanceIsSmallerThanCellNo ===
    trailingItemDistanceIsSmallerThanCellNo
  ) {
    return null;
  }

  if (trailingItemDistanceIsSmallerThanCellNo === DISTANCES.length) {
    return `more than ${properDistance(DISTANCES[DISTANCES.length - 1])}`;
  }
  return properDistance(DISTANCES[trailingItemDistanceIsSmallerThanCellNo]);
};
