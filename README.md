# pixi-shadows

Pixi-shadows allows you to add shadows and lights to your pixi stage.
The lights themselves are very simple, and this plugin purely focuses on the shadows. If you are interested in high quality lighting, you can easily combine this plugin with the [pixi-lights](https://github.com/pixijs/pixi-lights) plugin. Check out the main demo [here](https://tarvk.github.io/pixi-shadows/build/demos/basic/).

![Teaser image](https://github.com/TarVK/pixi-shadows/raw/master/teaser.png)

## Disclaimer

This plugin was made by a very inexperienced developer in the field.
I made it for usage in a personal project, and had to learn how to work with glsl to achieve this. I don't even have any real experience with opengl/webgl, so things are most likely not optimised. Any feedback is appreciated!

## Installation

```
npm install pixi-shadows
```

or copy [the pixi-shadows script](https://github.com/TarVK/pixi-shadows/blob/master/build/shadows/client/pixi-shadows.js) manually for usage without npm.

## Dependencies

Usage dependencies:

-   [pixi v4](https://github.com/pixijs/pixi.js/): Tested with version 4.8.0
-   [pixi-layers](https://github.com/pixijs/pixi-display): Tested with version 0.1.9
-   [pixi-lights](https://github.com/pixijs/pixi-lights): (optional) Tested with version 2.0.1

Dev dependencies:

-   [node.js](https://nodejs.org/en/)
-   [webpack](https://webpack.js.org/)
-   [webpack-server](https://github.com/webpack/webpack-dev-server)
-   [babel](https://babeljs.io/)

## Usage

To quickly get going, check out [this example](https://tarvk.github.io/pixi-shadows/build/demos/basic/):

```js
// Import everything, can of course just use <script> tags on your page as well.
import "pixi.js";
import "pixi-layers";
import "pixi-shadows";

/* The actual demo code: */

// Create your application
var width = 800;
var height = 500;
var app = new PIXI.Application(width, height);
document.body.appendChild(app.view);

// Create a world container
var world = PIXI.shadows.init(app, world);

// A function to combine different assets if your world object, but give them a common transform by using pixi-layers
// It is of course recommended to create a custom class for this, but this demo just shows the minimal steps required
function createShadowSprite(texture, shadowTexture) {
    var container = new PIXI.Container(); // This represents your final 'sprite'

    // Things that create shadows
    if (shadowTexture) {
        var shadowCastingSprite = new PIXI.Sprite(shadowTexture);
        shadowCastingSprite.parentGroup = PIXI.shadows.casterGroup;
        container.addChild(shadowCastingSprite);
    }

    // The things themselves (their texture)
    var sprite = new PIXI.Sprite(texture);
    container.addChild(sprite);

    return container;
}

// Create a light that casts shadows
var shadow = new PIXI.shadows.Shadow(700, 1);
shadow.position.set(450, 150);
world.addChild(shadow);

// Create a background (that doesn't cast shadows)
var bgTexture = PIXI.Texture.fromImage("assets/background.jpg");
var background = new PIXI.Sprite(bgTexture);
world.addChild(background);

// Create some shadow casting demons
var demonTexture = PIXI.Texture.fromImage("assets/flameDemon.png");
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
world.on("mousemove", function(event) {
    shadow.position.copy(event.data.global);
});

// Create a light point on click
world.on("pointerdown", function(event) {
    var shadow = new PIXI.shadows.Shadow(700, 0.7);
    shadow.position.copy(event.data.global);
    world.addChild(shadow);
});
```

---

Main steps:

-   Initialisation: The `PIXI.shadows.init(application)` method can be used to set up your app properly. This does some fairly specific things however, which might not be correct in your usage case. So you can also decide to ignore the step and manually set up your application. Please check out what the init method does in [this file](https://github.com/TarVK/pixi-shadows/blob/master/src/shadows/index.js).
-   Providing casters and overlays: A sprite can be marked to cast shadows (and not be rendered otherwise), by assigning it the group `PIXI.shadows.casterGroup`. Similarly, you can assign a sprite the group `PIXI.shadows.overlayGroup` making it render on top of shadows. By default shadow casters are also used as overlays.
-   Providing shadows/lights: In order to now see anything actually being rendered, shadows must be added to the world. This can be done by instantiating the `PIXI.shadows.Shadow` object.

### Shadow class

```js
var shadow = new PIXI.shadows.Shadow(radius);
world.addChild(shadow);
```

Parameters:

-   range: The radius of the lit area
-   intensity: The opacity of the lit area
-   pointCount: The number of points that cast light rays (With more points you get softer edges)
-   scatterRange: The radius in which the light points are spread around

Attributes:

-   All of the parameters above are also attributes
-   radialResolution: The number of pixels to use for the shadow mapping, preferably at least 2 times the radius
-   depthResolution: The number of depth steps to execute per pixel, preferably at least 1
-   ignoreShadowCaster: A sprite that can be assigned to a light such that it won't cast shadows

### Filter class

```js
var filter = PIXI.shadows.filter;
```

Attributes:

-   width: The width of your application
-   height: The height of your application
-   useShadowCasterAsOverlay: Whether or not to simply use the sprites casting shadows as the overlays for the shadows (true by default)
-   ambientLight: The opacity of the world where no shadows are present (the brightness of the shadows)

---

### Usage with pixi-lights

This plugin can easily be used together with pixi-lights. Even more so, some structural choices were specifically made to support pixi-lights as this was the end goal.
Here you can find a [demo](https://tarvk.github.io/pixi-shadows/build/demos/pixi-lights/) with its corresponding [source code](https://github.com/TarVK/pixi-shadows/blob/master/src/demos/pixi-lights/index.js).

### Advanced demo

In order to see all things that can be done with pixi-shadows, please have a look at the following [demo](https://tarvk.github.io/pixi-shadows/build/demos/advanced/) and its corresponding [source code](https://github.com/TarVK/pixi-shadows/blob/master/src/demos/advanced/index.js).
This demo can also be used to test performance (which is rather poor), and test how high numbers have to be crancked to achieve a desired effeect.

## Understanding how pixi-shadows work

As mentioned before, pixi-shadows can most likely be improved in terms of performance. For that reason I think it is important to explain how it currently works, such that more experienced people might be able to give feedback. It might also be handy for people that need to customise the plugin if it doesn't fit their needs exactly.

A [demo](https://tarvk.github.io/pixi-shadows/build/demos/system/) is provided to show various components of the process, as well as its corresponding [source code](https://github.com/TarVK/pixi-shadows/blob/master/src/demos/system/index.js). I attempted to comment [pixi-shadows' source code](https://github.com/TarVK/pixi-shadows/tree/master/src/shadows) a little bit as well, so hopefully this in combination with the explanation below should be enough to understand how it operates. Additionally you can check [this detailed article](https://github.com/mattdesl/lwjgl-basics/wiki/2D-Pixel-Perfect-Shadows) I found (but didn't use directly) that seems to have a very similar approach.

Step by step description of what happens for each rendered frame:

1. Calculate transforms in the scene: As per usual, world transforms for all objects are calculated. But the Container mixin does one more thing during this step; it registers all special sprites and adds them to the shadow filter.
2. Update the shadow filter which will perform several steps of its own:
    1. Render all shadow casters to a single texture.
    2. Render all shadow overlays to a signle texture.
    3. Render all shadows to their own texture:
        1. A shadow will first create a shadow map, as can be seen in the demo. This is a texture that stores the data of how far away a ray can be sent before it hits an object. To create this texture, it uses the shadow caster texture to look up pixel opacities. This texture can have several rows and columns, where every column indicates a certain angle, and every row indicates a single light point. The light points are spread around the center of the origin at a distance of the provided scatter range.
        2. Using this shadow map, a shadow can create a mask texture. For every pixel in the texture it will go through all light points. For all light points it will look up its angle towards said point, and check the distance to an object by checking the shadow map. If this distane is smaller than its own distance to the light point, it means the pixel is in the dark and should be black. In addition, every pixel will check the overlay texture. If it is opaque in said texture, it should be opaque in the mask, even if it is in a shadow.
    4. Render all shadow masks to a single mask texture by adding up all colors.
3. Use the mask texture in the shadow filter to perform a mask on the container that the filter is added to.

## Demos overview

-   [Basic demo](https://tarvk.github.io/pixi-shadows/build/demos/basic/)
-   [Advanced demo](https://tarvk.github.io/pixi-shadows/build/demos/advanced/)
-   [Pixi-lights demo](https://tarvk.github.io/pixi-shadows/build/demos/pixi-lights/)
-   [Process demo](https://tarvk.github.io/pixi-shadows/build/demos/system/)

## Using the development environment

### Setup

-   Install [node.js](https://nodejs.org/en/)
-   Run the following command in the root of the project

```
npm install
```

### Running demos (through which you can test the shadows)

```
npm run start:[demo name]
```

E.G.

```
npm run start:basic
```

This will start a development server that will live update as you save changes to the source code.

### Building code

#### Build a specific demo

```
npm run build-demo:[demo name]
```

E.G.

```
npm run build-demo:basic
```

#### Build all demos

```
npm run build:demos
```

#### Build pixi-shadows itself

```
npm run build
```

## TODO

-   Add more shadow types
    -   spotlight shadow
    -   directional shadow
-   Improve performance
