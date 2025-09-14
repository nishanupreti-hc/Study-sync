// Sync utility module
export const syncData = async (data) => {
  // Placeholder sync functionality
  return data;
};

export const syncStatus = {
  online: navigator.onLine,
  lastSync: null
};

export default { syncData, syncStatus };
