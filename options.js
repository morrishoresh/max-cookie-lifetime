var savedState = {};

function currentState() {
  return {
    maxLifetime: document.querySelector("#maxLifetime").value,
    exceptions: document.querySelector("#exceptions").value,
    localStorageExceptions: document.querySelector("#localStorageExceptions").value,
  };
}

function hasChanges() {
  const current = currentState();
  return (
    current.maxLifetime !== savedState.maxLifetime ||
    current.exceptions !== savedState.exceptions ||
    current.localStorageExceptions !== savedState.localStorageExceptions
  );
}

function updateSaveButton() {
  document.querySelector("#saveButton").disabled = !hasChanges();
}

function saveOptions(e) {
  e.preventDefault();

  const splitList = (value) => value.trim() ? value.trim().split(/\s+/) : [];

  browser.storage.local.set({
    maxLifetime: document.querySelector("#maxLifetime").value,
    exceptions: splitList(document.querySelector("#exceptions").value),
    localStorageExceptions: splitList(document.querySelector("#localStorageExceptions").value)
  });

  savedState = currentState();
  updateSaveButton();
}

function restoreOptions() {
  function setCurrentChoice(storageSettings) {
    document.querySelector("#maxLifetime").value = storageSettings.maxLifetime || "168";

    if (storageSettings.exceptions)
      document.querySelector("#exceptions").value = storageSettings.exceptions.join("\n");

    if (storageSettings.localStorageExceptions)
      document.querySelector("#localStorageExceptions").value = storageSettings.localStorageExceptions.join("\n");

    savedState = currentState();
    updateSaveButton();
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  browser.storage.local.get().then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
document.querySelector("#maxLifetime").addEventListener("input", updateSaveButton);
document.querySelector("#exceptions").addEventListener("input", updateSaveButton);
document.querySelector("#localStorageExceptions").addEventListener("input", updateSaveButton);
