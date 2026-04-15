/*!
 * Nexus by TehGoodLivin
 * Copyright (c) 2026 Austin Livengood <https://github.com/TehGoodLivin/>
 */
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { type IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
export interface INexusWebPartProps {
    appBaseUrl: string;
    libraryName: string;
    mainFile: string;
}
export default class NexusWebPart extends BaseClientSideWebPart<INexusWebPartProps> {
    private _appLoaded;
    private _buildAppUrl;
    private _renderBox;
    render(): void;
    /**
     * Loads an application using the .nexus manifest format.
     * The manifest is a JSON file that declares what body HTML, styles, preloads,
     * and scripts to inject — no HTML parsing needed at runtime.
     */
    private _loadApp;
    private _hideSharePointChrome;
    protected onDispose(): void;
    protected get dataVersion(): Version;
    protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration;
}
//# sourceMappingURL=NexusWebPart.d.ts.map