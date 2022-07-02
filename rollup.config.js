import { main } from '@pixi-build-tools/rollup-configurator/main';

const config = main({
    // external: [
    //     '@pixi/app',
    //     '@pixi/constants',
    //     '@pixi/core',
    //     '@pixi/display',
    //     '@pixi/layers',
    //     '@pixi/math',
    //     '@pixi/sprite',
    //     '@pixi/ticker',
    // ],
    globals: {
        '@pixi/layers': 'PIXI.display',
    },
});

export default config;
