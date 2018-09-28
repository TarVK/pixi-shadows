import ShadowMaskFilter from "./filters/ShadowMaskFilter";
import ShadowMapFilter from "./filters/ShadowMapFilter";

/**
 * @class
 * @memberof PIXI.shadows
 *
 * @param range {number} The radius of the lit area in pixels.
 * @param [intensity=1] {number} The opacity of the lit area.
 * @param [pointCount=20] {number} The number of points that makes up this light.
 * @param [scatterRange=15] {number} The radius at which the points of the light should be scattered.
 */

export default class Shadow extends PIXI.Sprite {
    constructor(range, intensity, pointCount, scatterRange) {
        super(PIXI.RenderTexture.create(range * 2, range * 2));

        this._range = range;
        this._pointCount = pointCount || 20; //The number of lightpoins
        this._scatterRange = scatterRange || (this._pointCount == 1 ? 0 : 15);
        this._intensity = intensity || 1;
        this._radialResolution = 800;
        this._depthResolution = 1; //per screen pixel
        this._darkenOverlay = false;
        this.anchor.set(0.5);

        this._ignoreShadowCaster;

        this.__createShadowMapSources();
    }
    // Create the texture to apply this mask filter to
    __updateTextureSize() {
        this.texture.destroy();
        this.texture = PIXI.RenderTexture.create(
            this._range * 2,
            this._range * 2
        );
    }
    // Create the resources that create the shadow map
    __createShadowMapSources() {
        if (this._shadowMapSprite) this._shadowMapSprite.destroy();
        if (this._shadowMapResultSprite) this._shadowMapResultSprite.destroy();
        if (this._shadowMapResultTexture)
            this._shadowMapResultTexture.destroy();

        // A blank texture/sprite to apply the filter to
        this._shadowMapResultTexture = PIXI.RenderTexture.create(
            this._radialResolution,
            this._pointCount
        );
        this._shadowMapResultTexture.baseTexture.scaleMode =
            PIXI.SCALE_MODES.NEAREST;
        this._shadowMapSprite = new PIXI.Sprite(this._shadowMapResultTexture);
        this._shadowMapSprite.filters = [new ShadowMapFilter(this)];

        // The resulting texture/sprite after the filter has been applied
        this._shadowMapResultSprite = new PIXI.Sprite(
            this._shadowMapResultTexture
        );

        // Create the mask filter
        var filter = new ShadowMaskFilter(this);
        filter.blendMode = PIXI.BLEND_MODES.ADD;
        this.shadowFilter = filter;
        this.filters = [filter];
    }
    // Properly dispose all the created resources
    destroy() {
        if (this._shadowMapSprite) this._shadowMapSprite.destroy();
        if (this._shadowMapResultSprite) this._shadowMapResultSprite.destroy();
        if (this._shadowMapResultTexture)
            this._shadowMapResultTexture.destroy();
        this.texture.destroy();
        return super.destroy();
    }
    // Don't render this sprite unless we are in the dedicated render step called by the shadow filter
    renderAdvancedWebGL(renderer) {
        if (this.renderStep) super.renderAdvancedWebGL(renderer);
    }

    // Update the map to create the mask from
    update(renderer, shadowCasterSprite, shadowOverlaySprite) {
        this._shadowCasterSprite = shadowCasterSprite;
        this._shadowOverlaySprite = shadowOverlaySprite;
        renderer.render(
            this._shadowMapSprite,
            this._shadowMapResultTexture,
            true,
            null,
            true
        );
    }

    // Attribute setters
    /**
     * @type {number} The radius of the lit area in pixels.
     */
    set range(range) {
        this._range = range;
        this.__updateTextureSize();
    }
    /**
     * @type {number} The number of points that makes up this light, for soft shadows. (More points = softer shadow edges + more intensive).
     */
    set pointCount(count) {
        this._pointCount = count;
        this.__createShadowMapSources();
    }
    /**
     * @type {number} The opacity of the lit area. (may exceed 1).
     */
    set scatterRange(range) {
        this._scatterRange = range;
    }
    /**
     * @type {number} The radius at which the points of the light should be scattered. (Greater range = software shadow).
     */
    set intensity(intensity) {
        this._intensity = intensity;
    }
    /**
     * @type {number} The number of rays to draw for the light. (Higher resolution = more precise edges + more intensive).
     */
    set radialResolution(resolution) {
        this._radialResolution = resolution;
        this.__createShadowMapSources();
    }
    /**
     * @type {number} The of steps to take per pixel. (Higher resolution = more precise edges + more intensive).
     */
    set depthResolution(resolution) {
        this._depthResolution = resolution;
    }
    /**
     * @type {PIXI.Sprite} A shadow caster to ignore while creating the shadows. (Can be used if sprite and light always overlap).
     */
    set ignoreShadowCaster(sprite) {
        this._ignoreShadowCaster = sprite;
    }
    /**
     * @type {boolean} Whther or not overlays in shadows should become darker (can create odd artifacts, is very experimental/unfinished)
     */
    set darkenOverlay(bool) {
        this._darkenOverlay = bool;
    }

    // Attribute getters
    get range() {
        return this._range;
    }
    get pointCount() {
        return this._pointCount;
    }
    get scatterRange() {
        return this._scatterRange;
    }
    get intensity() {
        return this._intensity;
    }
    get radialResolution() {
        return this._radialResolution;
    }
    get depthResolution() {
        return this._depthResolution;
    }
    get ignoreShadowCaster() {
        return this._ignoreShadowCaster;
    }
    get darkenOverlay() {
        return this._darkenOverlay;
    }
}
