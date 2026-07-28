const colorCache = new WeakMap<HTMLImageElement, string>();

type ColorBucket = {
  count: number;
  red: number;
  green: number;
  blue: number;
};

export function dominantColor(image: HTMLImageElement) {
  const cached = colorCache.get(image);
  if (cached) return cached;

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return;

  canvas.width = 24;
  canvas.height = 24;

  try {
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const buckets = new Map<string, ColorBucket>();

    for (let index = 0; index < pixels.length; index += 4) {
      if (pixels[index + 3] < 180) continue;

      const red = pixels[index];
      const green = pixels[index + 1];
      const blue = pixels[index + 2];
      const brightness = (red + green + blue) / 3;
      if (brightness < 18 || brightness > 242) continue;

      const key = `${red >> 5}-${green >> 5}-${blue >> 5}`;
      const bucket = buckets.get(key) ?? { count: 0, red: 0, green: 0, blue: 0 };
      bucket.count += 1;
      bucket.red += red;
      bucket.green += green;
      bucket.blue += blue;
      buckets.set(key, bucket);
    }

    let mostUsed: ColorBucket | undefined;
    for (const bucket of buckets.values()) {
      if (!mostUsed || bucket.count > mostUsed.count) mostUsed = bucket;
    }

    if (!mostUsed) return;

    const color = `rgb(${Math.round(mostUsed.red / mostUsed.count)} ${Math.round(mostUsed.green / mostUsed.count)} ${Math.round(mostUsed.blue / mostUsed.count)})`;
    colorCache.set(image, color);
    return color;
  } catch {
    return;
  }
}
