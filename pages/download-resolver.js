/**
 * Lightweight-apps — Resolvedor dinámico de descargas
 * Genera las tarjetas de apps, carga iconos reales con fallback,
 * y mapea los assets del último GitHub Release al OS del visitante.
 */
(async function LightweightAppsResolver() {
  "use strict";

  const REPO_OWNER = "tempMufld28";
  const REPO_NAME = "Packages_WInLinux-Lightweight";
  const API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`;

  // ── Catálogo de apps: icono, color de marca, dominio ──
  const APPS = [
    { title: "WhatsApp", domain: "whatsapp.com", color: "#25d366", drm: false },
    {
      title: "Spotify",
      domain: "open.spotify.com",
      color: "#1db954",
      drm: true,
    },
    {
      title: "Teams",
      domain: "teams.microsoft.com",
      color: "#6264a7",
      drm: false,
    },
    {
      title: "YTMusic",
      domain: "music.youtube.com",
      color: "#ff0000",
      drm: true,
    },
    { title: "Twitch", domain: "twitch.tv", color: "#9146ff", drm: false },
    {
      title: "Outlook",
      domain: "outlook.live.com",
      color: "#0078d4",
      drm: false,
    },
    { title: "Office365", domain: "office.com", color: "#d83b01", drm: false },
    {
      title: "Telegram",
      domain: "web.telegram.org",
      color: "#0088cc",
      drm: false,
    },
  ];

  // ── Utilidades ──

  function iconUrl(domain) {
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  }

  function detectOS() {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("win")) return "windows";
    if (ua.includes("linux")) return "linux";
    return "unknown";
  }

  function classifyAsset(name) {
    const lower = name.toLowerCase();
    if (lower.endsWith(".msi") || lower.endsWith(".exe")) return "windows";
    if (lower.endsWith(".deb")) return "linux-deb";
    if (lower.endsWith(".rpm")) return "linux-rpm";
    return null;
  }

  // Extract app title from release asset filename.
  // Naming convention from release.yml: Title_arch.ext  (e.g. WhatsApp_x86_64.deb)
  // Strip known arch suffixes first, then remove extension.
  function extractAppTitle(filename) {
    return filename
      .replace(/_(x86_64|x64|aarch64|arm64|i686)\.(msi|deb|rpm|exe)$/i, "")
      .replace(/\.(msi|deb|rpm|exe)$/i, "");
  }

  // ── Generar tarjetas de apps ──

  function renderCards() {
    const grid = document.getElementById("app-grid");
    if (!grid) return;

    grid.innerHTML = APPS.map((app) => {
      const drmBadge = app.drm
        ? '<span class="drm-badge" title="Reproducción DRM limitada en Linux">DRM Linux</span>'
        : "";

      return `
        <div class="card" style="--card-accent: ${app.color}">
          <div class="card-head">
            <div class="card-icon-wrap" data-icon-domain="${app.domain}">
              <span class="fallback">${app.title.charAt(0)}</span>
            </div>
            <div class="card-info">
              <div class="card-title">${app.title} ${drmBadge}</div>
              <div class="card-sub">${app.domain}</div>
            </div>
          </div>
          <button class="btn primary" data-app="${app.title}" data-smart-download disabled>
            Descargar para mi OS
          </button>
          <div class="btn-row">
            <a class="btn" data-app="${app.title}" data-format="windows" href="#">.msi</a>
            <a class="btn" data-app="${app.title}" data-format="linux-deb" href="#">.deb</a>
            <a class="btn" data-app="${app.title}" data-format="linux-rpm" href="#">.rpm</a>
          </div>
        </div>`;
    }).join("");
  }

  // ── Cargar iconos reales con fallback a letra ──

  function loadIcons() {
    document.querySelectorAll("[data-icon-domain]").forEach((wrap) => {
      const domain = wrap.dataset.iconDomain;
      const img = new Image();
      img.onload = () => {
        wrap.innerHTML = "";
        wrap.appendChild(img);
      };
      img.onerror = () => {};
      img.src = iconUrl(domain);
    });
  }

  // ── Mapear assets del release a botones ──

  function wireDownloadButtons(downloadMap, userOS) {
    document
      .querySelectorAll("[data-app][data-smart-download]")
      .forEach((btn) => {
        const app = btn.dataset.app;
        const appDownloads = downloadMap[app];
        if (!appDownloads) {
          btn.disabled = true;
          return;
        }

        let url;
        if (userOS === "windows") url = appDownloads["windows"];
        if (userOS === "linux") url = appDownloads["linux-deb"];

        if (!url) url = Object.values(appDownloads)[0];

        if (url) {
          btn.addEventListener("click", () => (window.location.href = url));
          btn.disabled = false;
        } else {
          btn.disabled = true;
        }
      });

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
        link.removeAttribute("href");
      }
    });
  }

  // ── Inicializar ──

  renderCards();
  loadIcons();

  try {
    const response = await fetch(API_URL, {
      headers: { Accept: "application/vnd.github.v3+json" },
    });
    if (!response.ok) {
      console.warn(
        "[Lightweight-apps] No se pudo obtener el release:",
        response.status,
      );
      return;
    }

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

    wireDownloadButtons(downloadMap, userOS);

    const versionEl = document.getElementById("release-version");
    if (versionEl) versionEl.textContent = release.tag_name;
  } catch (err) {
    console.error(
      "[Lightweight-apps] Error al obtener datos del release:",
      err,
    );
  }
})();
