import { Application, IApplicationOptions, IApplicationPlugin } from '@pixi/app';
import { Group, Layer } from '@pixi/layers';
import { diffuseGroup, lightGroup, normalGroup } from 'pixi-lights';

import { Container } from '@pixi/display';
import { ShadowFilter } from './filters/ShadowFilter';
import { Sprite } from '@pixi/sprite';
import { augmentApplication } from './mixins/Application';
import { augmentContainer } from './mixins/Container';

export { filterFuncs } from './filters/FilterFuncs';
export { ShadowFilter } from './filters/ShadowFilter';
export { ShadowMaskFilter } from './filters/ShadowMaskFilter';
export { augmentApplication } from './mixins/Application';
export { augmentContainer } from './mixins/Container';
export { Shadow } from './Shadow';

export interface ShadowsOptions {
    useLights: boolean;
}
export class Shadows {
    // The objects that will cast shadows
    casterGroup = new Group();
    casterLayer = new Layer(this.casterGroup);
    // The objects that will remain ontop of the shadows
    overlayGroup = new Group();
    overlayLayer = new Layer(this.overlayGroup);
    filter: ShadowFilter;
    container = new Container();
    diffuseLayer: Layer | undefined;
    normalLayer: Layer | undefined;
    lightLayer: Layer | undefined;
    constructor(app: Application, options?: ShadowsOptions) {
        // // Create the shadow filter
        this.filter = new ShadowFilter(app.renderer.width, app.renderer.height);
        // Set up the container mixin so that it tells the filter about the available shadows and objects
        augmentContainer(this.casterGroup, this.overlayGroup, this.filter);
        // Overwrite the application render method
        augmentApplication(app, this.filter);
        app.stage.addChild(this.container);
        // Set up the shadow layers
        app.stage.addChild(this.casterLayer, this.overlayLayer);
        if (options?.useLights) {
            // Set up pixi-light's layers
            this.diffuseLayer = new Layer(diffuseGroup);
            this.normalLayer = new Layer(normalGroup);
            this.lightLayer = new Layer(lightGroup);
            const diffuseBlackSprite = new Sprite(this.diffuseLayer.getRenderTexture());

            diffuseBlackSprite.tint = 0;

            app.stage.addChild(this.diffuseLayer, diffuseBlackSprite, this.normalLayer, this.lightLayer);
            // Add the shadow filter to the diffuse layer
            this.diffuseLayer.filters = [this.filter];
        } else {
            this.container.filters = [this.filter];
        }
    }
}
declare module '@pixi/app' {
    export interface Application {
        shadows: Shadows;
    }
    export interface IApplicationOptions {
        fov?: ShadowsOptions;
    }
}

export const AppLoaderPlugin: IApplicationPlugin = {
    init(this: Application, options: IApplicationOptions): void {
        this.shadows = new Shadows(this, options.fov);
    },
    destroy(this: Application): void {
        delete this.shadows;
    },
};
