(async () => {
  const domain = window.location.origin;

  const storageData = await browser.storage.sync.get(["localStorageExceptions", "localStorageMaxLifetime"]);
  const exceptions = Array.isArray(storageData.localStorageExceptions) ? storageData.localStorageExceptions : [];
  const localStorageMaxLifetime = (Number(storageData.localStorageMaxLifetime) || 24) * 60 * 60 * 1000;

  const isWhitelisted = exceptions.some((e) => {
    const trimmed = e.trim();
    return trimmed && domain.includes(trimmed);
  });

  if (isWhitelisted) {
    return;
  }

  const lastCleanedKey = "myExtension_lastLocalstorageCleaned";

  try {
    const lastCleanedTimestamp = localStorage.getItem(lastCleanedKey);

    if (
      !lastCleanedTimestamp ||
      Date.now() - parseInt(lastCleanedTimestamp, 10) > localStorageMaxLifetime
    ) {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key !== lastCleanedKey) {
          localStorage.removeItem(key);
        }
      }
      localStorage.setItem(lastCleanedKey, Date.now().toString());
    }
  } catch (e) {}
})();
