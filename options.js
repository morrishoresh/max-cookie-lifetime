function saveOptions(e) {
  e.preventDefault();

  browser.storage.local.set({
    maxLifetime: document.querySelector("#maxLifetime").value,
    exceptions: document.querySelector("#exceptions").value.trim().split(/\s+/)
  });
}

function restoreOptions() {
  function setCurrentChoice(storageSettings) {

    document.querySelector("#maxLifetime").value = storageSettings.maxLifetime || "168";

    if (storageSettings.exceptions)
        document.querySelector("#exceptions").value = storageSettings.exceptions.join("\n");
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  var storageSettings = browser.storage.local.get();
  storageSettings.then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions); 
