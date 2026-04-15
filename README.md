# NEBULA Web Part (SPFx)

SharePoint Framework web part that loads the NEBULA React application directly into a SharePoint page — no iframe, full-screen experience.

## Prerequisites

- Node.js 18.x (SPFx requirement — not compatible with Node 19+)
- SharePoint Online or SharePoint 2019+
- The NEBULA app files uploaded to a document library

## Build & Deploy

```bash
# Install dependencies (requires Node 18.x)
npm install

# Bundle for production
gulp bundle --ship

# Package the .sppkg
gulp package-solution --ship
```

The `.sppkg` file will be at `sharepoint/solution/nebula-webpart.sppkg`.

## Installation

1. Upload `nebula-webpart.sppkg` to the SharePoint App Catalog
2. Deploy the app (trust it when prompted)
3. Go to the target site and add the "NEBULA" web part to a page
4. In the web part properties, set the App Base URL to the document library path (e.g., `/sites/prgms/nebula/app`)
5. Save and publish the page

## Behavior

- **Edit mode**: Shows a config panel with the app URL
- **Published mode**: Hides SharePoint chrome and loads the full NEBULA app directly into the page
