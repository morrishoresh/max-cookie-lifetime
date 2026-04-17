"use strict";

var settings = {
  maxLifetime: 7 * 24,
  exceptions: [],
};

function applySettings(data) {
  settings.maxLifetime = Number(data.maxLifetime) || 7 * 24;
  settings.exceptions = Array.isArray(data.exceptions) ? data.exceptions : [];
}

let settingsReady = browser.storage.local.get().then(applySettings);

function isProtected(cookie) {
  for (var i = 0; i < settings.exceptions.length; i++) {
    var e = settings.exceptions[i].trim();

    if (!e) {
      continue;
    }

    if (cookie.domain.includes(e)) {
      return true;
    }
  }

  return false;
}

browser.storage.onChanged.addListener(() => {
  settingsReady = browser.storage.local.get().then(applySettings);
});

browser.cookies.onChanged.addListener(async ({ removed, cookie, cause }) => {
  await settingsReady;

  if (removed) return;

  if (isProtected(cookie)) return;

  switch (cause) {
    case "evicted":
    case "expired":
    case "expired_overwrite":
      return;
  }

  if (cookie.session) return;

  let now = Date.now();
  let newExpiration = Math.round(now / 1000) + settings.maxLifetime * 60 * 60;

  if (
    cookie.expirationDate &&
    cookie.expirationDate > 0 &&
    cookie.expirationDate <= newExpiration
  )
    return;

  var newCookie = {};
  for (var attr in cookie) {
    if (attr === "hostOnly" || attr === "session") continue;
    if (attr === "domain" && !cookie.domain.startsWith(".")) continue;

    newCookie[attr] = cookie[attr];
  }

  newCookie.expirationDate = newExpiration;
  newCookie.url = [
    "http",
    cookie.secure ? "s://" : "://",
    cookie.domain.replace(/^\./, ""),
    cookie.path,
  ].join("");

  browser.cookies.set(newCookie);
});

