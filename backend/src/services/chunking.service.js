const DEFAULT_CHUNK_SIZE = parseInt(process.env.CHUNK_SIZE, 10) || 900;
const DEFAULT_CHUNK_OVERLAP = parseInt(process.env.CHUNK_OVERLAP, 10) || 175;

const getOverlapTail = (text, overlap) => {
  if (!text) return "";
  return text.slice(Math.max(0, text.length - overlap));
};

const splitLongParagraph = (paragraph, chunkSize, overlap) => {
  const pieces = [];
  let start = 0;

  while (start < paragraph.length) {
    const end = Math.min(start + chunkSize, paragraph.length);
    pieces.push(paragraph.slice(start, end));
    if (end === paragraph.length) break;
    start = end - overlap;
  }

  return pieces;
};

export const chunkText = (text, options = {}) => {
  const chunkSize = options.chunkSize || DEFAULT_CHUNK_SIZE;
  const overlap = options.overlap || DEFAULT_CHUNK_OVERLAP;

  if (!text || !text.trim()) {
    const err = new Error("Cannot chunk empty text");
    err.statusCode = 400;
    throw err;
  }

  if (overlap >= chunkSize) {
    const err = new Error("overlap must be smaller than chunkSize");
    err.statusCode = 400;
    throw err;
  }

  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const chunks = [];
  let current = "";

  for (const paragraph of paragraphs) {
    if (paragraph.length > chunkSize) {
      const subPieces = splitLongParagraph(paragraph, chunkSize, overlap);
      for (const piece of subPieces) {
        if (current.length + piece.length + 2 > chunkSize) {
          if (current) chunks.push(current);
          current = getOverlapTail(current, overlap) + piece;
        } else {
          current = current ? `${current}\n\n${piece}` : piece;
        }
      }
      continue;
    }

    if (current.length + paragraph.length + 2 <= chunkSize) {
      current = current ? `${current}\n\n${paragraph}` : paragraph;
    } else {
      chunks.push(current);
      const tail = getOverlapTail(current, overlap);
      current = tail ? `${tail}\n\n${paragraph}` : paragraph;
    }
  }

  if (current) chunks.push(current);

  console.log(
    `[chunking.service] produced ${chunks.length} chunks (chunkSize=${chunkSize}, overlap=${overlap})`
  );

  return chunks;
};