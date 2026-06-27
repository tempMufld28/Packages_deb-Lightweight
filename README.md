<h1 align="center">Lightweight-apps</h1>
<p align="center"><strong>Convierte cualquier página web en una app de escritorio ligera — Windows y Linux, ~5&nbsp;MB cada una</strong></p>
<div align="center">
    <a href="https://github.com/tempMufld28/Packages_deb-Lightweight/releases" target="_blank">
    <img alt="Descargas en GitHub" src="https://img.shields.io/github/downloads/tempMufld28/Packages_deb-Lightweight/total.svg?style=flat-square"></a>
    <a href="https://github.com/tempMufld28/Packages_deb-Lightweight/commits" target="_blank">
    <img alt="Commits en GitHub" src="https://img.shields.io/github/commit-activity/m/tempMufld28/Packages_deb-Lightweight?style=flat-square"></a>
    <a href="https://github.com/tempMufld28/Packages_deb-Lightweight/issues?q=is%3Aissue+is%3Aclosed" target="_blank">
    <img alt="Issues cerrados en GitHub" src="https://img.shields.io/github/issues-closed/tempMufld28/Packages_deb-Lightweight.svg?style=flat-square"></a>
</div>

## ¿Qué es esto?

Un fork de [Pake](https://github.com/tw93/Pake) enfocado en un modelo de distribución más ligero y concreto:

- **Solo Windows y Linux** — el soporte para macOS ha sido eliminado completamente. Sin certificados de Apple, sin notarización, sin binarios universales. Esto mantiene la CI rápida y el código simple.
- **~5 MB por app** — construido con Tauri v2 (Rust) sobre el webview del sistema (WebView2 en Windows, WebKitGTK en Linux), aproximadamente 20× más pequeño que Electron.
- **Catálogo curado** — 8 apps web populares empaquetadas con User-Agent y bundle identifiers correctos: WhatsApp, Spotify, Teams, YT Music, Twitch, Outlook, Office365, Telegram.
- **`.deb` + `.rpm` + `.msi`** — AppImage eliminado, RPM agregado. Tres formatos de instalador en total.
- **Sitio de descarga dinámico** — un sitio GitHub Pages (`/pages`) que detecta automáticamente el instalador correcto según el sistema operativo del visitante.

> **Nota DRM en Linux:** Spotify y YT Music en Linux usan WebKitGTK, que no tiene soporte nativo de Widevine. La reproducción de contenido premium/protegido con DRM no estará disponible en las builds de Linux. Las builds de Windows funcionan completamente vía WebView2.

## Descargar

Los instaladores listos para las 8 apps están en la página de **[GitHub Releases](https://github.com/tempMufld28/Packages_deb-Lightweight/releases)**, o visita el **[sitio de descarga](https://tempMufld28.github.io/Packages_deb-Lightweight/)** que detecta tu sistema operativo automáticamente.

| App       | Windows (.msi) | Linux (.deb) | Linux (.rpm) |
| --------- | -------------- | ------------ | ------------ |
| WhatsApp  | ✅             | ✅           | ✅           |
| Spotify   | ✅             | ✅ ⚠️        | ✅ ⚠️        |
| Teams     | ✅             | ✅           | ✅           |
| YT Music  | ✅             | ✅ ⚠️        | ✅ ⚠️        |
| Twitch    | ✅             | ✅           | ✅           |
| Outlook   | ✅             | ✅           | ✅           |
| Office365 | ✅             | ✅           | ✅           |
| Telegram  | ✅             | ✅           | ✅           |

⚠️ = reproducción DRM degradada en Linux (sin Widevine en WebKitGTK).

## Empaquetado por línea de comandos

![Pake](https://raw.githubusercontent.com/tw93/static/main/pake/pake1.gif)

```bash
# Instalar CLI
pnpm install -g pake-cli

# Uso básico — obtiene el icono del sitio automáticamente
pake https://github.com --name GitHub

# Uso avanzado con opciones personalizadas
pake https://weekly.tw93.fun --name Weekly --width 1200 --height 800
```

El primer empaquetado requiere configurar el entorno y puede ser más lento; las builds posteriores son rápidas. Para la documentación completa de parámetros, consulta la [Guía de uso de la CLI](docs/cli-usage.md).

## Desarrollo

Requiere Rust `>=1.85` y Node `>=22`. Requisitos por plataforma:

- **Windows**: Visual Studio Build Tools con MSVC
- **Linux**: `build-essential`, `libwebkit2gtk-4.1` y librerías complementarias (ver `.github/actions/setup-env/action.yml` para la lista completa de apt)

```bash
# Instalar dependencias
pnpm i

# Desarrollo local
pnpm run dev

# Construir la aplicación
pnpm run build

# Construir la CLI (regenera dist/cli.js)
pnpm run cli:build
```

Para personalización de estilos, mejoras de funcionalidades y características avanzadas, consulta la [Documentación de uso avanzado](docs/advanced-usage.md).

## Releases y CI

| Workflow               | Propósito                                                                                                                        |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `release.yml`          | Se activa con tags `V*`. Construye 8 apps × 2 SO en paralelo (16 jobs), sube `.msi`/`.deb`/`.rpm` al GitHub Release.           |
| `deploy-pages.yml`     | Despliega el sitio de descarga `/pages` a GitHub Pages en cada push a `main` que modifique `pages/**`.                          |
| `quality-and-test.yml` | Formato automático, revisión de calidad Rust y validación de CLI/build en Linux y Windows.                                      |
| `npm-publish.yml`      | Publica `pake-cli` en npm mediante Trusted Publishing en tags `V*`.                                                              |

### Gestión de versiones

Cuatro archivos deben mantenerse sincronizados en cada release:

| Archivo                     | Campo                        |
| --------------------------- | ---------------------------- |
| `package.json`              | `"version"`                  |
| `src-tauri/Cargo.toml`      | `version` en `[package]`     |
| `src-tauri/Cargo.lock`      | `version` del paquete `pake` |
| `src-tauri/tauri.conf.json` | `"version"`                  |

Formato del tag: `V0.x.x` (V mayúscula).

## Sitio de descarga (`/pages`)

El directorio `pages/` contiene un sitio estático servido por GitHub Pages:

- `pages/index.html` — página principal con tarjetas de descarga por app
- `pages/download-resolver.js` — obtiene los assets del último GitHub Release, detecta el SO del visitante y redirige: Windows → `.msi`, Linux → `.deb` por defecto

El despliegue es automático vía `.github/workflows/deploy-pages.yml`. Para activarlo, configura **Settings → Pages → Source: GitHub Actions** (no se necesita seleccionar rama — el workflow lo gestiona).

## Agradecimientos

Este proyecto es un fork de [Pake](https://github.com/tw93/Pake) por [Tw93](https://github.com/Tw93). El mecanismo de empaquetado basado en Tauri, el JS/CSS inyectado y el diseño de la CLI son obra suya. Lightweight-apps reduce el alcance a Windows y Linux y redistribuye el proyecto.

## Licencia

GPL-3.0, ver [LICENSE](./LICENSE) y la [Excepción de salida de Pake](./LICENSE-EXCEPTION); las apps que construyas con esta herramienta son completamente tuyas para usar y distribuir. Este fork tiene otro nombre para evitar confusión con el proyecto original Pake.
