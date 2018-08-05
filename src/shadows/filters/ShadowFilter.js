export default class ShadowFilter extends PIXI.Filter{
    constructor(width, height){
        super(`
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
        `,`                    
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
        `);

        this._width = width;
        this._height = height;
        this.tick = 0;

        this.uniforms.ambientLight = 0.0;
        this.uniforms.size = [this._width, this._height];

        this.__createObjectSources();
        this.__createMaskSources();
    }
    // collider objects
    __createObjectSources(){
        if(this._objectResultTexture) this._objectResultTexture.destroy();
        if(this._objectResultSprite) this._objectResultSprite.destroy();

        if(!this._objectContainer) this._objectContainer = new PIXI.Container();

        // Create the final mask to apply to the container that this filter is applied to
        this._objectResultTexture = PIXI.RenderTexture.create(this._width, this._height);
        this._objectResultSprite = new PIXI.Sprite(this._objectResultTexture);
    }
    // final mask to apply as a filter
    __createMaskSources(){
        if(this._maskResultTexture) this._maskResultTexture.destroy();
        if(this._maskResultSprite) this._maskResultSprite.destroy();

        // Create maskMatrix for shader transform data
        if(!this._maskMatrix)  this._maskMatrix = new PIXI.Matrix();

        // Create the final mask to apply to the container that this filter is applied to
        this._maskResultTexture = PIXI.RenderTexture.create(this._width, this._height);
        if(!this._maskContainer) this._maskContainer = new PIXI.Container();
        this._maskResultSprite = new PIXI.Sprite(this._maskResultTexture);
    }
    // Update the mask texture (called from the Application mixin)
    update(renderer){
        // Shadows and objects will automatically be added to containers because of the Container mixin

        this.tick++; // Increase the tick so that shadows and objects know they can add themselves to the container again in their next update

        // Remove the parent layer from the objects in order to properly render it to the container
        this._objectContainer.children.forEach(child => {
            child._activeParentLayer = null;
        });

        // Render all the objects onto 1 texture
        renderer.render(this._objectContainer, this._objectResultTexture, true, null, true);

        // Remove all the objects from the container
        this._objectContainer.children.length = 0;

        // Update all shadows and indicate that they may properly be rendered now
        this._maskContainer.children.forEach(shadow => {
            shadow.renderStep = true;
            shadow.update(renderer, this._objectResultSprite);
        });

        // Render all the final shadow masks onto 1 texture
        renderer.render(this._maskContainer, this._maskResultTexture, true, null, true);

        // Indicate that the shadows may no longer render
        this._maskContainer.children.forEach(shadow => {
            delete shadow.renderStep;
        });

        // Remove all the shadows from the container
        this._maskContainer.children.length = 0;
    }

    //  Apply the filter to a container
    apply(filterManager, input, output){
        // Filter almost directly taken from the pixi mask filter
        const maskSprite = this._maskResultSprite;
        const tex = this._maskResultSprite.texture;

        if (!tex.valid) {
            return;
        }
        if (!tex.transform) {
            tex.transform = new PIXI.TextureMatrix(tex, 0.0);
        }

        this.uniforms.mask = tex;
        this.uniforms.otherMatrix = filterManager.calculateSpriteMatrix(this._maskMatrix, maskSprite);

        filterManager.applyFilter(this, input, output);
    }

    // Attribute setters
    set ambientLight(frac){
        this.uniforms.ambientLight = frac;
    }
    set width(width){
        this._width = width;

        this.uniforms.size = [this._width, this._height];
        this.__createObjectSources();
        this.__createMaskSources();
    }
    set height(height){
        this._height = height;

        this.uniforms.size = [this._width, this._height];
        this.__createObjectSources();
        this.__createMaskSources();
    }

    // Attribute getters
    get ambientLight(){
        return this.uniforms.ambientLight;
    }
    get width(){
        return this._width;
    }
    get height(){
        return this._height;
    }
}