import prisma from "../config/db.js";

export const createEmployeeProfileService = async ({ userId, name, skills, department, experience }) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  const existing = await prisma.employeeProfile.findUnique({ where: { userId } });
  if (existing) {
    const err = new Error("Profile already exists for this user - use update instead");
    err.statusCode = 409;
    throw err;
  }

  const profile = await prisma.employeeProfile.create({
    data: { userId, name, skills, department, experience },
    select: { id: true, userId: true, name: true, skills: true, department: true, experience: true, createdAt: true },
  });

  return profile;
};

export const updateEmployeeProfileService = async (id, { name, skills, department, experience }) => {
  const profile = await prisma.employeeProfile.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(skills && { skills }),
      ...(department && { department }),
      ...(experience && { experience }),
    },
    select: { id: true, userId: true, name: true, skills: true, department: true, experience: true },
  });

  return profile;
};

export const getAllEmployeeProfilesService = async () => {
  return prisma.employeeProfile.findMany({
    select: { id: true, userId: true, name: true, skills: true, department: true, experience: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
};

export const getEmployeeProfileByIdService = async (id) => {
  const profile = await prisma.employeeProfile.findUnique({
    where: { id },
    select: { id: true, userId: true, name: true, skills: true, department: true, experience: true, createdAt: true },
  });
  if (!profile) {
    const err = new Error("Employee profile not found");
    err.statusCode = 404;
    throw err;
  }
  return profile;
};

export const deleteEmployeeProfileService = async (id) => {
  await prisma.employeeProfile.delete({ where: { id } });
};

export const storeProfileEmbeddingService = async (profileId, embedding) => {
  const vectorLiteral = `[${embedding.join(",")}]`;
  await prisma.$executeRaw`UPDATE employee_profiles SET embedding = ${vectorLiteral}::vector WHERE id = ${profileId}`;
};

export const searchSimilarProfilesService = async (queryEmbedding, limit = 5) => {
  const vectorLiteral = `[${queryEmbedding.join(",")}]`;
  const results = await prisma.$queryRaw`
    SELECT id, "userId", name, skills, department, experience,
           1 - (embedding <=> ${vectorLiteral}::vector) AS similarity
    FROM employee_profiles
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> ${vectorLiteral}::vector
    LIMIT ${limit}
  `;
  return results;
};

export const buildProfileEmbeddingText = ({ name, skills, department, experience }) => {
  const skillsText = Array.isArray(skills) ? skills.join(", ") : "";
  return `${name} works in the ${department} department. Skills: ${skillsText}. Experience: ${experience}.`;
};