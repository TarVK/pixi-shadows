import { filterFuncs } from './FilterFuncs';
export default class ShadowMaskFilter extends PIXI.Filter{
    constructor(shadow){
        super(`
            attribute vec2 aVertexPosition;
            attribute vec2 aTextureCoord;
            
            uniform mat3 projectionMatrix;
            uniform mat3 objectMatrix;
            uniform mat3 filterMatrix;
            
            varying vec2 vTextureCoord;
            varying vec2 vObjectCoord;
            varying vec2 vFilterCoord;
            
            void main(void){
                gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
                vTextureCoord = aTextureCoord;
                vObjectCoord = (objectMatrix * vec3(aTextureCoord, 1.0) ).xy;
            }
        `,`
            varying vec2 vObjectCoord;
            varying vec2 vTextureCoord;
            uniform vec4 filterArea;
            
            uniform sampler2D objectSampler;
            uniform sampler2D ignoreObjectSampler;

            uniform vec2 dimensions;

            uniform sampler2D shadowSampler;

            uniform float lightPointCount;
            uniform float lightRange;
            uniform float lightScatterRange;
            uniform float lightIntensity;

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

                // The intensity of the pixel in the object map at this pixel
                vec4 objectPixel = texture2D(objectSampler, vObjectCoord);

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
                    
                    // Calculate the intensity of this pixel based on the objectSampler and objectDistance
                    float intensity = 0.0;
                    if(objectPixel.a > 0.6){
                        intensity = (1.0 - pow(distance / lightRange, 0.3)) * objectPixel.a;
                    }else if (objectDistance > pointDistance || objectDistance >= lightRange) {
                        intensity = 1.0 - distance / lightRange;
                    }

                    // Add the intensity to the total intensity
                    totalIntensity += intensity / lightPointCount;
                }

                // Create a mask based on the intensity
                gl_FragColor = vec4(vec3(lightIntensity * totalIntensity), 1.0);
            }
        `);

        this.uniforms.shadowSampler = shadow._shadowMapResultTexture;
        this.uniforms.lightPointCount = shadow._pointCount;        
        
        this.shadow = shadow;

        this.autoFit = false;
        this.padding = 0;
        this.objectMatrix = new PIXI.Matrix();
    }
    
    apply(filterManager, input, output){
        // Attach the object sampler
        var os = this.shadow._objectSprite;
        this.uniforms.objectSpriteDimensions = [os.width, os.height];
        this.uniforms.objectSampler = os._texture;
        
        // Use the world transform (data about the absolute location on the screen) to determine the lights relation to the objectSampler
        var wt = this.shadow.worldTransform;
        var scale = Math.sqrt(wt.a*wt.a + wt.b*wt.b);
        var range = this.shadow.range * scale;
        this.uniforms.lightRange = range;
        this.uniforms.lightScatterRange = this.shadow.scatterRange;
        this.uniforms.lightIntensity = this.shadow.intensity;

        // Texture size increase in order to fit the sprite rectangle (even though we are only interested in a circle)
        // So we have to consider this in the texture size
        var texSize = 2 * this.shadow.range * (wt.a + wt.b);
        this.uniforms.dimensions = [texSize, texSize];
        
        // Calculate the object sampler position in relation to the light
        this.uniforms.objectMatrix = filterManager.calculateSpriteMatrix(this.objectMatrix, os);
        
        // Apply the filter
        filterManager.applyFilter(this, input, output);
    }
}