# Nexus Web Part (SPFx)

SharePoint Framework web part that loads any SPA directly into a SharePoint modern page — no iframe, full-screen experience — using the `.nexus` manifest format.

## Prerequisites

- Node.js 18.x (SPFx requirement — not compatible with Node 19+)
- SharePoint Online or SharePoint 2019+

## Build & Deploy

```bash
# Install dependencies (requires Node 18.x)
npm install

# Bundle for production
gulp bundle --ship

# Package the .sppkg
gulp package-solution --ship
```

The `.sppkg` file will be at `sharepoint/solution/tgl-sp-nexus.sppkg`.

## Installation

1. Upload `tgl-sp-nexus.sppkg` to the SharePoint App Catalog
2. Deploy the app (trust it when prompted)
3. Add the **Nexus** web part to a modern SharePoint page
4. Open the web part properties and configure:
   - **Site URL** — full URL of the site containing the document library (leave blank for the current site)
   - **Library Name** — internal name or display name of the document library
   - **Main File** — entry point file name (default: `index.nexus`)
5. Save and publish the page

## The `.nexus` Manifest

Nexus loads your SPA via a JSON manifest file (e.g. `index.nexus`) hosted in the document library. No HTML parsing at runtime — the manifest declares everything to inject:

```json
{
  "name": "My App",
  "version": "1.0.0",
  "body": "<div id=\"appRoot\"></div>",
  "styles": ["/sites/prgms/app/assets/main.css"],
  "scripts": ["/sites/prgms/app/assets/main.js"]
}
```

| Field | Description |
|---|---|
| `body` | HTML string injected as the app root (e.g. `<div id="appRoot">`) |
| `styles` | Array of stylesheet URLs appended to `<head>` |
| `scripts` | Array of ES module script URLs appended to `<head>` |
| `name` | Optional app name |
| `version` | Optional app version |

## Behavior

| Mode | State | Result |
|---|---|---|
| Edit | Not configured | Config prompt — enter library settings |
| Edit | Configured | Ready confirmation with resolved library path |
| Published | Not configured | Error message for site admins |
| Published | Configured | SharePoint chrome hidden, app loads full-screen |

When published and configured, Nexus:
1. Hides SharePoint chrome (header, nav, footer)
2. Creates a fixed full-screen container (`#webpartRoot`)
3. Fetches and parses the `.nexus` manifest
4. Injects body HTML, stylesheets, and ES module scripts into the page
