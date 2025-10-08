export function encodeBase64(text: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  let binary = "";
  data.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary);
}

export function getItemIdFromUrl(url: string) {
  const regex = /^.+\/.+$/;
  const isValidUrl = regex.test(url);

  if (!isValidUrl) return "";

  const urlParts = url.split("/");
  return urlParts[urlParts.length - 1];
}

export function getKeysBetweenKeys(
  obj: object,
  startKey: string,
  endKey: string,
) {
  const keys = Object.keys(obj);
  const startIndex = keys.indexOf(startKey);
  const endIndex = keys.indexOf(endKey);

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    return [];
  }

  const result = [];
  for (let i = startIndex + 1; i < endIndex; i++) {
    result.push(keys[i]);
  }

  return result;
}

export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
