function saveOptions(e) {
  e.preventDefault();
  browser.storage.local.set({
    maxLifetime: document.querySelector("#maxLifetime").value
  });
}

function restoreOptions() {
  function setCurrentChoice(result) {
    document.querySelector("#maxLifetime").value = result.maxLifetime || "168";
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  var getting = browser.storage.local.get("maxLifetime");
  getting.then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions); 