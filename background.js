"use strict";

var maxLifetime = 7*24*60*60;

function getOptions(){

  function onError(error) {
    console.log(`Error: ${error}`);
  }
  
  function onGot(item) {
    if (item.maxLifetime)
      maxLifetime = item.maxLifetime * 60 * 60;  
  }
  
  var getting = browser.storage.local.get("maxLifetime");
  getting.then(onGot, onError);
}


chrome.storage.onChanged.addListener(getOptions);
getOptions();

chrome.cookies.onChanged.addListener(
  ({removed, cookie, cause}) => {

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
    let newExpiration = Math.round(now/1000) + maxLifetime;
    
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
    console.log("cookie url: "+ newCookie.url);  
  
    chrome.cookies.set(newCookie, function() {
    });
  }
);
