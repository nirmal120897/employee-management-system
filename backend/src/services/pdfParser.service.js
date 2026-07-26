import fs from "fs";
import pdfParse from "pdf-parse";

/**
 * Pure PDF text-extraction service.
 * Deliberately knows NOTHING about the database, Document model, or chunking -
 * it only takes a file path and returns parsed content.
 */
export const parsePDFService = async (filePath) => {
  if (!fs.existsSync(filePath)) {
    const err = new Error("PDF file not found on disk");
    err.statusCode = 404;
    throw err;
  }

  let dataBuffer;
  try {
    dataBuffer = fs.readFileSync(filePath);
  } catch (readErr) {
    const err = new Error("Unable to read PDF file from disk");
    err.statusCode = 500;
    throw err;
  }

  try {
    const data = await pdfParse(dataBuffer);

    if (!data.text || !data.text.trim()) {
      const err = new Error(
        "PDF appears to be empty, scanned (image-only), or unreadable",
      );
      err.statusCode = 422;
      throw err;
    }

    return {
      totalPages: data.numpages,
      metadata: data.info || {},
      text: data.text,
    };
  } catch (parseErr) {
    if (parseErr.statusCode) throw parseErr;

    const message = /password|encrypted/i.test(parseErr.message)
      ? "PDF is password-protected and cannot be parsed"
      : "PDF is corrupted or in an unsupported format";

    const err = new Error(message);
    err.statusCode = 422;
    throw err;
  }
};
