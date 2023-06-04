import { AmbientLight, DirectionalLight, PointLight, diffuseGroup, lightGroup, normalGroup } from '@pixi/lights';
import { ShadowsPlugin, Shadow } from 'pixi-shadows';
import { Application, extensions, Container, FederatedMouseEvent, FederatedPointerEvent, Point, Sprite, Texture } from 'pixi.js';

import backgroundNormalMapUrl from '../../assets/backgroundNormalMap.jpg';
import backgroundUrl from '../../assets/background.jpg';
import cutBlockNormalMapUrl from '../../assets/cutBlockNormalMap.png';
import cutBlockUrl from '../../assets/cutBlock.png';

extensions.add(ShadowsPlugin)
/* The actual demo code: */

// Create your application
const width = 800;
const height = 500;
const app = new Application({ width, height, fov: { pixiLights: { diffuseGroup, lightGroup, normalGroup } } });

document.body.appendChild(app.view);

const world = app.shadows.container;

// A function to combine different assets of your world object, but give them a common transform by using pixi-layers
// It is of course recommended to create a custom class for this, but this demo just shows the minimal steps required
function create3DSprite(diffuseTex: Texture, normalTex: Texture, shadowTexture?: Texture) {
    const container = new Container(); // This represents your final 'sprite'

    const diffuseSprite = new Sprite(diffuseTex);

    diffuseSprite.parentGroup = diffuseGroup;
    container.addChild(diffuseSprite);

    const normalSprite = new Sprite(normalTex);

    normalSprite.parentGroup = normalGroup;
    container.addChild(normalSprite);

    if (shadowTexture) {
        // Only create a shadow casting object if a texture is provided
        const shadowCastingSprite = new Sprite(shadowTexture);

        shadowCastingSprite.parentGroup = app.shadows.casterGroup;
        container.addChild(shadowCastingSprite);
    }

    return container;
}
// A function to combine the pixi-lights and pixi-shadows, and give them a common transform as well
// Again, it is recommended to create a proper class for this in your application
function createLight(radius: number, intensity: number, color: number) {
    const container = new Container();

    const pixiLight = new PointLight(color, intensity);

    container.addChild(pixiLight);

    const shadow = new Shadow(radius, 0.7); // Radius in pixels

    container.addChild(shadow);

    return container;
}

// Create an ambient light
world.addChild(new AmbientLight(null, 1));
world.addChild(new DirectionalLight(null, 1, new Point(0, 1))); // pixi-shadows doesn't support directional shadows yet
// Can also set ambientLight for the shadow filter, making the shadow less dark:
// shadows.filter.ambientLight = 0.4;

// Create a light that casts shadows
const light = createLight(700, 4, 0xffffff);

light.position.set(300, 300);
world.addChild(light);

// Create a background (that doesn't cast shadows)
const bgDiffuseTexture = Texture.from(backgroundUrl);
const bgNormalTexture = Texture.from(backgroundNormalMapUrl);
const background = create3DSprite(bgDiffuseTexture, bgNormalTexture);

world.addChild(background);

// Create some shadow casting blocks
const blockDiffuse = Texture.from(cutBlockUrl);
const blockNormal = Texture.from(cutBlockNormalMapUrl);

const block1 = create3DSprite(blockDiffuse, blockNormal, blockDiffuse);

block1.position.set(100, 200);
world.addChild(block1);

const block2 = create3DSprite(blockDiffuse, blockNormal, blockDiffuse);

block2.position.set(500, 200);
world.addChild(block2);

const block3 = create3DSprite(blockDiffuse, blockNormal, blockDiffuse);

block3.position.set(300, 300);
world.addChild(block3);

// Make the light track your mouse
world.interactive = true;
world.on('mousemove', (event: FederatedMouseEvent) => {
    light.position.copyFrom(event.data.global);
});

// Create a light point on click
world.on('pointerdown', (event: FederatedPointerEvent) => {
    const light2 = createLight(450, 2, 0xffffff);

    light2.position.copyFrom(event.data.global);
    world.addChild(light2);
});
