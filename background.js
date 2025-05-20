"use strict";

var settings = 
{
  maxLifetime: 7 * 24,
  exceptions: {}
};

function applySettings(data) {

  if (data.maxLifetime)
    settings.maxLifetime = data.maxLifetime; 	
        
  if (data.exceptions)
    settings.exceptions = data.exceptions;
        
}

function loadSettings()
{
  browser.storage.local.get(data => {
    applySettings(data);
  });
}

loadSettings();

browser.storage.onChanged.addListener(changeData => {
  loadSettings();
});


chrome.cookies.onChanged.addListener(
  ({removed, cookie, cause}) => {

    for (var i = 0; i < settings.exceptions.length; i++){
      var e = settings.exceptions[i].trim();

      if (!e)
        continue;

      if (cookie.domain.includes(e)){
	return;
      }
    }

    if(removed) return;
      
    switch(cause) {
      case "evicted":
      case "expired":
      case "expired_overwrite":
        return;
    }
      
    if (cookie.session)
        return;

    let now = Date.now();
    let newExpiration = Math.round(now/1000) + (settings.maxLifetime * 60 * 60);

    if(cookie.expirationDate && cookie.expirationDate > 0 && cookie.expirationDate <= newExpiration)
        return;
    
    var newCookie = cookie.constructor();
    for (var attr in cookie) {
        if (attr === "hostOnly" || attr === "session")
            continue;
        if (attr === "domain" && !cookie.domain.startsWith("."))
            continue;
        
        newCookie[attr] = cookie[attr];
    }
    
    newCookie.expirationDate = newExpiration;
    newCookie.url = ["http", (cookie.secure ? "s:\/\/" : ":\/\/"), cookie.domain.replace(/^\./, ""), cookie.path].join("");      
  
    chrome.cookies.set(newCookie, function() {
    });
  }
);

let openTabs = new Set();

browser.tabs.onCreated.addListener(tab => {
    openTabs.add(tab.id);
});

browser.tabs.onRemoved.addListener((tabId, removeInfo) => {
    openTabs.delete(tabId);
    
    // Wait briefly to ensure all events are processed
    setTimeout(() => {
        browser.tabs.query({}).then(tabs => {
            if (tabs.length === 0) {
                // All tabs are closed (note: may not fire on macOS)
                cleanupSessionCookies();
            }
        });
    }, 100);
});

function cleanupSessionCookies() {
    browser.cookies.getAll({}).then(cookies => {
        for (let cookie of cookies) {
            if (!cookie.expirationDate) {
                browser.cookies.remove({
                    url: `${cookie.secure ? "https" : "http"}://${cookie.domain.replace(/^\./, '')}${cookie.path}`,
                    name: cookie.name
                });
            }
        }
    });
}
