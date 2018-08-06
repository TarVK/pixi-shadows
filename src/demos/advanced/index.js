// Import everything, can of course just use <script> tags on your page as well.
import 'pixi.js';
import 'pixi-layers';
import '../../shadows'; // This plugin, I use a relative path, but you would use 'pixi-shadows' from npm

/* The actual demo code: */

// Create your application
var width = 880;
var height = 600;
var app = new PIXI.Application(width, height);
document.body.appendChild(app.view);

// Initialise the shadows plugin
PIXI.shadows.init(app);

// Make sure to overwrite the stage, otherwise pixi-layers won't work
var stage = app.stage = new PIXI.display.Stage();

// Create a container for all objects
var world = new PIXI.Container();
stage.addChild(world);

// Set up the shadow layer
stage.addChild(PIXI.shadows.shadowCasterLayer);

// Add the shadow filter to the diffuse layer
world.filters = [PIXI.shadows.shadowFilter];
PIXI.shadows.shadowFilter.useShadowCasterAsOverlay = false // Allows us to customise the overlays

// A function to combine different assets if your world object, but give them a common transform by using pixi-layers
// It is of course recommended to create a custom class for this, but this demo just shows the minimal steps required
function createShadowSprite(texture, shadowTexture, shadowOverlayTexture) {
    var container = new PIXI.Container(); // This represents your final 'sprite'

    // Things that create shadows
    var shadowCastingSprite = new PIXI.Sprite(shadowTexture);
    shadowCastingSprite.parentGroup = PIXI.shadows.shadowCasterGroup;
    container.addChild(shadowCastingSprite);
    
    // Things that are ontop of shadows
    var shadowOverlaySprite = new PIXI.Sprite(shadowOverlayTexture);
    shadowOverlaySprite.parentGroup = PIXI.shadows.shadowOverlayGroup;
    container.addChild(shadowOverlaySprite);
    
    // The things themselves (their texture)
    var sprite = new PIXI.Sprite(texture);
    container.addChild(sprite);

    return container;
}

// Can set ambientLight for the shadow filter, making the shadow less dark: 
// PIXI.shadows.shadowFilter.ambientLight = 0.4;

// Create a light that casts shadows
var shadow = new PIXI.shadows.Shadow(700, 0.7);
shadow.position.set(300, 300);
world.addChild(shadow);

// Create a background (that doesn't cast shadows)
var bgTexture = PIXI.Texture.fromImage('/demos/advanced/assets/background.jpg');
var background = new PIXI.Sprite(bgTexture);
world.addChild(background);

// Create some shadow casting demons
var demonTexture = PIXI.Texture.fromImage('/demos/advanced/assets/flameDemon.png');
var demonTextureShadow = PIXI.Texture.fromImage('/demos/advanced/assets/flameDemonShadow.png');
var demonTexture2 = PIXI.Texture.fromImage('/demos/advanced/assets/flameDemon2.png');
demonTexture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST; //For pixelated scaling

var demon1 = createShadowSprite(demonTexture2, demonTexture2, demonTexture2);
demon1.position.set(100, 200);
demon1.scale.set(3);
world.addChild(demon1);

var demon2 = createShadowSprite(demonTexture, demonTextureShadow, demonTexture);
demon2.position.set(500, 200);
demon2.scale.set(3);
world.addChild(demon2);

var demon3 = createShadowSprite(demonTexture2, demonTexture2, demonTexture2);
demon3.position.set(300, 300);
demon3.scale.set(3);
world.addChild(demon3);

// Make the light track your mouse
world.interactive = true;
world.on('mousemove', function(event){
    shadow.position.copy(event.data.global);
});

// Create a light point on click
world.on('pointerdown', function(event){
    var shadow = new PIXI.shadows.Shadow(700, 0.7);
    shadow.position.copy(event.data.global);
    world.addChild(shadow);
});