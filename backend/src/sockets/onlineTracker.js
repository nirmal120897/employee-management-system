
const onlineUsers = new Map(); // userId -> Set<socketId>

export const addOnlineUser = (userId, socketId) => {
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }
  onlineUsers.get(userId).add(socketId);
};

export const removeOnlineUser = (userId, socketId) => {
  if (!onlineUsers.has(userId)) return false;

  const sockets = onlineUsers.get(userId);
  sockets.delete(socketId);

  if (sockets.size === 0) {
    onlineUsers.delete(userId);
    return true;
  }
  return false;
};

export const removeSocketEverywhere = (socketId) => {
  for (const [userId, sockets] of onlineUsers.entries()) {
    if (sockets.has(socketId)) {
      sockets.delete(socketId);
      if (sockets.size === 0) onlineUsers.delete(userId);
      return userId;
    }
  }
  return null;
};

export const getOnlineCount = () => onlineUsers.size;