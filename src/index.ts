import { Application, IApplicationOptions, IApplicationPlugin } from '@pixi/app';
import { Group, Layer } from '@pixi/layers';

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
    pixiLights?: {
        diffuseGroup: Group;
        normalGroup: Group;
        lightGroup: Group;
    };
}
export class Shadows {
    // The objects that will cast shadows
    casterGroup = new Group();
    // The objects that will remain ontop of the shadows
    overlayGroup = new Group();
    filter: ShadowFilter;
    container = new Container();
    constructor(app: Application, options?: ShadowsOptions) {
        // // Create the shadow filter
        this.filter = new ShadowFilter(app.renderer.width, app.renderer.height);
        // Set up the container mixin so that it tells the filter about the available shadows and objects
        augmentContainer(this.casterGroup, this.overlayGroup, this.filter);
        // Overwrite the application render method
        augmentApplication(app, this.filter);
        app.stage.addChild(this.container);

        if (options?.pixiLights) {
            // Set up pixi-light's layers
            const diffuseLayer = new Layer(options.pixiLights.diffuseGroup);
            const normalLayer = new Layer(options.pixiLights.normalGroup);
            const lightLayer = new Layer(options.pixiLights.lightGroup);
            const diffuseBlackSprite = new Sprite(diffuseLayer.getRenderTexture());

            diffuseBlackSprite.tint = 0;
            // Set up the lighting layers
            app.stage.addChild(diffuseLayer, diffuseBlackSprite, normalLayer, lightLayer);
            // Add the shadow filter to the diffuse layer
            app.stage.filters = [this.filter];
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
