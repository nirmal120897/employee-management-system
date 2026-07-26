import fs from "fs";
import path from "path";
import prisma from "../config/db.js";

import { parsePDFService } from "../services/pdfParser.service.js";
import { chunkText } from "../services/chunking.service.js";

import { UPLOAD_DOCUMENTS_DIR } from "../config/multer.config.js";

export const createDocumentService = async ({
  title,
  fileName,
  uploadedBy,
}) => {
  const document = await prisma.document.create({
    data: { title, fileName, uploadedBy },
    select: {
      id: true,
      title: true,
      fileName: true,
      uploadedBy: true,
      createdAt: true,
    },
  });
  return document;
};

export const getAllDocumentsService = async ({ page, limit }) => {
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      select: {
        id: true,
        title: true,
        fileName: true,
        uploadedBy: true,
        createdAt: true,
        status: true,
        uploader: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: parseInt(limit),
    }),
    prisma.document.count(),
  ]);
  return {
    documents,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

export const getDocumentByIdService = async (id) => {
  const document = await prisma.document.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      fileName: true,
      uploadedBy: true,
      createdAt: true,
      uploader: { select: { id: true, name: true, email: true } },
    },
  });

  if (!document) {
    const err = new Error("Document not found");
    err.statusCode = 404;
    throw err;
  }

  return document;
};

export const deleteDocumentService = async (id) => {
  const document = await prisma.document.findUnique({ where: { id } });

  if (!document) {
    const err = new Error("Document not found");
    err.statusCode = 404;
    throw err;
  }

  await prisma.document.delete({ where: { id } });

  const filePath = path.join(UPLOAD_DOCUMENTS_DIR, document.fileName);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  return { id, fileName: document.fileName };
};

// ---------- PDF PARSING SUPPORT (new) ----------

export const updateDocumentStatusService = async (id, status) => {
  const document = await prisma.document.update({
    where: { id },
    data: { status },
    select: { id: true, title: true, fileName: true, status: true },
  });
  return document;
};

export const getDocumentFilePath = (fileName) =>
  path.join(UPLOAD_DOCUMENTS_DIR, fileName);

export const saveDocumentChunksService = async (documentId, chunkContents) => {
  await prisma.documentChunk.deleteMany({ where: { documentId } });

  const rows = chunkContents.map((content, index) => ({
    documentId,
    chunkIndex: index,
    content,
  }));

  await prisma.documentChunk.createMany({ data: rows });

  console.log(
    `[document.service] saved ${rows.length} chunks for document ${documentId}`,
  );

  return { documentId, totalChunks: rows.length };
};

// ---------- EMBEDDINGS + VECTOR SEARCH (new) ----------

export const storeChunkEmbeddingService = async (chunkId, embedding) => {
  const vectorLiteral = `[${embedding.join(",")}]`;
  await prisma.$executeRaw`UPDATE document_chunks SET embedding = ${vectorLiteral}::vector WHERE id = ${chunkId}`;
};

export const searchSimilarChunksService = async (queryEmbedding, limit = 5) => {
  const vectorLiteral = `[${queryEmbedding.join(",")}]`;
  const results = await prisma.$queryRaw`
    SELECT id, "documentId", "chunkIndex", content,
           1 - (embedding <=> ${vectorLiteral}::vector) AS similarity
    FROM document_chunks
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> ${vectorLiteral}::vector
    LIMIT ${limit}
  `;
  return results;
};


export const getDocumentChunksService = async (documentId) => {
  return prisma.documentChunk.findMany({
    where: { documentId },
    select: { id: true, chunkIndex: true, content: true, createdAt: true },
    orderBy: { chunkIndex: "asc" },
  });
};