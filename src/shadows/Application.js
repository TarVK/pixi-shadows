import ContainerSetup from "./mixins/Container"; // Can also be accessed through PIXI.shadows.__classes
import ShadowFilter from "./filters/ShadowFilter"; // Same here, and for all other classes

export default class Application extends PIXI.Application {
    constructor(options, arg2, arg3, arg4, arg5) {
        super(options, arg2, arg3, arg4, arg5);

        // Set up the container mixin so that it tells the filter about the available shadows and objects
        ContainerSetup();
    }

    setupBasicShadows(container) {
        // If no container is passed, use the stage
        if (!container) container = this.stage;

        // Create a filter, and apply it to the whole stage (requires a black background)
        var shadowFilter = new ShadowFilter(
            this.renderer.width,
            this.renderer.height
        );

        if (!PIXI.shadows.filters) PIXI.shadows.filters = [];
        PIXI.shadows.filters.push(shadowFilter);
        container.filters = [shadowFilter];

        //  Also store it on the stage for easy access
        container.shadowFilter = shadowFilter;
    }

    render() {
        // Update stage transforms
        const cacheParent = this.stage.parent;
        this.stage.parent = this.renderer._tempDisplayObjectParent;
        this.stage.updateTransform();
        this.stage.parent = cacheParent;

        // Update the shadow filter
        PIXI.shadows.filterInstances.forEach(shadowFilter => {
            shadowFilter.update(this.renderer);
        });
        PIXI.shadows.filterInstances = [];

        // Render the stage without updating the transforms again
        this.renderer.render(this.stage, undefined, undefined, undefined, true);
    }
}
