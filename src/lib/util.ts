export function isDeepEqual(obj1: any, obj2: any): boolean {
  // Check if both objects are of the same type
  if (typeof obj1 !== typeof obj2) {
    return false;
  }

  // If the objects are primitives, perform a simple comparison
  if (typeof obj1 !== "object" || obj1 === null || obj2 === null) {
    return obj1 === obj2;
  }

  // Get the keys of both objects
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  // Check if the number of keys is the same
  if (keys1.length !== keys2.length) {
    return false;
  }

  // Check if all keys and values are deeply equal
  for (let key of keys1) {
    if (!isDeepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}
