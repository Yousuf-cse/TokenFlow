 const getStorage = async (key: string): Promise<any> => {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => resolve(result[key]));
  });
};

const setStorage = (key: string, value: any): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, () => resolve());
  });
};

export { getStorage, setStorage };