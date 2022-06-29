import * as PIXI from 'pixi.js';

import { Container, Sprite } from 'pixi.js';
import { Group, Layer } from '@pixi/layers';
import { diffuseGroup, lightGroup, normalGroup } from 'pixi-lights';

import ApplicationSetup from './mixins/Application';
import ContainerSetup from './mixins/Container';
import ShadowFilter from './filters/ShadowFilter';

export { default as FilterFuncs } from './filters/FilterFuncs';
export { default as ShadowFilter } from './filters/ShadowFilter';
export { default as ShadowMapFilter } from './filters/ShadowMapFilter';
export { default as ShadowMaskFilter } from './filters/ShadowMaskFilter';
export { default as ApplicationSetup } from './mixins/Application';
export { default as ContainerSetup } from './mixins/Container';
export { default as Shadow } from './Shadow';

export const AppLoaderPlugin = {
    init() {
        this.shadows = {};
        // The objects that will cast shadows
        this.shadows.casterGroup = new Group();
        this.shadows.casterLayer = new Layer(this.shadows.casterGroup);

        // The objects that will remain ontop of the shadows
        this.shadows.overlayGroup = new Group();
        this.shadows.overlayLayer = new Layer(this.shadows.overlayGroup);

        // Make sure the caster objects aren't actually visible
        this.shadows.casterLayer.renderWebGL = function(){}; 
        this.shadows.overlayLayer.renderWebGL = function(){}; 

        // // Create the shadow filter
        // this.filter = new ShadowFilter(this.renderer.width, this.renderer.height);
        this.shadows.filter = new ShadowFilter(this.renderer.width, this.renderer.height);
        // Set up the container mixin so that it tells the filter about the available shadows and objects
        ContainerSetup(this.shadows.casterGroup, this.shadows.overlayGroup, this.shadows.filter);

        // Overwrite the application render method
        ApplicationSetup(this, this.shadows.filter);

        // If a container is specified, set up the filter
        this.shadows.container = new Container();
        this.stage.addChild(this.shadows.container);

        // Set up the shadow layers
        this.stage.addChild(
            this.shadows.casterLayer,
            this.shadows.overlayLayer
        );

        // Set up pixi lights if available
        if(PIXI.lights){
            // Set up pixi-light's layers
            this.shadows.diffuseLayer = new Layer(diffuseGroup);
            this.shadows.normalLayer = new Layer(normalGroup);
            this.shadows.lightLayer = new Layer(lightGroup);
            const diffuseBlackSprite = new Sprite(this.shadows.diffuseLayer.getRenderTexture());
            diffuseBlackSprite.tint = 0;
    
            this.stage.addChild(
                this.shadows.diffuseLayer,
                diffuseBlackSprite,
                this.shadows.normalLayer,
                this.shadows.lightLayer
            );
            // Add the shadow filter to the diffuse layer
            this.shadows.diffuseLayer.filters = [this.shadows.filter];
        } else {
            // Add the shadow filter to the container
            this.shadows.container.filters = [this.shadows.filter];
        }
    },
    destroy() {
        delete this.shadows;
    } 
  };