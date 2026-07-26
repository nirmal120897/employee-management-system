import fs from "fs";
import {
  createDocumentService,
  getAllDocumentsService,
  getDocumentByIdService,
  deleteDocumentService,
  updateDocumentStatusService,
  getDocumentFilePath,
  saveDocumentChunksService,
  getDocumentChunksService,
  storeChunkEmbeddingService,
  searchSimilarChunksService,
} from "../services/document.service.js";
import { parsePDFService } from "../services/pdfParser.service.js";
import { chunkText } from "../services/chunking.service.js";
import { generateEmbedding } from "../services/embedding.service.js";
import { chatCompletion } from "../services/llm.service.js";

const handleError = (res, error) => {
  console.error(error.message);
  const status = error.statusCode || 500;
  return res
    .status(status)
    .json({ error: true, message: error.message || "Something went wrong" });
};

// POST /api/documents/upload  (ADMIN only, multipart/form-data: file + title)
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ error: true, message: "PDF file is required" });
    }

    const { title } = req.body;
    if (!title || !title.trim()) {
      fs.unlinkSync(req.file.path);
      return res
        .status(400)
        .json({ error: true, message: "title is required" });
    }

    const document = await createDocumentService({
      title: title.trim(),
      fileName: req.file.filename,
      uploadedBy: req.user.user_id,
    });

    return res
      .status(201)
      .json({ error: false, message: "Document uploaded", data: document });
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return handleError(res, error);
  }
};

// GET /api/documents
export const getAllDocuments = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 10, 1),
      100,
    );
    const documents = await getAllDocumentsService({ page, limit });
    return res.status(200).json({ error: false, data: documents });
  } catch (error) {
    return handleError(res, error);
  }
};

// GET /api/documents/:id
export const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await getDocumentByIdService(id);
    return res.status(200).json({ error: false, data: document });
  } catch (error) {
    return handleError(res, error);
  }
};

// DELETE /api/documents/:id  (ADMIN only)
export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteDocumentService(id);
    return res
      .status(200)
      .json({ error: false, message: "Document deleted", data: result });
  } catch (error) {
    return handleError(res, error);
  }
};

// POST /api/documents/:id/parse  (ADMIN only)
export const parseDocument = async (req, res) => {
  const { id } = req.params;

  try {
    const document = await getDocumentByIdService(id);

    await updateDocumentStatusService(id, "PROCESSING");

    const filePath = getDocumentFilePath(document.fileName);

    let parsed;
    try {
      parsed = await parsePDFService(filePath);
    } catch (parseError) {
      await updateDocumentStatusService(id, "FAILED");
      return handleError(res, parseError);
    }

    await updateDocumentStatusService(id, "PARSED");

    return res.status(200).json({
      error: false,
      message: "PDF parsed successfully",
      data: {
        documentId: id,
        totalPages: parsed.totalPages,
        metadata: parsed.metadata,
        text: parsed.text,
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// POST /api/documents/:id/chunk  (ADMIN only)
export const chunkDocument = async (req, res) => {
  const { id } = req.params;

  try {
    const document = await getDocumentByIdService(id);
    const filePath = getDocumentFilePath(document.fileName);

    let parsed;
    try {
      parsed = await parsePDFService(filePath);
    } catch (parseError) {
      console.error(
        `[chunkDocument] parsing failed for document ${id}:`,
        parseError.message,
      );
      return handleError(res, parseError);
    }

    const { chunkSize, overlap } = req.body || {};

    let chunks;
    try {
      chunks = chunkText(parsed.text, {
        chunkSize: chunkSize ? Number(chunkSize) : undefined,
        overlap: overlap ? Number(overlap) : undefined,
      });
    } catch (chunkError) {
      console.error(
        `[chunkDocument] chunking failed for document ${id}:`,
        chunkError.message,
      );
      return handleError(res, chunkError);
    }

    const result = await saveDocumentChunksService(id, chunks);
    // DB se saved chunks lao (ab inke paas id hogi)
    const savedChunks = await getDocumentChunksService(id);
    let embedded = 0;
    for (const chunk of savedChunks) {
      const embedding = await generateEmbedding(chunk.content);
      await storeChunkEmbeddingService(chunk.id, embedding);
      embedded++;
    }
   
    console.log(
      `[chunkDocument] document ${id} chunked into ${result.totalChunks} pieces`,
    );

     console.log(
      `[embedDocument] embedded ${embedded}/${savedChunks.length} chunks for document ${id}`,
    );

    return res.status(201).json({
      error: false,
      message: "Document chunked successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// GET /api/documents/:id/chunks
export const getDocumentChunks = async (req, res) => {
  try {
    const { id } = req.params;
    await getDocumentByIdService(id);

    const chunks = await getDocumentChunksService(id);
    return res.status(200).json({ error: false, data: chunks });
  } catch (error) {
    return handleError(res, error);
  }
};

// POST /api/documents/:id/embed  (ADMIN only)
export const embedDocument = async (req, res) => {
  const { id } = req.params;

  try {
    await getDocumentByIdService(id);

    const chunks = await getDocumentChunksService(id);
    if (chunks.length === 0) {
      return res.status(400).json({
        error: true,
        message: "Document has no chunks yet - call /chunk before /embed",
      });
    }

    let embedded = 0;
    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk.content);
      await storeChunkEmbeddingService(chunk.id, embedding);
      embedded++;
    }

    console.log(
      `[embedDocument] embedded ${embedded}/${chunks.length} chunks for document ${id}`,
    );

    return res.status(200).json({
      error: false,
      message: "Embeddings generated and stored",
      data: { documentId: id, totalChunksEmbedded: embedded },
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// POST /api/documents/ask  (any authenticated user)
export const askQuestion = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res
        .status(400)
        .json({ error: true, message: "question is required" });
    }

    const questionEmbedding = await generateEmbedding(question);
    const matches = await searchSimilarChunksService(questionEmbedding, 5);

    if (matches.length === 0) {
      return res.status(200).json({
        error: false,
        data: {
          answer:
            "I don't have any company documents to answer that from yet. Ask an Admin to upload and process relevant PDFs first.",
          sources: [],
        },
      });
    }

    const contextText = matches
      .map((m, i) => `[${i + 1}] ${m.content}`)
      .join("\n\n");

    const answer = await chatCompletion([
      {
        role: "system",
        content:
          "You are an HR policy assistant. Answer the user's question using ONLY the provided context excerpts. " +
          "If the answer isn't contained in the context, say you don't have that information - do not make anything up.",
      },
      {
        role: "user",
        content: `Context:\n${contextText}\n\nQuestion: ${question}`,
      },
    ]);

    return res.status(200).json({
      error: false,
      data: {
        answer,
        sources: matches.map((m) => ({
          chunkId: m.id,
          documentId: m.documentId,
          similarity: Number(m.similarity).toFixed(3),
        })),
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
};
