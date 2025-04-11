// mood-journal-app/client/src/utils/localStorageUtils.ts

export const saveToLocalStorage = (key: string, value: any) => {
  const existingEntries = JSON.parse(localStorage.getItem(key) || "[]");
  existingEntries.push(value);
  localStorage.setItem(key, JSON.stringify(existingEntries));
};

export const loadFromLocalStorage = (key: string) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};
