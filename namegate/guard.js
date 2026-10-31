(() => {
  "use strict";
  const el = document.currentScript;
  const expected = el?.dataset?.experience;
  if (!expected) return;
  let entered = null;
  try { entered = sessionStorage.getItem("sonnersdt-approved-name"); } catch (_) {}
  if (!entered && window.name === "sonnersdt:" + expected) entered = expected;
  if (entered !== expected) {
    window.location.replace(new URL("../index.html", el.src).href);
  }
})();
