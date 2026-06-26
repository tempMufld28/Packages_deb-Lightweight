/**
 * Lightweight-apps — Dynamic Download Resolver
 * Fetches latest GitHub Release assets and maps them to Windows/Linux OS.
 */
(async function LightweightAppsResolver() {
  const REPO_OWNER = "tempmufdl28";
  const REPO_NAME = "Packages_deb-Lightweight";
  const API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`;

  function detectOS() {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("win")) return "windows";
    if (ua.includes("linux")) return "linux";
    return "unknown"; // Fallback
  }

  function classifyAsset(name) {
    const lower = name.toLowerCase();
    if (lower.endsWith(".msi") || lower.endsWith(".exe")) return "windows";
    if (lower.endsWith(".deb")) return "linux-deb";
    if (lower.endsWith(".rpm")) return "linux-rpm";
    return null;
  }

  function extractAppTitle(filename) {
    return filename.replace(/[_.].*$/, "");
  }

  try {
    const response = await fetch(API_URL, { headers: { Accept: "application/vnd.github.v3+json" } });
    if (!response.ok) return;

    const release = await response.json();
    const assets = release.assets || [];
    const userOS = detectOS();
    const downloadMap = {};

    for (const asset of assets) {
      const osKey = classifyAsset(asset.name);
      if (!osKey) continue;
      const appTitle = extractAppTitle(asset.name);
      if (!downloadMap[appTitle]) downloadMap[appTitle] = {};
      downloadMap[appTitle][osKey] = asset.browser_download_url;
    }

    // Auto-assign "smart download" buttons
    document.querySelectorAll("[data-app][data-smart-download]").forEach((btn) => {
      const app = btn.dataset.app;
      const appDownloads = downloadMap[app];
      if (!appDownloads) { btn.disabled = true; return; }

      let url;
      if (userOS === "windows") url = appDownloads["windows"];
      if (userOS === "linux") url = appDownloads["linux-deb"]; // Default Linux to .deb

      if (!url) url = Object.values(appDownloads)[0]; // fallback

      if (url) {
        btn.addEventListener("click", () => (window.location.href = url));
        btn.disabled = false;
      }
    });

    // Wire per-format links (.msi / .deb / .rpm)
    document.querySelectorAll("[data-app][data-format]").forEach((link) => {
      const app = link.dataset.app;
      const fmt = link.dataset.format;
      const appDownloads = downloadMap[app];
      const url = appDownloads && appDownloads[fmt];
      if (url) {
        link.setAttribute("href", url);
        link.classList.remove("disabled");
      } else {
        link.classList.add("disabled");
        link.style.opacity = "0.4";
        link.style.pointerEvents = "none";
      }
    });

    const versionEl = document.getElementById("release-version");
    if (versionEl) versionEl.textContent = release.tag_name;

  } catch (err) {
    console.error("[Lightweight-apps] Failed to fetch release data:", err);
  }
})();
