/*!
 * Nexus by TehGoodLivin
 * Copyright (c) 2026 Austin Livengood <https://github.com/TehGoodLivin/>
 */
import { Version, DisplayMode } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from '@microsoft/sp-property-pane';

export interface INexusWebPartProps {
  appBaseUrl: string;
  libraryName: string;
  mainFile: string;
}

export default class NexusWebPart extends BaseClientSideWebPart<INexusWebPartProps> {
  private _appLoaded: boolean = false;

  private _buildAppUrl(): string {
    const siteUrl = (this.properties.appBaseUrl || '').trim();
    const libName = (this.properties.libraryName || '').trim();

    if (!libName) return '';

    if (siteUrl) {
      return siteUrl.replace(/\/$/, '') + '/' + libName;
    }

    try {
      const webUrl = this.context.pageContext.web.serverRelativeUrl || '';
      return webUrl.replace(/\/$/, '') + '/' + libName;
    } catch {
      return '/' + libName;
    }
  }

  private _renderBox(message: string, detail: string, showUrl: string): void {
    let html = '<div style="color:#666;padding:2rem;font-size:1rem;border:2px dashed #ccc;border-radius:8px;margin:1rem;text-align:center;">';
    html += '<h2 style="color:#1B3A5C;font-size:1.4rem;font-weight:700;margin:0 0 0.5rem;">Nexus</h2>';
    html += '<p style="color:#888;font-size:0.85rem;margin:0 0 1rem;font-style:italic;">Universal SPA Loader by TehGoodLivin</p>';
    html += '<p style="color:#666;font-size:1rem;margin:0 0 0.5rem;">' + message + '</p>';
    if (detail) html += '<p style="color:#999;font-size:0.85rem;margin:0.5rem 0 0;">' + detail + '</p>';
    if (showUrl) html += '<p style="color:#999;font-size:0.85rem;margin:0.5rem 0 0;">Document Library: <strong style="color:#2B579A;">' + showUrl + '</strong></p>';
    html += '</div>';
    this.domElement.innerHTML = html;
  }

  public render(): void {
    try {
      const appBaseUrl = this._buildAppUrl();
      const isConfigured = appBaseUrl.length > 0;
      const urlParams = new URLSearchParams(window.location.search);
      const isEditMode = this.displayMode === DisplayMode.Edit || urlParams.get('Mode')?.toLowerCase() === 'edit';

      if (!isConfigured && isEditMode) {
        this._renderBox(
          'Please configure the document library for Nexus.',
          'Open the web part properties and enter the library name containing the Nexus application files.',
          ''
        );
        return;
      }

      if (isConfigured && isEditMode) {
        this._renderBox(
          'Application configured and ready.',
          'Save and publish this page to launch Nexus.',
          appBaseUrl
        );
        return;
      }

      if (!isConfigured && !isEditMode) {
        this._renderBox(
          'This web part has not been configured.',
          'Please contact your site administrator to set the Nexus document library.',
          ''
        );
        return;
      }

      this._hideSharePointChrome();
      this._loadApp(appBaseUrl);

    } catch (err) {
      this.domElement.innerHTML = '<div style="padding:20px;color:red;font-family:Arial;">Error: ' + String(err) + '</div>';
    }
  }

  /**
   * Loads an application using the .nexus manifest format.
   * The manifest is a JSON file that declares what body HTML, styles, preloads,
   * and scripts to inject — no HTML parsing needed at runtime.
   */
  private _loadApp(baseUrl: string): void {
    if (this._appLoaded) return;

    // Append viewport container directly to document.body so it escapes
    // SharePoint's collapsed web part DOM and renders full-screen.
    const existing = document.getElementById('webpartRoot');
    if (existing) existing.remove();
    const root = document.createElement('div');
    root.id = 'webpartRoot';
    root.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;overflow-y:auto;z-index:10000;background:#ffffff;';
    document.body.appendChild(root);

    const mainFile = (this.properties.mainFile || 'index.nexus').trim();
    const self = this;

    fetch(baseUrl + '/' + mainFile)
      .then(function(response) {
        if (!response.ok) throw new Error('HTTP ' + response.status + ': ' + response.statusText);
        return response.json();
      })
      .then(function(manifest: { name?: string; version?: string; favicon?: string; body: string; styles: string[]; scripts: string[] }) {
        // 1. Inject body HTML (contains the app's root element like <div id="appRoot">)
        root.innerHTML = manifest.body;

        // 2. Inject stylesheets
        (manifest.styles || []).forEach(function(href) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = href;
          document.head.appendChild(link);
        });

        // 4. Inject entry scripts (last so DOM with appRoot is ready)
        (manifest.scripts || []).forEach(function(src) {
          const script = document.createElement('script');
          script.type = 'module';
          script.src = src;
          document.head.appendChild(script);
        });

        self._appLoaded = true;
      })
      .catch(function(err) {
        let errHtml = '<div style="color:#666;padding:2rem;font-size:1rem;border:2px dashed #ccc;border-radius:8px;margin:1rem;text-align:center;">';
        errHtml += '<h2 style="color:#a4262c;font-size:1.2rem;font-weight:700;margin:0 0 0.75rem;">Unable to Load Application</h2>';
        errHtml += '<p style="color:#666;font-size:1rem;margin:0 0 0.5rem;">Could not load the application manifest from the configured document library.</p>';
        errHtml += '<p style="color:#999;font-size:0.85rem;margin:0.5rem 0 0;">Path: <strong style="color:#2B579A;">' + baseUrl + '/' + mainFile + '</strong></p>';
        errHtml += '<p style="color:#999;font-size:0.85rem;margin:0.5rem 0 0;">Error: ' + String(err) + '</p>';
        errHtml += '</div>';
        root.innerHTML = errHtml;
      });
  }

  private _hideSharePointChrome(): void {
    const styleId = 'nebula-fullscreen-style';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      #SuiteNavWrapper,
      .SPPageChrome,
      #spSiteHeader,
      .sp-appBar-root,
      #CommentsWrapper,
      .sp-pageLayout-bottomContent,
      footer,
      [data-automation-id="pageHeader"],
      [data-automation-id="titleRegion"] {
        display: none !important;
      }
      .SPCanvas, .CanvasSection, .CanvasZone, .CanvasZoneContainer,
      .mainContent, .canvasWrapper, [data-automation-id="CanvasSection"] {
        max-width: 100% !important;
        padding: 0 !important;
        margin: 0 !important;
      }
      body { overflow: hidden !important; }
    `;
    document.head.appendChild(style);
  }

  protected onDispose(): void {
    const style = document.getElementById('nebula-fullscreen-style');
    if (style) style.remove();
    const wr = document.getElementById('webpartRoot');
    if (wr) wr.remove();
    super.onDispose();
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: 'Nexus' },
          groups: [
            {
              groupName: 'Data Source Settings',
              groupFields: [
                PropertyPaneTextField('appBaseUrl', {
                  label: 'Site URL',
                  description: 'Full URL of the site containing the document library. Leave blank to use the current site.',
                }),
                PropertyPaneTextField('libraryName', {
                  label: 'Library Name',
                  description: 'Internal name or display name of the SharePoint document library.',
                }),
                PropertyPaneTextField('mainFile', {
                  label: 'Main File',
                  description: 'Entry point file name. Default: index.html',
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}
