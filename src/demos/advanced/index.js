// Import everything, you can of course just use <script> tags on your page as well.
import "pixi.js";
import "pixi-layers";
import "../../shadows"; // This plugin, I use a relative path, but you would use 'pixi-shadows' from npm

// Debug/demo imports
import * as dat from "dat.gui";
import Stats from "stats-js";

/* The actual demo code: */

// Some general settings for the demo
var demoOptions = {
    followMouse: false,
    shadowX: 450,
    shadowY: 150
};

// Create your application
var width = 800;
var height = 500;
var app = new PIXI.Application(width, height);
document.body.appendChild(app.view);

// Initialise the shadows plugin
var world = PIXI.shadows.init(app);
PIXI.shadows.filter.useShadowCasterAsOverlay = false; // Allows us to customise the overlays

// A function to combine different assets of your world object, but give them a common transform by using pixi-layers
// It is of course recommended to create a custom class for this, but this demo just shows the minimal steps required
function createShadowSprite(texture, shadowTexture, shadowOverlayTexture) {
    var container = new PIXI.Container(); // This represents your final 'sprite'

    // Things that create shadows
    if (shadowTexture) {
        var shadowCastingSprite = new PIXI.Sprite(shadowTexture);
        shadowCastingSprite.parentGroup = PIXI.shadows.casterGroup;
        container.addChild(shadowCastingSprite);
    }

    // Things that are ontop of shadows
    if (shadowOverlayTexture) {
        var shadowOverlaySprite = new PIXI.Sprite(shadowOverlayTexture);
        shadowOverlaySprite.parentGroup = PIXI.shadows.overlayGroup;
        container.addChild(shadowOverlaySprite);
    }

    // The things themselves (their texture)
    var sprite = new PIXI.Sprite(texture);
    container.addChild(sprite);

    return container;
}

// Can set ambientLight for the shadow filter, making the shadow less dark:
// PIXI.shadows.filter.ambientLight = 0.4;

// Create a light that casts shadows
var shadow = new PIXI.shadows.Shadow(700, 1);
shadow.position.set(demoOptions.shadowX, demoOptions.shadowY);
world.addChild(shadow);

// Create a background (that doesn't cast shadows)
var bgTexture = PIXI.Texture.fromImage("assets/background.jpg");
var background = new PIXI.Sprite(bgTexture);
world.addChild(background);

// Create some shadow casting demons
var demonTexture = PIXI.Texture.fromImage("assets/flameDemon.png");
var demonShadowTexture = PIXI.Texture.fromImage("assets/flameDemonShadow.png");
var demonTexture2 = PIXI.Texture.fromImage("assets/flameDemon2.png");
demonTexture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST; //For pixelated scaling
demonShadowTexture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
demonTexture2.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

var demon1 = createShadowSprite(demonTexture2, demonTexture2);
demon1.position.set(100, 100);
demon1.scale.set(3);
world.addChild(demon1);

var demon2 = createShadowSprite(demonTexture, demonShadowTexture, demonTexture);
demon2.position.set(500, 100);
demon2.scale.set(3);
world.addChild(demon2);

var demon3 = createShadowSprite(demonTexture2, demonTexture2, demonTexture2);
demon3.position.set(300, 200);
demon3.scale.set(3);
world.addChild(demon3);

// Make the light track your mouse
world.interactive = true;
world.on("mousemove", function(event) {
    if (demoOptions.followMouse) {
        shadow.position.copy(event.data.global);
    } else {
        shadow.position.x = demoOptions.shadowX;
        shadow.position.y = demoOptions.shadowY;
    }
});

// Create a light point on click
var shadows = [];
world.on("pointerdown", function(event) {
    var shadow = new PIXI.shadows.Shadow(700, 0.7);
    shadows.push(shadow);
    shadow.position.copy(event.data.global);
    world.addChild(shadow);

    // Set the ignore shadow caster if enabled
    if (ignore["placed shadows"])
        shadow.ignoreShadowCaster = demon1.children[0];
});

/* The debug debug/demo code */

// Add fps counter
var stats = new Stats();
stats.setMode(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.domElement);
stats.domElement.style.position = "absolute";
stats.domElement.style.top = 0;
app.ticker.add(function() {
    stats.begin();
    stats.end();
});

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
shadowGUI.add(shadow, "pointCount", 1, 50, 1);
shadowGUI.add(shadow, "scatterRange", 0, 50);
shadowGUI.add(shadow, "radialResolution", 100, 1500, 1);
shadowGUI.add(shadow, "depthResolution", 0.1, 3);
shadowGUI.add(shadow, "overlayLightLength", 10, 1000);
shadowGUI.add(shadow, "darkenOverlay");

// Filter controls
var filter = PIXI.shadows.filter;
var filterGUI = gui.addFolder("Filter properties");
filterGUI.open();
filterGUI.add(filter, "width", 100, 1920, 1);
filterGUI.add(filter, "height", 100, 1080, 1);
filterGUI.add(filter, "ambientLight", 0, 1, 0.01);
filterGUI.add(filter, "useShadowCasterAsOverlay");

// Ignore caster example
var ignoreCasterGUI = gui.addFolder("Ignore caster per shadow");
var ignore = {};
ignore["main shadow"] = false;
ignore["placed shadows"] = false;
ignoreCasterGUI.add(ignore, "main shadow").onChange(function(value) {
    if (value) shadow.ignoreShadowCaster = demon1.children[0];
    else shadow.ignoreShadowCaster = null;
});
ignoreCasterGUI.add(ignore, "placed shadows").onChange(function(value) {
    for (var i = 0; i < shadows.length; i++) {
        var shadow = shadows[i];
        if (value) shadow.ignoreShadowCaster = demon1.children[0];
        else shadow.ignoreShadowCaster = null;
    }
});

// Show specific layers
var revealGUI = gui.addFolder("Show layers (for debugging)");
var reveal = {
    textures: false,
    casters: false,
    overlays: false
};
revealGUI.add(reveal, "textures").onChange(function(value) {
    if (value) world.filters = [];
    else world.filters = [PIXI.shadows.filter];
});
revealGUI.add(reveal, "casters").onChange(function(value) {
    if (value)
        app.stage.addChild(PIXI.shadows.filter._shadowCasterResultSprite);
    else app.stage.removeChild(PIXI.shadows.filter._shadowCasterResultSprite);
});
revealGUI.add(reveal, "overlays").onChange(function(value) {
    if (value)
        app.stage.addChild(PIXI.shadows.filter._shadowOverlayResultSprite);
    else app.stage.removeChild(PIXI.shadows.filter._shadowOverlayResultSprite);
});
