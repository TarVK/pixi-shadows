# pixi-shadows

Pixi-shadows allows you to add shadows and lights to your pixi stage.
The lights themselves are very simple, and this plugin purely focuses on the shadows. If you are interested in high quality lighting, you can easily combine this plugin with the [pixi-lights](https://github.com/pixijs/pixi-lights) plugin. Check out the main demo [here](https://tarvk.github.io/pixi-shadows/examples/basic/).

![Teaser image](https://github.com/TarVK/pixi-shadows/raw/master/teaser.png)

## Disclaimer

This plugin was made by a very inexperienced developer in the field.
I made it for usage in a personal project, and had to learn how to work with glsl to achieve this. I don't even have any real experience with opengl/webgl, so things are most likely not optimised. Any feedback is appreciated!

## Installation

```
npm install pixi-shadows
```

or, clone and build this repository, then copy the pixi-shadows [commonjs script](./dist/pixi-shadows.js) or [umd script](./dist/pixi-shadows.umd.js)manually for usage without npm.

## Vanilla JS, UMD build

All pixiJS v6 plugins has special `umd` build suited for vanilla.
Navigate `pixi-shadows` npm package, take `dist/pixi-shadows.umd.js` file. 
Also, you can access CDN link, something like `https://cdn.jsdelivr.net/npm/pixi-shadows@latest/dist/pixi-shadows.umd.js`.

```html
<script src='lib/pixi.js'></script>
<script src='lib/pixi-shadows.umd.js'></script>
```
All classes can then be accessed through `PIXI.shadows` package.

## Dependencies

Usage dependencies:

- [pixi.js](https://github.com/pixijs/pixi.js/): Tested with version 6.4.2
- [@pixi/layers](https://github.com/pixijs/layers): Tested with version 1.0.11
- [pixi-lights](https://github.com/pixijs/pixi-lights): Tested with version 3.0.0

## Usage

To quickly get going, check out [this example](https://tarvk.github.io/pixi-shadows/examples/basic/):

```typescript
import { AppLoaderPlugin, Shadow } from 'pixi-shadows';
import { Application, Container, InteractionEvent, SCALE_MODES, Sprite, Texture } from 'pixi.js';

// Initialise the shadows plugin
Application.registerPlugin(AppLoaderPlugin);
/* The actual demo code: */

// Create your application
const width = 800;
const height = 500;
const app = new Application({ width, height, autoStart: true });

document.body.appendChild(app.view);
// AppLoaderPlugin.init.apply(app);

// Create a world container
const world = app.shadows.container;

// A function to combine different assets of your world object, but give them a common transform by using pixi-layers
// It is of course recommended to create a custom class for this, but this demo just shows the minimal steps required
function createShadowSprite(texture: Texture, shadowTexture: Texture) {
    const container = new Container(); // This represents your final 'sprite'

    // Things that create shadows
    if (shadowTexture) {
        const shadowCastingSprite = new Sprite(shadowTexture);

        shadowCastingSprite.parentGroup = app.shadows.casterGroup;
        container.addChild(shadowCastingSprite);
    }

    // The things themselves (their texture)
    const sprite = new Sprite(texture);

    container.addChild(sprite);

    return container;
}

// Can set ambientLight for the shadow filter, making the shadow less dark:
// shadows.filter.ambientLight = 0.4;

// Create a light that casts shadows
const shadow = new Shadow(700, 1);

shadow.position.set(450, 150);
world.addChild(shadow);

// Create a background (that doesn't cast shadows)
const bgTexture = Texture.from('../../assets/background.jpg');
const background = new Sprite(bgTexture);

world.addChild(background);

// Create some shadow casting demons
const demonTexture = Texture.from('../../assets/flameDemon.png');

demonTexture.baseTexture.scaleMode = SCALE_MODES.NEAREST; // For pixelated scaling

const demon1 = createShadowSprite(demonTexture, demonTexture);

demon1.position.set(100, 100);
demon1.scale.set(3);
world.addChild(demon1);

const demon2 = createShadowSprite(demonTexture, demonTexture);

demon2.position.set(500, 100);
demon2.scale.set(3);
world.addChild(demon2);

const demon3 = createShadowSprite(demonTexture, demonTexture);

demon3.position.set(300, 200);
demon3.scale.set(3);
world.addChild(demon3);

// Make the light track your mouse
world.interactive = true;
world.on('mousemove', (event: InteractionEvent) => {
    shadow.position.copyFrom(event.data.global);
});

// Create a light point on click
world.on('pointerdown', (event: InteractionEvent) => {
    const shadow2 = new Shadow(700, 0.7);

    shadow2.position.copyFrom(event.data.global);
    world.addChild(shadow);
});
```

---

Main steps:

- Initialisation: The `Application.registerPlugin(AppLoaderPlugin);` line will register this plugin to set up your app properly. This does some fairly specific things however, which might not be correct in your usage case. So you can also decide to ignore the step and manually set up your application. Please check out what the init method does in [this file](https://github.com/TarVK/pixi-shadows/blob/master/src/shadows/index.ts).
- Providing casters and overlays: A sprite can be marked to cast shadows (and not be rendered otherwise), by assigning it the group `app.shadows.casterGroup`. Similarly, you can assign a sprite the group `app.shadows.overlayGroup` making it render on top of shadows. By default shadow casters are also used as overlays.
- Providing shadows/lights: In order to now see anything actually being rendered, shadows must be added to the world. This can be done by instantiating the `Shadow` object.

### Shadow class

```js
var shadow = new Shadow(radius);
world.addChild(shadow);
```

Parameters:

- range: The radius of the lit area
- intensity: The opacity of the lit area
- pointCount: The number of points that cast light rays (With more points you get softer edges)
- scatterRange: The radius in which the light points are spread around

Attributes:

- All of the parameters above are also attributes
- radialResolution: The number of pixels to use for the shadow mapping, preferably at least 2 times the radius
- depthResolution: The number of depth steps to execute per pixel, preferably at least 1
- ignoreShadowCaster: A sprite that can be assigned to a light such that it won't cast shadows

### Filter class

```js
var filter = app.shadows.filter;
```

Attributes:

- width: The width of your application
- height: The height of your application
- useShadowCasterAsOverlay: Whether or not to simply use the sprites casting shadows as the overlays for the shadows (true by default)
- ambientLight: The opacity of the world where no shadows are present (the brightness of the shadows)

---

### Usage with pixi-lights

This plugin can easily be used together with pixi-lights. Even more so, some structural choices were specifically made to support pixi-lights as this was the end goal.
Here you can find a [demo](https://tarvk.github.io/pixi-shadows/examples/pixi-lights/).

### Advanced demo

In order to see all things that can be done with pixi-shadows, please have a look at the following [demo](https://tarvk.github.io/pixi-shadows/examples/advanced/).
This demo can also be used to test performance (which is rather poor), and test how high numbers have to be crancked to achieve a desired effeect.

## Understanding how pixi-shadows work

As mentioned before, pixi-shadows can most likely be improved in terms of performance. For that reason I think it is important to explain how it currently works, such that more experienced people might be able to give feedback. It might also be handy for people that need to customise the plugin if it doesn't fit their needs exactly.

A [demo](https://tarvk.github.io/pixi-shadows/examples/system/) is provided to show various components of the process. I attempted to comment [pixi-shadows' source code](https://github.com/TarVK/pixi-shadows/tree/master/src/shadows) a little bit as well, so hopefully this in combination with the explanation below should be enough to understand how it operates. Additionally you can check [this detailed article](https://github.com/mattdesl/lwjgl-basics/wiki/2D-Pixel-Perfect-Shadows) I found (but didn't use directly) that seems to have a very similar approach.

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

- [Basic demo](https://tarvk.github.io/pixi-shadows/examples/basic/)
- [Advanced demo](https://tarvk.github.io/pixi-shadows/examples/advanced/)
- [Pixi-lights demo](https://tarvk.github.io/pixi-shadows/examples/pixi-lights/)
- [Process demo](https://tarvk.github.io/pixi-shadows/examples/system/)

## Using the development environment

### Setup

- Install [node.js](https://nodejs.org/en/)
- Run the following command in the root of the project

```
npm install
```

### Running demos (through which you can test the shadows)

```
npm run dev
```

This will start a development server that will live update as you save changes to the source code. you can choose which demo to work on in the main page.

### Building code


#### Build pixi-shadows itself

```
npm run build
```

## TODO

- Add more shadow types
  - spotlight shadow
  - directional shadow
- Improve performance
