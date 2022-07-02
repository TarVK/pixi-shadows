import { BLEND_MODES, SCALE_MODES } from '@pixi/constants';

import { Application } from '@pixi/app';
import { RenderTexture } from '@pixi/core';
import { ShadowMapFilter } from './filters/ShadowMapFilter';
import { ShadowMaskFilter } from './filters/ShadowMaskFilter';
import { Sprite } from '@pixi/sprite';

/**
 * @class
 * @memberof PIXI.shadows
 *
 * @param range {number} The radius of the lit area in pixels.
 * @param [intensity=1] {number} The opacity of the lit area.
 * @param [pointCount=20] {number} The number of points that makes up this light.
 * @param [scatterRange=15] {number} The radius at which the points of the light should be scattered.
 */

export class Shadow extends Sprite {
    /**
     * The of steps to take per pixel. (Higher resolution = more precise edges + more intensive).
     */
    depthResolution = 1; // per screen pixel
    /**
     * Whther or not overlays in shadows should become darker (can create odd artifacts, is very experimental/unfinished)
     */
    darkenOverlay = false;

    /**
     * How many pixels of the overlay should be lit up by the light
     */
    overlayLightLength = Infinity;

    /**
     * A shadow caster to ignore while creating the shadows. (Can be used if sprite and light always overlap).
     */
    ignoreShadowCaster: Sprite | undefined;

    shadowFilter: ShadowMaskFilter;
    renderStep: boolean | undefined;
    shadowMapResultSprite: Sprite | undefined;

    _shadowCasterSprite: Sprite | undefined;
    _shadowOverlaySprite: Sprite | undefined;
    _shadowMapResultTexture: RenderTexture | undefined;

    private _radialResolution = 800;
    private _shadowMapSprite: Sprite | undefined;

    /**
     * @param range The radius of the lit area in pixels.
     * @param intensity The opacity of the lit area.
     * @param pointCount The number of points that makes up this light.
     * @param scatterRange The radius at which the points of the light should be scattered.
     */
    constructor(
        private _range: number,
        /**
         * The radius at which the points of the light should be scattered. (Greater range = software shadow).
         */
        public intensity: number = 1,
        private _pointCount: number = 20,
        /**
         * The opacity of the lit area. (may exceed 1).
         */
        public scatterRange: number = _pointCount == 1 ? 0 : 15
    ) {
        super(
            RenderTexture.create({
                width: _range * 2,
                height: _range * 2,
            })
        );

        this.anchor.set(0.5);

        this.__createShadowMapSources();
    }
    // Create the texture to apply this mask filter to
    __updateTextureSize() {
        this.texture.destroy();
        this.texture = RenderTexture.create({
            width: this._range * 2,
            height: this._range * 2,
        });
    }
    // Create the resources that create the shadow map
    __createShadowMapSources() {
        if (this._shadowMapSprite) this._shadowMapSprite.destroy();
        if (this.shadowMapResultSprite) this.shadowMapResultSprite.destroy();
        if (this._shadowMapResultTexture) this._shadowMapResultTexture.destroy();

        // A blank texture/sprite to apply the filter to
        this._shadowMapResultTexture = RenderTexture.create({
            width: this._radialResolution,
            height: this._pointCount,
        });
        this._shadowMapResultTexture.baseTexture.scaleMode = SCALE_MODES.NEAREST;
        this._shadowMapSprite = new Sprite(this._shadowMapResultTexture);
        this._shadowMapSprite.filters = [new ShadowMapFilter(this)];

        // The resulting texture/sprite after the filter has been applied
        this.shadowMapResultSprite = new Sprite(this._shadowMapResultTexture);

        // Create the mask filter
        const filter = new ShadowMaskFilter(this);

        filter.blendMode = BLEND_MODES.ADD;
        this.shadowFilter = filter;
        this.filters = [filter];
    }
    // Properly dispose all the created resources
    destroy() {
        if (this._shadowMapSprite) this._shadowMapSprite.destroy();
        if (this.shadowMapResultSprite) this.shadowMapResultSprite.destroy();
        if (this._shadowMapResultTexture) this._shadowMapResultTexture.destroy();
        this.texture.destroy();

        return super.destroy();
    }
    // Don't render this sprite unless we are in the dedicated render step called by the shadow filter
    renderAdvanced(renderer: any) {
        if (this.renderStep) super.renderAdvanced(renderer);
    }

    // Update the map to create the mask from
    update(renderer: Application['renderer'], shadowCasterSprite: Sprite, shadowOverlaySprite: Sprite) {
        this._shadowCasterSprite = shadowCasterSprite;
        this._shadowOverlaySprite = shadowOverlaySprite;
        renderer.render(this._shadowMapSprite, {
            renderTexture: this._shadowMapResultTexture,
            clear: true,
            skipUpdateTransform: true,
        });
    }

    // Attribute getters + setters

    /**
     * @type {number} The radius of the lit area in pixels.
     */
    set range(range) {
        this._range = range;
        this.__updateTextureSize();
    }
    get range() {
        return this._range;
    }

    /**
     * @type {number} The number of points that makes up this light, for soft shadows. (More points = softer shadow edges + more intensive).
     */
    set pointCount(count) {
        this._pointCount = count;
        this.__createShadowMapSources();
    }
    get pointCount() {
        return this._pointCount;
    }

    /**
     * @type {number} The number of rays to draw for the light. (Higher resolution = more precise edges + more intensive).
     */
    set radialResolution(resolution) {
        this._radialResolution = resolution;
        this.__createShadowMapSources();
    }
    get radialResolution() {
        return this._radialResolution;
    }
}
