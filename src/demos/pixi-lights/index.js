// Import everything, you can of course just use <script> tags on your page as well.
import "pixi.js";
import "pixi-layers";
import "../../shadows"; // This plugin, I use a relative path, but you would use 'pixi-shadows' from npm
import * as PixiLights from "pixi-lights";
// For some reasons PixiLights doesn't 'install' itself with the npm module,
// so the line below is an easy fix (not relevant if using script tags)
PIXI.lights = PixiLights;

/* The actual demo code: */

// Create your application
var width = 800;
var height = 500;
var app = new PIXI.Application(width, height);
document.body.appendChild(app.view);

// Initialise the shadows plugin
var world = PIXI.shadows.init(app);

// A function to combine different assets of your world object, but give them a common transform by using pixi-layers
// It is of course recommended to create a custom class for this, but this demo just shows the minimal steps required
function create3DSprite(diffuseTex, normalTex, shadowTexture) {
    var container = new PIXI.Container(); // This represents your final 'sprite'

    var diffuseSprite = new PIXI.Sprite(diffuseTex);
    diffuseSprite.parentGroup = PIXI.lights.diffuseGroup;
    container.addChild(diffuseSprite);

    var normalSprite = new PIXI.Sprite(normalTex);
    normalSprite.parentGroup = PIXI.lights.normalGroup;
    container.addChild(normalSprite);

    if (shadowTexture) {
        // Only create a shadow casting object if a texture is provided
        var shadowCastingSprite = new PIXI.Sprite(shadowTexture);
        shadowCastingSprite.parentGroup = PIXI.shadows.casterGroup;
        container.addChild(shadowCastingSprite);
    }

    return container;
}
// A function to combine the pixi-lights and pixi-shadows, and give them a common transform as well
// Again, it is recommended to create a proper class for this in your application
function createLight(radius, intensity, color) {
    var container = new PIXI.Container();

    var pixiLight = new PIXI.lights.PointLight(color, intensity);
    container.addChild(pixiLight);

    var shadow = new PIXI.shadows.Shadow(radius, 0.7); // Radius in pixels
    container.addChild(shadow);

    return container;
}

// Create an ambient light
world.addChild(new PIXI.lights.AmbientLight(null, 1));
world.addChild(new PIXI.lights.DirectionalLight(null, 1, new PIXI.Point(0, 1))); // pixi-shadows doesn't support directional shadows yet
// Can also set ambientLight for the shadow filter, making the shadow less dark:
// PIXI.shadows.filter.ambientLight = 0.4;

// Create a light that casts shadows
var light = createLight(700, 4, 0xffffff);
light.position.set(300, 300);
world.addChild(light);

// Create a background (that doesn't cast shadows)
var bgDiffuseTexture = PIXI.Texture.fromImage("assets/background.jpg", true);
var bgNormalTexture = PIXI.Texture.fromImage("assets/backgroundNormalMap.jpg");
var background = create3DSprite(bgDiffuseTexture, bgNormalTexture);
world.addChild(background);

// Create some shadow casting blocks
var blockDiffuse = PIXI.Texture.fromImage("assets/cutBlock.png");
var blockNormal = PIXI.Texture.fromImage("assets/cutBlockNormalMap.png");

var block1 = create3DSprite(blockDiffuse, blockNormal, blockDiffuse);
block1.position.set(100, 200);
world.addChild(block1);

var block2 = create3DSprite(blockDiffuse, blockNormal, blockDiffuse);
block2.position.set(500, 200);
world.addChild(block2);

var block3 = create3DSprite(blockDiffuse, blockNormal, blockDiffuse);
block3.position.set(300, 300);
world.addChild(block3);

// Make the light track your mouse
world.interactive = true;
world.on("mousemove", function(event) {
    light.position.copy(event.data.global);
});

// Create a light point on click
world.on("pointerdown", function(event) {
    var light = createLight(450, 2, 0xffffff);
    light.position.copy(event.data.global);
    world.addChild(light);
});
