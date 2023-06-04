import './stats.d';

// Debug/demo imports
import * as dat from 'dat.gui';

import { ShadowsPlugin, Shadow } from 'pixi-shadows';
import { Application, extensions, Container, FederatedMouseEvent, SCALE_MODES, Sprite, Texture } from 'pixi.js';

import Stats from 'stats-js';
import backgroundUrl from '../../assets/background.jpg';
import flameDemon2Url from '../../assets/flameDemon2.png';
import flameDemonShadowUrl from '../../assets/flameDemonShadow.png';
import flameDemonUrl from '../../assets/flameDemon.png';

// Initialise the shadows plugin
extensions.add(ShadowsPlugin)
/* The actual demo code: */

// Some general settings for the demo
const demoOptions = {
    followMouse: false,
    shadowX: 450,
    shadowY: 150,
};

// Create your application
const width = 800;
const height = 500;
const app = new Application({ width, height });

document.body.appendChild(app.view);

// Create a world container
const world = app.shadows.container;

app.shadows.filter.useShadowCasterAsOverlay = false; // Allows us to customise the overlays

// A function to combine different assets of your world object, but give them a common transform by using pixi-layers
// It is of course recommended to create a custom class for this, but this demo just shows the minimal steps required
function createShadowSprite(texture: Texture, shadowTexture: Texture, shadowOverlayTexture?: Texture) {
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
// shadows.filter.ambientLight = 0.4;

// Create a light that casts shadows
const shadow = new Shadow(700, 1);

shadow.position.set(demoOptions.shadowX, demoOptions.shadowY);
world.addChild(shadow);

// Create a background (that doesn't cast shadows)
const bgTexture = Texture.from(backgroundUrl);
const background = new Sprite(bgTexture);

world.addChild(background);

// Create some shadow casting demons
const demonTexture = Texture.from(flameDemonUrl);
const demonShadowTexture = Texture.from(flameDemonShadowUrl);
const demonTexture2 = Texture.from(flameDemon2Url);

demonTexture.baseTexture.scaleMode = SCALE_MODES.NEAREST; // For pixelated scaling
demonShadowTexture.baseTexture.scaleMode = SCALE_MODES.NEAREST;
demonTexture2.baseTexture.scaleMode = SCALE_MODES.NEAREST;

const demon1 = createShadowSprite(demonTexture2, demonTexture2);

demon1.position.set(100, 100);
demon1.scale.set(3);
world.addChild(demon1);

const demon2 = createShadowSprite(demonTexture, demonShadowTexture, demonTexture);

demon2.position.set(500, 100);
demon2.scale.set(3);
world.addChild(demon2);

const demon3 = createShadowSprite(demonTexture2, demonTexture2, demonTexture2);

demon3.position.set(300, 200);
demon3.scale.set(3);
world.addChild(demon3);

// Make the light track your mouse
world.interactive = true;
world.on('mousemove', (event: FederatedMouseEvent) => {
    if (demoOptions.followMouse) {
        shadow.position.copyFrom(event.data.global);
    } else {
        shadow.position.x = demoOptions.shadowX;
        shadow.position.y = demoOptions.shadowY;
    }
});

// Create a light point on click
const shadows: Shadow[] = [];

world.on('pointerdown', (event: FederatedMouseEvent) => {
    const shadow2 = new Shadow(700, 0.7);

    shadows.push(shadow2);
    shadow2.position.copyFrom(event.data.global);
    world.addChild(shadow2);

    // Set the ignore shadow caster if enabled
    if (ignore['placed shadows']) shadow2.ignoreShadowCaster = demon1.children[0] as Sprite;
});

/* The debug debug/demo code */

// Add fps counter
const stats = new Stats();

stats.setMode(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.domElement);
stats.domElement.style.position = 'absolute';
stats.domElement.style.top = '0';
app.ticker.add(() => {
    stats.begin();
    stats.end();
});

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
shadowGUI.add(shadow, 'pointCount', 1, 50, 1);
shadowGUI.add(shadow, 'scatterRange', 0, 50);
shadowGUI.add(shadow, 'radialResolution', 100, 1500, 1);
shadowGUI.add(shadow, 'depthResolution', 0.1, 3);
shadowGUI.add(shadow, 'overlayLightLength', 10, 1000);
shadowGUI.add(shadow, 'fallOffFraction', 0, 1);
shadowGUI.add(shadow, 'darkenOverlay');

// Filter controls
const filter = app.shadows.filter;
const filterGUI = gui.addFolder('Filter properties');

filterGUI.open();
filterGUI.add(filter, 'width', 100, 1920, 1);
filterGUI.add(filter, 'height', 100, 1080, 1);
filterGUI.add(filter, 'ambientLight', 0, 1, 0.01);
filterGUI.add(filter, 'useShadowCasterAsOverlay');

// Ignore caster example
const ignoreCasterGUI = gui.addFolder('Ignore caster per shadow');
const ignore: Record<string, boolean> = {};

ignore['main shadow'] = false;
ignore['placed shadows'] = false;
ignoreCasterGUI.add(ignore, 'main shadow').onChange((value) => {
    if (value) shadow.ignoreShadowCaster = demon1.children[0] as Sprite;
    else shadow.ignoreShadowCaster = null;
});
ignoreCasterGUI.add(ignore, 'placed shadows').onChange((value) => {
    for (let i = 0; i < shadows.length; i++) {
        const shadow2 = shadows[i];

        if (value) shadow2.ignoreShadowCaster = demon1.children[0] as Sprite;
        else shadow2.ignoreShadowCaster = null;
    }
});

// Show specific layers
const revealGUI = gui.addFolder('Show layers (for debugging)');
const reveal = {
    textures: false,
    casters: false,
    overlays: false,
};

revealGUI.add(reveal, 'textures').onChange((value) => {
    if (value) world.filters = [];
    else world.filters = [app.shadows.filter];
});
revealGUI.add(reveal, 'casters').onChange((value) => {
    if (value) app.stage.addChild(app.shadows.filter._shadowCasterResultSprite);
    else app.stage.removeChild(app.shadows.filter._shadowCasterResultSprite);
});
revealGUI.add(reveal, 'overlays').onChange((value) => {
    if (value) app.stage.addChild(app.shadows.filter._shadowOverlayResultSprite);
    else app.stage.removeChild(app.shadows.filter._shadowOverlayResultSprite);
});
