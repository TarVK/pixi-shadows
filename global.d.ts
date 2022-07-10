declare namespace GlobalMixins {
    interface Application {
        shadows: import('pixi-shadows').Shadows;
    }
    export interface IApplicationOptions {
        fov?: import('pixi-shadows').ShadowsOptions;
    }
}
