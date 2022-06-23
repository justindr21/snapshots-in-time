export function createWikimediaImage(image: string, width = 300): string {
  console.log(
    `https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/${encodeURIComponent(
      image
    )}&width=${width}`
  );
  return `https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/${encodeURIComponent(
    image
  )}&width=${width}`;
}

export function createContentfulImage(image: string, width = 300): string {
  console.log(image);
  console.log(`${encodeURIComponent(image)}&width=${width}`);
  // return `${encodeURIComponent(image)}&width=${width}`;
  return image;
}
