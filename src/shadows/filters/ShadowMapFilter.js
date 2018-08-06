import { filterFuncs } from './FilterFuncs';

let maxDepthResolution = '2000.0';
export default class ShadowMapFilter extends PIXI.Filter{
    constructor(shadow){
        super(`
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
        `,`
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
                for(float dist=0.0; dist < ${maxDepthResolution}; dist+=1.0){
                    if(dist > depthRes) break;
                    
                    // Calculate the actual distance in pixel units, and use it to calculate the pixel coordinate to inspect
                    float distance = dist / depthRes * lightRange;
                    vec2 coord = lightLoc + offset + vec2(cos(angle), sin(angle)) * distance;
                
                    // Extract the pixel and check if it is opaque
                    float opacity = texture2D(shadowCasterSampler, coord / shadowCasterSpriteDimensions).a;
                    if(opacity > 0.5){
                        // Check if it isn't hitting something that should be ignore
                        if(hasIgnoreShadowCaster){ 
                            vec2 l = (ignoreShadowCasterMatrix * vec3(coord, 1.0)).xy / ignoreShadowCasterDimensions;
                            if(l.x >= -0.01 && l.x <= 1.01 && l.y >= -0.01 && l.y <= 1.01){
                                // If the pixel at the ignoreShadowCaster is opaque here, skip this pixel
                                if(opacity > 0.5){
                                    continue;
                                }
                            }
                        }

                        // Calculate the percentage at which this hit occurred, and stop the loop
                        hitDistancePer = distance / lightRange;
                        break;
                    }
                }

                // Express the distance as a color in the map
                gl_FragColor = floatToColor(hitDistancePer * 100000.0);
            }
        `);
        
        this.uniforms.lightPointCount = shadow.pointCount;

        this.uniforms.dimensions = [shadow.radialResolution, shadow.pointCount];
        this.shadow = shadow;
        
        this.autoFit = false;
        this.padding = 0;

        this.ignoreShadowCasterMatrix = new PIXI.Matrix();
    }
    
    apply(filterManager, input, output){
        // Attach the object sampler
        var sc = this.shadow._shadowCasterSprite;
        this.uniforms.shadowCasterSpriteDimensions = [sc.width, sc.height];
        this.uniforms.shadowCasterSampler = sc._texture;

        // Use the world transform (data about the absolute location on the screen) to determine the lights relation to the objectSampler
        var wt = this.shadow.worldTransform;
        var scale = Math.sqrt(wt.a*wt.a + wt.b*wt.b);
        var range = this.shadow.range * scale;
        this.uniforms.lightRange = range;
        this.uniforms.lightScatterRange = this.shadow.scatterRange;
        this.uniforms.lightLoc = [wt.tx, wt.ty];
        this.uniforms.depthResolution = range * this.shadow.depthResolution;

        // Check if there is an object that the filter should attempt to ignore
        var isc = this.shadow.ignoreShadowCaster;
        this.uniforms.hasIgnoreShadowCaster = !!isc;
        if(isc){
            // Calculate the tranform matrix in order to access the proper pixel of the ignoreObject
            isc.worldTransform.copy(this.ignoreShadowCasterMatrix);
            this.uniforms.ignoreShadowCasterMatrix = this.ignoreShadowCasterMatrix.invert();

            // Attach the ignore object
            this.uniforms.ignoreShadowCasterDimensions = [isc.width, isc.height];
            this.uniforms.ignoreShadowCasterSampler = isc._texture;
        }

        // Apply the filter
        filterManager.applyFilter(this, input, output);
    }
}