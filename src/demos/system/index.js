import * as PIXI from 'pixi.js';
// Debug/demo imports
import * as dat from "dat.gui";

// Import everything, you can of course just use <script> tags on your page as well.
import { AppLoaderPlugin, Shadow } from "../../shadows"; // This plugin, I use a relative path, but you would use 'pixi-shadows' from npm

import { applyCanvasMixin } from '@pixi/layers'

// Initialise the shadows plugin
PIXI.extensions.add(AppLoaderPlugin);
applyCanvasMixin(PIXI.CanvasRenderer);
/* The actual demo code: */

// Some general settings for the demo
var demoOptions = {
    followMouse: true,
    shadowX: 450,
    shadowY: 150
};

// Create your application
var width = 800;
var height = 700;
var app = new PIXI.Application(width, height);
document.body.appendChild(app.view);

// Initialise the shadows plugin
var world = app.shadows.container;
app.shadows.filter.useShadowCasterAsOverlay = false; // Allows us to customise the overlays

// A function to combine different assets of your world object, but give them a common transform by using pixi-layers
// It is of course recommended to create a custom class for this, but this demo just shows the minimal steps required
function createShadowSprite(texture, shadowTexture, shadowOverlayTexture) {
    var container = new PIXI.Container(); // This represents your final 'sprite'

    // Things that create shadows
    if (shadowTexture) {
        var shadowCastingSprite = new PIXI.Sprite(shadowTexture);
        shadowCastingSprite.parentGroup = app.shadows.casterGroup;
        container.addChild(shadowCastingSprite);
    }

    // Things that are ontop of shadows
    if (shadowOverlayTexture) {
        var shadowOverlaySprite = new PIXI.Sprite(shadowOverlayTexture);
        shadowOverlaySprite.parentGroup = app.shadows.overlayGroup;
        container.addChild(shadowOverlaySprite);
    }

    // The things themselves (their texture)
    var sprite = new PIXI.Sprite(texture);
    container.addChild(sprite);

    return container;
}

// Can set ambientLight for the shadow filter, making the shadow less dark:
// app.shadows.filter.ambientLight = 0.4;

// Create a background (that doesn't cast shadows)
var bgTexture = PIXI.Texture.from("assets/background.jpg");
var background = new PIXI.Sprite(bgTexture);
world.addChild(background);

// Create some shadow casting demons
var demonTexture = PIXI.Texture.from("assets/flameDemon.png");
demonTexture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST; //For pixelated scaling

var demon1 = createShadowSprite(demonTexture, demonTexture, demonTexture);
demon1.position.set(100, 100);
demon1.scale.set(3);
world.addChild(demon1);

var demon2 = createShadowSprite(demonTexture, demonTexture, demonTexture);
demon2.position.set(500, 100);
demon2.scale.set(3);
world.addChild(demon2);

var demon3 = createShadowSprite(demonTexture, demonTexture, demonTexture);
demon3.position.set(300, 200);
demon3.scale.set(3);
world.addChild(demon3);

// Create a light that casts shadows
var shadow = new Shadow(300, 1, 5);
shadow.position.set(demoOptions.shadowX, demoOptions.shadowY);
world.addChild(shadow);

// Show shadow map
function showShadowMap() {
    var shadowMapSprite = shadow._shadowMapResultSprite;
    shadowMapSprite.x = 0;
    shadowMapSprite.y = 500;
    shadowMapSprite.width = 800;
    shadowMapSprite.height = 200;
    app.stage.addChild(shadowMapSprite);
}
showShadowMap();

// Make the light track your mouse
world.interactive = true;
world.on("mousemove", function(event) {
    if (demoOptions.followMouse) {
        shadow.position.copyFrom(event.data.global);
    } else {
        shadow.position.x = demoOptions.shadowX;
        shadow.position.y = demoOptions.shadowY;
    }
});

/* The debug debug/demo code */

// Add settings controls
var gui = new dat.GUI();

// Demo options
var demoGUI = gui.addFolder("Demo options");
demoGUI.open();
demoGUI.add(demoOptions, "followMouse");
demoGUI.add(demoOptions, "shadowX", 0, 800);
demoGUI.add(demoOptions, "shadowY", 0, 600);

// Shadow properties
var shadowGUI = gui.addFolder("Shadow properties");
shadowGUI.open();
shadowGUI.add(shadow, "range", 50, 1000);
shadowGUI.add(shadow, "intensity", 0, 3);
shadowGUI.add(shadow, "pointCount", 1, 50, 1).onChange(showShadowMap);
shadowGUI.add(shadow, "scatterRange", 0, 50);
shadowGUI.add(shadow, "radialResolution", 100, 1500, 1).onChange(showShadowMap);
shadowGUI.add(shadow, "depthResolution", 0.1, 3);
shadowGUI.add(shadow, "darkenOverlay");

// Show specific layers
var revealGUI = gui.addFolder("Analyze");
revealGUI.open();
var reveal = {};
reveal["show mask"] = false;
reveal["remove casters"] = false;
reveal["remove overlays"] = false;
revealGUI.add(reveal, "show mask").onChange(function(value) {
    if (value) app.stage.addChild(app.shadows.filter._maskResultSprite);
    else app.stage.removeChild(app.shadows.filter._maskResultSprite);
});
revealGUI.add(reveal, "remove casters").onChange(function(value) {
    app.shadows.filter._shadowCasterContainer.visible = !value;
});
revealGUI.add(reveal, "remove overlays").onChange(function(value) {
    app.shadows.filter._shadowOverlayContainer.visible = !value;
});
