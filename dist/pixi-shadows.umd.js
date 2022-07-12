/* eslint-disable */
 
/*!
 * pixi-shadows - v1.1.0
 * Compiled Tue, 12 Jul 2022 21:19:40 UTC
 *
 * pixi-shadows is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2019-2020, Tar van Krieken, All Rights Reserved
 */
this.PIXI = this.PIXI || {};
this.PIXI.shadows = this.PIXI.shadows || {};
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@pixi/layers'), require('@pixi/display'), require('@pixi/constants'), require('@pixi/core'), require('@pixi/math'), require('@pixi/sprite'), require('@pixi/ticker')) :
    typeof define === 'function' && define.amd ? define(['exports', '@pixi/layers', '@pixi/display', '@pixi/constants', '@pixi/core', '@pixi/math', '@pixi/sprite', '@pixi/ticker'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.pixi_shadows = {}, global.PIXI.display, global.PIXI, global.PIXI, global.PIXI, global.PIXI, global.PIXI));
})(this, (function (exports, layers, display, constants, core, math, sprite) { 'use strict';

    // Some functions to map a value as a color
    const filterFuncs = /*glsl*/ `
float colorToFloat(vec4 color){
    return (color.r + (color.g + color.b * 256.0) * 256.0) * 255.0 - 8388608.0;
}
vec4 floatToColor(float f){
    f += 8388608.0;
    vec4 color;
    color.a = 255.0;
    color.b = floor(f / 256.0 / 256.0);
    color.g = floor((f - color.b * 256.0 * 256.0) / 256.0);
    color.r = floor(f - color.b * 256.0 * 256.0 - color.g * 256.0);
    return color / 255.0;
}
`;

    const maxDepthResolution = '2000.0';

    class ShadowMapFilter extends core.Filter {
        __init() {this.autoFit = false;}
        __init2() {this.padding = 0;}
        __init3() {this.ignoreShadowCasterMatrix = new math.Matrix();}

        constructor( shadow) {
            super(
                /* glsl*/ `
            attribute vec2 aVertexPosition;
            attribute vec2 aTextureCoord;
            
            uniform mat3 projectionMatrix;
            uniform mat3 filterMatrix;
            
            varying vec2 vTextureCoord;
            varying vec2 vFilterCoord;
            
            void main(void){
                gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
                vTextureCoord = aTextureCoord;
            }
        `,
                /* glsl*/ `
            varying vec2 vMaskCoord;
            varying vec2 vTextureCoord;
            uniform vec4 filterArea;
            
            uniform sampler2D shadowCasterSampler;
            uniform vec2 shadowCasterSpriteDimensions;

            uniform bool hasIgnoreShadowCaster;
            uniform sampler2D ignoreShadowCasterSampler;
            uniform mat3 ignoreShadowCasterMatrix;
            uniform vec2 ignoreShadowCasterDimensions;

            uniform float lightRange;
            uniform float lightScatterRange;
            uniform vec2 lightLoc;

            uniform float depthResolution;
            uniform bool darkenOverlay;

            uniform vec2 dimensions;

            ${filterFuncs}
            
            void main(void){
                float pi = 3.141592653589793238462643;
                
                // Cap the depthResolution (as I expect performance loss by having a big value, but I am not sure)
                float depthRes = min(${maxDepthResolution}, depthResolution);

                // The current coordinate on the texutre measured in pixels, as well as a fraction
                vec2 pixelCoord = vTextureCoord * filterArea.xy;
                vec2 normalizedCoord = pixelCoord / dimensions;
                
                // Extract the components of the normalized coordinate
                float x = normalizedCoord.x;
                float y = normalizedCoord.y;

                // Calculate the offset of the lightPoint we are currently at
                float offsetAngle = 2.0 * pi * y;
                vec2 offset = vec2(cos(offsetAngle), sin(offsetAngle)) * lightScatterRange;

                // Calculate the angle at which we are ray tracing
                float angle = x * pi * 2.0;

                // The distance at which we hit an object
                float hitDistancePer = 1.0;

                // Increase the distance until we hit an object or reach the maximum value
                bool reached = false;
                for(float dist=0.0; dist < ${maxDepthResolution}; dist+=1.0){
                    if(dist > depthRes) break;
                    
                    // Calculate the actual distance in pixel units, and use it to calculate the pixel coordinate to inspect
                    float distance = dist / depthRes * lightRange;
                    vec2 coord = lightLoc + offset + vec2(cos(angle), sin(angle)) * distance;
                
                    // Extract the pixel and check if it is opaque
                    float opacity = texture2D(shadowCasterSampler, coord / shadowCasterSpriteDimensions).a;
                    if((opacity > 0.0 && darkenOverlay) || opacity > 0.5){
                        // Check if it isn't hitting something that should be ignore
                        if(hasIgnoreShadowCaster){ 
                            vec2 l = (ignoreShadowCasterMatrix * vec3(coord, 1.0)).xy / ignoreShadowCasterDimensions;
                            if(l.x >= -0.01 && l.x <= 1.01 && l.y >= -0.01 && l.y <= 1.01){
                                // If the pixel at the ignoreShadowCaster is opaque here, skip this pixel
                                if(opacity > 0.0){
                                    continue;
                                }
                            }
                        }

                        // Calculate the percentage at which this hit occurred, and stop the loop
                        if(!darkenOverlay){
                            hitDistancePer = distance / lightRange;
                            break;
                        }
                        reached = true;
                    }else if(reached){
                        hitDistancePer = (distance - 1.0) / lightRange;
                        break;
                    }
                }

                // Express the distance as a color in the map
                gl_FragColor = floatToColor(hitDistancePer * 100000.0);
            }
        `
            );this.shadow = shadow;ShadowMapFilter.prototype.__init.call(this);ShadowMapFilter.prototype.__init2.call(this);ShadowMapFilter.prototype.__init3.call(this);;
            this.uniforms.lightPointCount = shadow.pointCount;
            this.uniforms.dimensions = [shadow.radialResolution, shadow.pointCount];
        }

        apply(filterManager, input, output, clearMode) {
            // Decide whether or not to darken the overlays
            this.uniforms.darkenOverlay = this.shadow.darkenOverlay;

            // Attach the object sampler
            const sc = this.shadow._shadowCasterSprite;

            this.uniforms.shadowCasterSpriteDimensions = [sc.width, sc.height];
            this.uniforms.shadowCasterSampler = sc._texture;

            // Use the world transform (data about the absolute location on the screen) to determine the lights relation to the objectSampler
            const wt = this.shadow.worldTransform;
            const scale = Math.sqrt(wt.a * wt.a + wt.b * wt.b);
            const range = this.shadow.range * scale;

            this.uniforms.lightRange = range;
            this.uniforms.lightScatterRange = this.shadow.scatterRange;
            this.uniforms.lightLoc = [wt.tx, wt.ty];
            this.uniforms.depthResolution = range * this.shadow.depthResolution;

            // Check if there is an object that the filter should attempt to ignore
            const isc = this.shadow.ignoreShadowCaster;

            this.uniforms.hasIgnoreShadowCaster = !!isc;
            if (isc) {
                // Calculate the tranform matrix in order to access the proper pixel of the ignoreObject
                isc.worldTransform.copyFrom(this.ignoreShadowCasterMatrix);
                this.uniforms.ignoreShadowCasterMatrix = this.ignoreShadowCasterMatrix.invert();

                // Attach the ignore object
                this.uniforms.ignoreShadowCasterDimensions = [isc.width, isc.height];
                this.uniforms.ignoreShadowCasterSampler = isc._texture;
            }

            // Apply the filter
            filterManager.applyFilter(this, input, output, clearMode);
        }
    }

    class ShadowMaskFilter extends core.Filter {
         __init() {this.inverted = false;}

        __init2() {this.autoFit = false;}
        __init3() {this.padding = 0;}
        __init4() {this.overlayMatrix = new math.Matrix();}

        constructor( shadow) {
            super(
                /* glsl*/ `
            attribute vec2 aVertexPosition;
            attribute vec2 aTextureCoord;
            
            uniform mat3 projectionMatrix;
            uniform mat3 overlayMatrix;
            uniform mat3 filterMatrix;
            
            varying vec2 vTextureCoord;
            varying vec2 vOverlayCoord;
            varying vec2 vFilterCoord;
            
            void main(void){
                gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
                vTextureCoord = aTextureCoord;
                vOverlayCoord = (overlayMatrix * vec3(aTextureCoord, 1.0) ).xy;
            }
        `,
                /* glsl*/ `
            varying vec2 vOverlayCoord;
            varying vec2 vTextureCoord;
            uniform vec4 filterArea;
            
            uniform sampler2D shadowOverlaySampler;

            uniform vec2 dimensions;

            uniform sampler2D shadowSampler;

            uniform bool darkenOverlay;
            uniform bool inverted;

            uniform float overlayLightLength;

            uniform float lightPointCount;
            uniform float lightRange;
            uniform float lightScatterRange;
            uniform float lightIntensity;
            uniform float fallOffFraction;

            ${filterFuncs}
            
            void main(void){
                float pi = 3.141592653589793238462643;
                
                // The current coordinate on the texture measured in pixels
                vec2 pixelCoord = vTextureCoord * filterArea.xy;

                // The distance delta relative to the center
                vec2 lightDelta = pixelCoord - dimensions / 2.0;
                float distance = sqrt(lightDelta.x * lightDelta.x + lightDelta.y * lightDelta.y);
                if (distance > lightRange) return;

                // The final intensity of the light at this pixel
                float totalIntensity = 0.0;

                // The intensity of the pixel in the overlay map at this pixel
                vec4 overlayPixel = texture2D(shadowOverlaySampler, vOverlayCoord);

                // Go through all light points (at most 1000) to add them to the intensity
                for(float lightIndex=0.0; lightIndex<1000.0; lightIndex++){
                    if (lightIndex >= lightPointCount) break; // Stop the loop if we went over the pointCount

                    // Calculate the offset of this lightPoint, relative the the center of the light
                    float lightIndexFrac = (lightIndex + 0.5) / lightPointCount;
                    float offsetAngle = 2.0 * pi * lightIndexFrac;
                    vec2 offset = vec2(cos(offsetAngle), sin(offsetAngle)) * lightScatterRange;

                    // Calculate the location of this pixel relative to the lightPoint, and check the depth map
                    vec2 pointDelta = lightDelta - offset;
                    float pointDistance = sqrt(pointDelta.x * pointDelta.x + pointDelta.y * pointDelta.y);
                    float angle = mod(atan(pointDelta.y, pointDelta.x) + 2.0 * pi, 2.0 * pi);
                    vec4 depthPixel = texture2D(shadowSampler, vec2(angle / (2.0 * pi), lightIndexFrac));

                    // Extract the object distance from the depth map pixel
                    float objectDistance = colorToFloat(depthPixel) / 100000.0 * lightRange;
                    
                    // Calculate the intensity of this pixel based on the overlaySampler and objectDistance
                    float distFromEdge = lightRange - distance;
                    float fallOffDist = lightRange * fallOffFraction;
                    float defaultIntensity = min(1.0, distFromEdge/fallOffDist);


                    float intensity = 0.0;
                    if (darkenOverlay) {
                        if (objectDistance > pointDistance || objectDistance >= lightRange) {
                            intensity = defaultIntensity;
                        }else if (overlayPixel.a > 0.5) {
                            intensity = defaultIntensity * pow(1.0 - (distance - objectDistance) / (lightRange - objectDistance), 2.5) * overlayPixel.a;
                        }
                    } else {
                        if (inverted) {
                            if (overlayPixel.a > 0.5) {
                                intensity = 1.0-overlayPixel.a;
                            }else if (objectDistance > pointDistance || objectDistance >= lightRange) {
                                intensity = 0.0;
                            }else{
                                intensity = 1.0;
                            }
                        }else{
                            if (objectDistance > pointDistance || objectDistance >= lightRange) {
                                intensity = defaultIntensity;
                            }else if (overlayPixel.a > 0.5) {
                                intensity = defaultIntensity * (1.0 - (pointDistance - objectDistance) / overlayLightLength);
                            }
                        }
                    }
                    

                    // Add the intensity to the total intensity
                    totalIntensity += intensity / lightPointCount;
                }

                // Create a mask based on the intensity
                gl_FragColor = vec4(vec3(lightIntensity * totalIntensity), 1.0);
            }
        `
            );this.shadow = shadow;ShadowMaskFilter.prototype.__init.call(this);ShadowMaskFilter.prototype.__init2.call(this);ShadowMaskFilter.prototype.__init3.call(this);ShadowMaskFilter.prototype.__init4.call(this);;

            this.uniforms.shadowSampler = shadow._shadowMapResultTexture;
            this.uniforms.lightPointCount = shadow.pointCount;
        }

        apply(filterManager, input, output, clearMode) {
            // Update simple uniforms
            this.uniforms.fallOffFraction = this.shadow.fallOffFraction;
            this.uniforms.darkenOverlay = this.shadow.darkenOverlay;

            // Attach the object sampler
            const sc = this.shadow._shadowOverlaySprite;

            this.uniforms.shadowOverlaySpriteDimensions = [sc.width, sc.height];
            this.uniforms.shadowOverlaySampler = sc._texture;

            // Use the world transform (data about the absolute location on the screen) to determine the lights relation to the objectSampler
            const wt = this.shadow.worldTransform;
            const scale = Math.sqrt(wt.a * wt.a + wt.b * wt.b);
            const range = this.shadow.range * scale;

            this.uniforms.lightRange = range;
            this.uniforms.lightScatterRange = this.shadow.scatterRange;
            this.uniforms.lightIntensity = this.shadow.intensity;

            // The length of the area of the overlay to be lit
            this.uniforms.overlayLightLength = this.shadow.overlayLightLength;

            // Invert the filter if specified
            this.uniforms.inverted = this.inverted;

            // Texture size increase in order to fit the sprite rectangle (even though we are only interested in a circle)
            // So we have to consider this in the texture size
            const texSize = 2 * this.shadow.range * (wt.a + wt.b);

            this.uniforms.dimensions = [texSize, texSize];

            // Calculate the object sampler position in relation to the light
            this.uniforms.overlayMatrix = filterManager.calculateSpriteMatrix(this.overlayMatrix, sc);

            // Apply the filter
            filterManager.applyFilter(this, input, output, clearMode);
        }
    }

    /**
     * @class
     * @memberof PIXI.shadows
     *
     * @param range {number} The radius of the lit area in pixels.
     * @param [intensity=1] {number} The opacity of the lit area.
     * @param [pointCount=20] {number} The number of points that makes up this light.
     * @param [scatterRange=15] {number} The radius at which the points of the light should be scattered.
     */

    class Shadow extends sprite.Sprite {
        /**
         * The of steps to take per pixel. (Higher resolution = more precise edges + more intensive).
         */
        __init() {this.depthResolution = 1;} // per screen pixel
        /**
         * Whther or not overlays in shadows should become darker (can create odd artifacts, is very experimental/unfinished)
         */
        __init2() {this.darkenOverlay = false;}

        /**
         * How many pixels of the overlay should be lit up by the light
         */
        __init3() {this.overlayLightLength = Infinity;}

        /**
         * A shadow caster to ignore while creating the shadows. (Can be used if sprite and light always overlap).
         */
        

        /**
         * The fraction of the range over which the light will fall-off linearly
         */
        __init4() {this.fallOffFraction = 1.0;}

        
        
        

        
        
        

        

        /**
         * @param range The radius of the lit area in pixels.
         * @param intensity The opacity of the lit area.
         * @param pointCount The number of points that makes up this light.
         * @param scatterRange The radius at which the points of the light should be scattered.
         */
        constructor(
             _range,
            /**
             * The opacity of the lit area. (may exceed 1).
             */
             intensity = 1,
             _pointCount = 20,
            /**
             * The radius at which the points of the light should be scattered. (Greater range = softer shadow boundary).
             */
             scatterRange = _pointCount === 1 ? 0 : 15,
             _radialResolution = 800
        ) {
            super(
                core.RenderTexture.create({
                    width: _range * 2,
                    height: _range * 2,
                })
            );this._range = _range;this.intensity = intensity;this._pointCount = _pointCount;this.scatterRange = scatterRange;this._radialResolution = _radialResolution;Shadow.prototype.__init.call(this);Shadow.prototype.__init2.call(this);Shadow.prototype.__init3.call(this);Shadow.prototype.__init4.call(this);;

            this.anchor.set(0.5);

            this.__createShadowMapSources();
        }
        // Create the texture to apply this mask filter to
        __updateTextureSize() {
            this.texture.destroy();
            this.texture = core.RenderTexture.create({
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
            this._shadowMapResultTexture = core.RenderTexture.create({
                width: this._radialResolution,
                height: this._pointCount,
            });
            this._shadowMapResultTexture.baseTexture.scaleMode = constants.SCALE_MODES.NEAREST;
            this._shadowMapSprite = new sprite.Sprite(this._shadowMapResultTexture);
            this._shadowMapSprite.filters = [new ShadowMapFilter(this)];

            // The resulting texture/sprite after the filter has been applied
            this.shadowMapResultSprite = new sprite.Sprite(this._shadowMapResultTexture);

            // Create the mask filter
            const filter = new ShadowMaskFilter(this);

            filter.blendMode = constants.BLEND_MODES.ADD;
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
        renderAdvanced(renderer) {
            if (this.renderStep) super.renderAdvanced(renderer);
        }

        // Update the map to create the mask from
        update(renderer, shadowCasterSprite, shadowOverlaySprite) {
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

    class ShadowFilter extends core.Filter {
         __init() {this.tick = 0;}
         __init2() {this._useShadowCastersAsOverlay = true;}
        
        
        
        
        
        
        
        
        
        
        constructor( _width,  _height) {
            super(
                /* glsl*/ `
            attribute vec2 aVertexPosition;
            attribute vec2 aTextureCoord;
            
            uniform mat3 projectionMatrix;
            uniform mat3 otherMatrix;
            
            varying vec2 vMaskCoord;
            varying vec2 vTextureCoord;
            
            void main(void)
            {
                gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
            
                vTextureCoord = aTextureCoord;
                vMaskCoord = ( otherMatrix * vec3( aTextureCoord, 1.0)  ).xy;
            }
        `,
                /* glsl*/ `                    
            varying vec2 vMaskCoord;
            varying vec2 vTextureCoord;
            
            uniform sampler2D uSampler;
            uniform sampler2D mask;
            uniform vec4 maskClamp;
            uniform float ambientLight;
            
            void main(void){            
                vec4 original = texture2D(uSampler, vTextureCoord);
                vec4 masky = texture2D(mask, vMaskCoord);
            
                original *= ambientLight + (1.0 - ambientLight) * (masky.r + masky.g + masky.b) / 3.0;
            
                gl_FragColor = original;
            }
        `
            );this._width = _width;this._height = _height;ShadowFilter.prototype.__init.call(this);ShadowFilter.prototype.__init2.call(this);;

            this.uniforms.ambientLight = 0.0;
            this.uniforms.size = [this._width, this._height];

            this.__createCasterSources();
            this.__createOverlaySources();
            this.__createMaskSources();
        }
        // Shadow overlay objects
        __createOverlaySources() {
            if (this._shadowOverlayResultTexture) this._shadowOverlayResultTexture.destroy();
            if (this._shadowOverlayResultSprite) this._shadowOverlayResultSprite.destroy();

            if (!this._shadowOverlayContainer) this._shadowOverlayContainer = new display.Container();

            // Create the final mask to apply to the container that this filter is applied to
            this._shadowOverlayResultTexture = core.RenderTexture.create({ width: this._width, height: this._height });
            this._shadowOverlayResultTexture.baseTexture.scaleMode = constants.SCALE_MODES.NEAREST;
            this._shadowOverlayResultSprite = new sprite.Sprite(this._shadowOverlayResultTexture);
        }
        // Shadow caster objects
        __createCasterSources() {
            if (this._shadowCasterResultTexture) this._shadowCasterResultTexture.destroy();
            if (this._shadowCasterResultSprite) this._shadowCasterResultSprite.destroy();

            if (!this._shadowCasterContainer) this._shadowCasterContainer = new display.Container();

            // Create the final mask to apply to the container that this filter is applied to
            this._shadowCasterResultTexture = core.RenderTexture.create({ width: this._width, height: this._height });
            this._shadowCasterResultTexture.baseTexture.scaleMode = constants.SCALE_MODES.NEAREST;
            this._shadowCasterResultSprite = new sprite.Sprite(this._shadowCasterResultTexture);
        }
        // Final mask to apply as a filter
        __createMaskSources() {
            if (this._maskResultTexture) this._maskResultTexture.destroy();
            if (this._maskResultSprite) this._maskResultSprite.destroy();

            // Create maskMatrix for shader transform data
            if (!this._maskMatrix) this._maskMatrix = new math.Matrix();

            // Create the final mask to apply to the container that this filter is applied to
            this._maskResultTexture = core.RenderTexture.create({ width: this._width, height: this._height });
            this._maskResultTexture.baseTexture.scaleMode = constants.SCALE_MODES.NEAREST;
            if (!this._maskContainer) this._maskContainer = new display.Container();
            this._maskResultSprite = new sprite.Sprite(this._maskResultTexture);
        }
        // Update the mask texture (called from the Application mixin)
        update(renderer) {
            // Shadows and objects will automatically be added to containers because of the Container mixin

            this.tick++; // Increase the tick so that shadows and objects know they can add themselves to the container again in their next update

            /* render shadow casters */
            // Remove the parent layer from the objects in order to properly render it to the container
            this._shadowCasterContainer.children.forEach((child) => {
                child._activeParentLayer = null;
            });

            // Render all the objects onto 1 texture
            renderer.render(this._shadowCasterContainer, {
                renderTexture: this._shadowCasterResultTexture,
                clear: true,
                skipUpdateTransform: true,
            });

            // Remove all the objects from the container
            this._shadowCasterContainer.children.length = 0;

            /* render shadow overlays */
            if (!this._useShadowCastersAsOverlay) {
                this._shadowOverlayContainer.children.forEach((child) => {
                    child._activeParentLayer = null;
                });

                // Render all the objects onto 1 texture
                renderer.render(this._shadowOverlayContainer, {
                    renderTexture: this._shadowOverlayResultTexture,
                    clear: true,
                    skipUpdateTransform: true,
                });

                // Remove all the objects from the container
                this._shadowOverlayContainer.children.length = 0;
            }

            /* render shadows */

            // Update all shadows and indicate that they may properly be rendered now
            const overlay = this._useShadowCastersAsOverlay
                ? this._shadowCasterResultSprite
                : this._shadowOverlayResultSprite;

            this._maskContainer.children.forEach((shadow) => {
                if (shadow instanceof Shadow) {
                    shadow.renderStep = true;
                    shadow.update(renderer, this._shadowCasterResultSprite, overlay);
                }
            });

            // Render all the final shadow masks onto 1 texture
            renderer.render(this._maskContainer, {
                renderTexture: this._maskResultTexture,
                clear: true,
                skipUpdateTransform: true,
            });

            // Indicate that the shadows may no longer render
            this._maskContainer.children.forEach((shadow) => {
                if (shadow instanceof Shadow) {
                    delete shadow.renderStep;
                }
            });

            // Remove all the shadows from the container
            this._maskContainer.children.length = 0;
        }

        //  Apply the filter to a container
        apply(filterManager, input, output, clearMode) {
            // Filter almost directly taken from the pixi mask filter
            const maskSprite = this._maskResultSprite;
            const tex = this._maskResultSprite.texture;

            if (!tex.valid) {
                return;
            }

            // TODO: uvMatrix ?
            // if (!tex.transform) {
            //   tex.transform = new TextureMatrix(tex, 0.0);
            // }

            this.uniforms.mask = tex;
            this.uniforms.otherMatrix = filterManager.calculateSpriteMatrix(this._maskMatrix, maskSprite);

            filterManager.applyFilter(this, input, output, clearMode);
        }

        // Attribute getters + setters
        /**
         * @type {number} The brightness that unlit areas of the world should have
         */
        set ambientLight(frac) {
            this.uniforms.ambientLight = frac;
        }
        get ambientLight() {
            return this.uniforms.ambientLight ;
        }
        /**
         * @type {number} The width of your application
         */
        set width(width) {
            this._width = width;

            this.uniforms.size = [this._width, this._height];
            this.__createOverlaySources();
            this.__createCasterSources();
            this.__createMaskSources();
        }
        get width() {
            return this._width;
        }
        /**
         * @type {number} The height of your application
         */
        set height(height) {
            this._height = height;

            this.uniforms.size = [this._width, this._height];
            this.__createOverlaySources();
            this.__createCasterSources();
            this.__createMaskSources();
        }
        get height() {
            return this._height;
        }
        /**
         * @type {boolean} Whether or not to use shadow casters as shadow overlays as well
         */
        set useShadowCasterAsOverlay(val) {
            this._useShadowCastersAsOverlay = val;
        }

        get useShadowCasterAsOverlay() {
            return this._useShadowCastersAsOverlay;
        }
    }

    function augmentApplication(application, shadowFilter) {
        // Replace the stage with a layered stage
        application.stage = new layers.Stage();

        // Remove the current render function
        // eslint-disable-next-line @typescript-eslint/unbound-method
        application.ticker.remove(application.render, application);

        // Overwrite the render function
        application.render = function render() {
            // Update stage transforms
            const cacheParent = this.stage.parent;
            // this.stage.parent = this.renderer._tempDisplayObjectParent;
            // this.stage.parent = this.stage._tempDisplayObjectParent;

            this.stage.parent = this.stage;
            this.stage.updateTransform();
            this.stage.parent = cacheParent;

            // Update the shadow filter
            shadowFilter.update(this.renderer);

            // Render the stage without updating the transforms again
            this.renderer.render(this.stage, { skipUpdateTransform: true });
        };

        // Reassign ticker because its setter initialises the render method
        // eslint-disable-next-line no-self-assign
        application.ticker = application.ticker;
    }

    function augmentContainer(shadowCasterGroup, shadowOverlayGroup, shadowFilter) {
        // eslint-disable-next-line @typescript-eslint/unbound-method
        const orTransform = display.Container.prototype.updateTransform;
        const ticks = new WeakMap();

        display.Container.prototype.updateTransform = function updateTransform( ...args) {
            if (this.parentGroup === shadowCasterGroup) {
                if (ticks.get(this) !== shadowFilter.tick) shadowFilter._shadowCasterContainer.children.push(this);
                ticks.set(this, shadowFilter.tick);
            }

            if (this.parentGroup === shadowOverlayGroup) {
                if (ticks.get(this) !== shadowFilter.tick) shadowFilter._shadowOverlayContainer.children.push(this);
                ticks.set(this, shadowFilter.tick);
            }

            if (this instanceof Shadow) {
                if (ticks.get(this) !== shadowFilter.tick) shadowFilter._maskContainer.children.push(this);
                ticks.set(this, shadowFilter.tick);
            }

            return orTransform.apply(this, args) ;
        };
    }

    function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }








    class Shadows {
        // The objects that will cast shadows
        __init() {this.casterGroup = new layers.Group();}
        // The objects that will remain ontop of the shadows
        __init2() {this.overlayGroup = new layers.Group();}
        
        __init3() {this.container = new display.Container();}
        constructor(app, options) {;Shadows.prototype.__init.call(this);Shadows.prototype.__init2.call(this);Shadows.prototype.__init3.call(this);
            // // Create the shadow filter
            this.filter = new ShadowFilter(app.renderer.width, app.renderer.height);
            // Set up the container mixin so that it tells the filter about the available shadows and objects
            augmentContainer(this.casterGroup, this.overlayGroup, this.filter);
            // Overwrite the application render method
            augmentApplication(app, this.filter);
            app.stage.addChild(this.container);

            if (_optionalChain([options, 'optionalAccess', _ => _.pixiLights])) {
                // Set up pixi-light's layers
                const diffuseLayer = new layers.Layer(options.pixiLights.diffuseGroup);
                const normalLayer = new layers.Layer(options.pixiLights.normalGroup);
                const lightLayer = new layers.Layer(options.pixiLights.lightGroup);
                const diffuseBlackSprite = new sprite.Sprite(diffuseLayer.getRenderTexture());

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









    const AppLoaderPlugin = {
        init( options) {
            this.shadows = new Shadows(this, options.fov);
        },
        destroy() {
            delete this.shadows;
        },
    };

    exports.AppLoaderPlugin = AppLoaderPlugin;
    exports.Shadow = Shadow;
    exports.ShadowFilter = ShadowFilter;
    exports.ShadowMaskFilter = ShadowMaskFilter;
    exports.Shadows = Shadows;
    exports.augmentApplication = augmentApplication;
    exports.augmentContainer = augmentContainer;
    exports.filterFuncs = filterFuncs;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
if (typeof pixi_shadows !== 'undefined') { Object.assign(this.PIXI.shadows, pixi_shadows); }
//# sourceMappingURL=pixi-shadows.umd.js.map
