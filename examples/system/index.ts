import './stats.d';

// Debug/demo imports
import * as dat from 'dat.gui';

import { AppLoaderPlugin, Shadow } from '../../src';
import { Application, Container, InteractionEvent, SCALE_MODES, Sprite, Texture } from 'pixi.js';

// Initialise the shadows plugin
Application.registerPlugin(AppLoaderPlugin);
/* The actual demo code: */

// Some general settings for the demo
const demoOptions = {
    followMouse: true,
    shadowX: 450,
    shadowY: 150,
};

// Create your application
const width = 800;
const height = 700;
const app = new Application({ width, height });

document.body.appendChild(app.view);

// Initialise the shadows plugin
const world = app.shadows.container;

app.shadows.filter.useShadowCasterAsOverlay = false; // Allows us to customise the overlays

// A function to combine different assets of your world object, but give them a common transform by using pixi-layers
// It is of course recommended to create a custom class for this, but this demo just shows the minimal steps required
function createShadowSprite(texture: Texture, shadowTexture: Texture, shadowOverlayTexture: Texture) {
    const container = new Container(); // This represents your final 'sprite'

    // Things that create shadows
    if (shadowTexture) {
        const shadowCastingSprite = new Sprite(shadowTexture);

        shadowCastingSprite.parentGroup = app.shadows.casterGroup;
        container.addChild(shadowCastingSprite);
    }

    // Things that are ontop of shadows
    if (shadowOverlayTexture) {
        const shadowOverlaySprite = new Sprite(shadowOverlayTexture);

        shadowOverlaySprite.parentGroup = app.shadows.overlayGroup;
        container.addChild(shadowOverlaySprite);
    }

    // The things themselves (their texture)
    const sprite = new Sprite(texture);

    container.addChild(sprite);

    return container;
}

// Can set ambientLight for the shadow filter, making the shadow less dark:
// app.shadows.filter.ambientLight = 0.4;

// Create a background (that doesn't cast shadows)
const bgTexture = Texture.from('../../assets/background.jpg');
const background = new Sprite(bgTexture);

world.addChild(background);

// Create some shadow casting demons
const demonTexture = Texture.from('../../assets/flameDemon.png');

demonTexture.baseTexture.scaleMode = SCALE_MODES.NEAREST; // For pixelated scaling

const demon1 = createShadowSprite(demonTexture, demonTexture, demonTexture);

demon1.position.set(100, 100);
demon1.scale.set(3);
world.addChild(demon1);

const demon2 = createShadowSprite(demonTexture, demonTexture, demonTexture);

demon2.position.set(500, 100);
demon2.scale.set(3);
world.addChild(demon2);

const demon3 = createShadowSprite(demonTexture, demonTexture, demonTexture);

demon3.position.set(300, 200);
demon3.scale.set(3);
world.addChild(demon3);

// Create a light that casts shadows
const shadow = new Shadow(300, 1, 5);

shadow.position.set(demoOptions.shadowX, demoOptions.shadowY);
world.addChild(shadow);

// Show shadow map
function showShadowMap() {
    const shadowMapSprite = shadow.shadowMapResultSprite;

    shadowMapSprite.x = 0;
    shadowMapSprite.y = 500;
    shadowMapSprite.width = 800;
    shadowMapSprite.height = 200;
    app.stage.addChild(shadowMapSprite);
}
showShadowMap();

// Make the light track your mouse
world.interactive = true;
world.on('mousemove', (event: InteractionEvent) => {
    if (demoOptions.followMouse) {
        shadow.position.copyFrom(event.data.global);
    } else {
        shadow.position.x = demoOptions.shadowX;
        shadow.position.y = demoOptions.shadowY;
    }
});

/* The debug debug/demo code */

// Add settings controls
const gui = new dat.GUI();

// Demo options
const demoGUI = gui.addFolder('Demo options');

demoGUI.open();
demoGUI.add(demoOptions, 'followMouse');
demoGUI.add(demoOptions, 'shadowX', 0, 800);
demoGUI.add(demoOptions, 'shadowY', 0, 600);

// Shadow properties
const shadowGUI = gui.addFolder('Shadow properties');

shadowGUI.open();
shadowGUI.add(shadow, 'range', 50, 1000);
shadowGUI.add(shadow, 'intensity', 0, 3);
shadowGUI.add(shadow, 'pointCount', 1, 50, 1).onChange(showShadowMap);
shadowGUI.add(shadow, 'scatterRange', 0, 50);
shadowGUI.add(shadow, 'radialResolution', 100, 1500, 1).onChange(showShadowMap);
shadowGUI.add(shadow, 'depthResolution', 0.1, 3);
shadowGUI.add(shadow, 'darkenOverlay');

// Show specific layers
const revealGUI = gui.addFolder('Analyze');

revealGUI.open();
const reveal: Record<string, boolean> = {};

reveal['show mask'] = false;
reveal['remove casters'] = false;
reveal['remove overlays'] = false;
revealGUI.add(reveal, 'show mask').onChange((value) => {
    if (value) app.stage.addChild(app.shadows.filter._maskResultSprite);
    else app.stage.removeChild(app.shadows.filter._maskResultSprite);
});
revealGUI.add(reveal, 'remove casters').onChange((value) => {
    app.shadows.filter._shadowCasterContainer.visible = !value;
});
revealGUI.add(reveal, 'remove overlays').onChange((value) => {
    app.shadows.filter._shadowOverlayContainer.visible = !value;
});
