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
    setting.exceptions = data.exceptions;
        
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
