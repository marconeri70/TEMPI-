let n = 0;
document.getElementById("btn").addEventListener("click", () => {
  n++;
  document.getElementById("msg").textContent = `Click: ${n}`;
});

// Service worker (facoltativo, ma utile per PWA/offline)
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js");
}
