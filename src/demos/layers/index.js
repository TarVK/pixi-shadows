// Import everything, can of course just use <script> tags on your page as well.
import "pixi.js";
import "../../shadows"; // This plugin, I use a relative path, but you would use 'pixi-shadows' from npm

/*
    This example is meant to show what you can do with layers, rather than what you should do.
    I personally don't know what you would need multiple layers for, so I can't make the system perfect for those circumstances.
    Instead I will show how you can achieve some type of multilayer setup, such that you can hopefully figure things out from there.
 */

/* The actual demo code: */

// Create your application
var width = 800;
var height = 500;
var renderer = new PIXI.WebGLRenderer(width, height);
var stage = new PIXI.Stage();
document.body.appendChild(renderer.view);
/*
    We are only using the shadows.application because it contains code for the simplest use case of the shadows.
    You can however just mirror what this code does yourself, and never use this class at all.
 */

// Create a world container (Which isn't strictly necessary)
var world = new PIXI.Container();
stage.addChild(world);

// Create some different 'layers' which can just be any container
var layer1 = new PIXI.Container();
var layer2 = new PIXI.Container();
stage.addChild(layer1, layer2);

// Assign shadow filters to these layers
var shadowFilter1 = new PIXI.shadows.ShadowFilter(width, height);
layer1.shadowFilter = shadowFilter1;

var shadowFilter2 = new PIXI.shadows.ShadowFilter(width, height);
layer2.shadowFilter = shadowFilter2;

// Setup the container mixin such that containers will track casters, overlays and shadows
PIXI.shadows.__classes.ContainerSetup();

// We aren't going to apply the filters to the layers themselves in this example
// instead we will combine them and apply that to the whole stage
shadowFilter2._maskResultTexture = shadowFilter1._maskResultTexture; // All shadows are combined on a single texture
shadowFilter2._clearShadowMaskBeforeDraw = false; // Make sure not to overwrite the texture
shadowFilter1._clearShadowMaskBeforeDraw = false;
stage.filters = [shadowFilter1];
// stage.addChild(shadowFilter1._maskResultSprite);

// Create a render target
renderer.textureManager.updateTexture(
    shadowFilter1._maskResultTexture.baseTexture,
    0
);

// Create a render loop
var ticker = new PIXI.ticker.Ticker();
ticker.add(function() {
    // Update stage transforms
    const cacheParent = stage.parent;
    stage.parent = renderer._tempDisplayObjectParent;
    stage.updateTransform();
    stage.parent = cacheParent;

    // Clear the shadow mask
    shadowFilter1._maskResultTexture.baseTexture._glRenderTargets[0].clear();

    // Update the shadow filter
    PIXI.shadows.filterInstances.forEach(shadowFilter => {
        shadowFilter.update(renderer);
    });
    PIXI.shadows.filterInstances = [];

    // Render the stage without updating the transforms again
    renderer.render(stage, undefined, undefined, undefined, true);
});
ticker.start();

// A function to combine different assets if your world object, but give them a common transform by using pixi-layers
// It is of course recommended to create a custom class for this, but this demo just shows the minimal steps required
function createShadowSprite(texture, shadowTexture, layers) {
    var container = new PIXI.Container(); // This represents your final 'sprite'

    // Things that create shadows
    if (shadowTexture) {
        var shadowCastingSprite = new PIXI.Sprite(shadowTexture);
        shadowCastingSprite.isShadowCaster = true;
        shadowCastingSprite.shadowLayers = layers;
        container.addChild(shadowCastingSprite);
    }

    // The things themselves (their texture)
    var sprite = new PIXI.Sprite(texture);
    container.addChild(sprite);

    return container;
}

// Create a static light that casts shadows
var shadow = new PIXI.shadows.Shadow(700, 1);
shadow.position.set(450, 150);
shadow.shadowLayers = [layer2];
world.addChild(shadow);

// Create a background (that doesn't cast shadows)
var bgTexture = PIXI.Texture.fromImage("assets/background.jpg");
var background = new PIXI.Sprite(bgTexture);
layer1.addChild(background);

// Create some shadow casting demons
var demonTexture = PIXI.Texture.fromImage("assets/flameDemon.png");
demonTexture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST; //For pixelated scaling

var demon1 = createShadowSprite(demonTexture, demonTexture, [layer1]);
demon1.position.set(100, 100);
demon1.scale.set(3);
layer1.addChild(demon1);

var demon2 = createShadowSprite(demonTexture, demonTexture, [layer2]);
demon2.position.set(500, 100);
demon2.scale.set(3);
layer2.addChild(demon2);

var demon3 = createShadowSprite(demonTexture, demonTexture, [layer2]);
demon3.position.set(300, 200);
demon3.scale.set(3);
layer2.addChild(demon3);

// Make the light track your mouse
world.interactive = true;
world.on("mousemove", function(event) {
    shadow.position.copy(event.data.global);
});

// Create a light point on click
world.on("pointerdown", function(event) {
    var shadow = new PIXI.shadows.Shadow(700, 0.7);
    shadow.position.copy(event.data.global);
    shadow.shadowLayers = [layer1];
    world.addChild(shadow);
});
