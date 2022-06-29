import * as PIXI from "pixi.js";

// Import everything, you can of course just use <script> tags on your page as well.
import { AppLoaderPlugin, Shadow } from "../../shadows"; // This plugin, I use a relative path, but you would use 'pixi-shadows' from npm

import { applyCanvasMixin } from "@pixi/layers";

// Initialise the shadows plugin
PIXI.extensions.add(AppLoaderPlugin);
applyCanvasMixin(PIXI.CanvasRenderer);
/* The actual demo code: */

// Create your application
var width = 800;
var height = 500;
var app = new PIXI.Application(width, height);
document.body.appendChild(app.view);
// AppLoaderPlugin.init.apply(app);

// Create a world container
var world = app.shadows.container;

// A function to combine different assets of your world object, but give them a common transform by using pixi-layers
// It is of course recommended to create a custom class for this, but this demo just shows the minimal steps required
function createShadowSprite(texture, shadowTexture) {
  var container = new PIXI.Container(); // This represents your final 'sprite'

  // Things that create shadows
  if (shadowTexture) {
    var shadowCastingSprite = new PIXI.Sprite(shadowTexture);
    shadowCastingSprite.parentGroup = app.shadows.casterGroup;
    container.addChild(shadowCastingSprite);
  }

  // The things themselves (their texture)
  var sprite = new PIXI.Sprite(texture);
  container.addChild(sprite);

  return container;
}

// Can set ambientLight for the shadow filter, making the shadow less dark:
// PIXI.shadows.filter.ambientLight = 0.4;

// Create a light that casts shadows
var shadow = new Shadow(700, 1);
shadow.position.set(450, 150);
world.addChild(shadow);

// Create a background (that doesn't cast shadows)
var bgTexture = PIXI.Texture.from("assets/background.jpg");
var background = new PIXI.Sprite(bgTexture);
world.addChild(background);

// Create some shadow casting demons
var demonTexture = PIXI.Texture.from("assets/flameDemon.png");
demonTexture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST; //For pixelated scaling

var demon1 = createShadowSprite(demonTexture, demonTexture);
demon1.position.set(100, 100);
demon1.scale.set(3);
world.addChild(demon1);

var demon2 = createShadowSprite(demonTexture, demonTexture);
demon2.position.set(500, 100);
demon2.scale.set(3);
world.addChild(demon2);

var demon3 = createShadowSprite(demonTexture, demonTexture);
demon3.position.set(300, 200);
demon3.scale.set(3);
world.addChild(demon3);

// Make the light track your mouse
world.interactive = true;
world.on("mousemove", function (event) {
  shadow.position.copyFrom(event.data.global);
});

// Create a light point on click
world.on("pointerdown", function (event) {
  var shadow = new Shadow(700, 0.7);
  shadow.position.copyFrom(event.data.global);
  world.addChild(shadow);
});
