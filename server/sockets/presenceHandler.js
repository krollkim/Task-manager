// In-memory presence store: Map<socketId, { userId, name, avatar }>
const store = new Map();

export const addUser = (socketId, userData) => store.set(socketId, userData);

export const removeUser = (socketId) => {
  const user = store.get(socketId);
  store.delete(socketId);
  return user;
};

export const getOnlineUsers = () => {
  const seen = new Set();
  return Array.from(store.values()).filter(u => {
    if (seen.has(u.userId)) return false;
    seen.add(u.userId);
    return true;
  });
};
