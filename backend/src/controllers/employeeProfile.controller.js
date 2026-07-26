import {
  createEmployeeProfileService,
  updateEmployeeProfileService,
  getAllEmployeeProfilesService,
  getEmployeeProfileByIdService,
  deleteEmployeeProfileService,
  storeProfileEmbeddingService,
  searchSimilarProfilesService,
  buildProfileEmbeddingText,
} from "../services/employeeProfile.service.js";
import { generateEmbedding } from "../services/embedding.service.js";

const handleError = (res, error) => {
  console.error(error.message);
  const status = error.statusCode || 500;
  return res.status(status).json({ error: true, message: error.message || "Something went wrong" });
};

export const createProfile = async (req, res) => {
  try {
    const { userId, name, skills, department, experience } = req.body;

    if (!userId || !name || !department || !experience) {
      return res.status(400).json({
        error: true,
        message: "userId, name, department and experience are required",
      });
    }

    if (skills && !Array.isArray(skills)) {
      return res.status(400).json({ error: true, message: "skills must be an array of strings" });
    }

    const profile = await createEmployeeProfileService({
      userId,
      name,
      skills: skills || [],
      department,
      experience,
    });

    const embeddingText = buildProfileEmbeddingText(profile);
    const embedding = await generateEmbedding(embeddingText);
    await storeProfileEmbeddingService(profile.id, embedding);

    return res.status(201).json({ error: false, message: "Employee profile created and indexed", data: profile });
  } catch (error) {
    return handleError(res, error);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await updateEmployeeProfileService(id, req.body);

    const embeddingText = buildProfileEmbeddingText(profile);
    const embedding = await generateEmbedding(embeddingText);
    await storeProfileEmbeddingService(profile.id, embedding);

    return res.status(200).json({ error: false, message: "Profile updated and re-indexed", data: profile });
  } catch (error) {
    return handleError(res, error);
  }
};

export const getAllProfiles = async (req, res) => {
  try {
    const profiles = await getAllEmployeeProfilesService();
    return res.status(200).json({ error: false, data: profiles });
  } catch (error) {
    return handleError(res, error);
  }
};

export const getProfileById = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await getEmployeeProfileByIdService(id);
    return res.status(200).json({ error: false, data: profile });
  } catch (error) {
    return handleError(res, error);
  }
};

export const deleteProfile = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteEmployeeProfileService(id);
    return res.status(200).json({ error: false, message: "Profile deleted" });
  } catch (error) {
    return handleError(res, error);
  }
};

export const searchProfiles = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({ error: true, message: "query is required" });
    }

    const queryEmbedding = await generateEmbedding(query);
    const matches = await searchSimilarProfilesService(queryEmbedding, 5);

    return res.status(200).json({
      error: false,
      data: matches.map((m) => ({
        ...m,
        similarity: Number(m.similarity).toFixed(3),
      })),
    });
  } catch (error) {
    return handleError(res, error);
  }
};