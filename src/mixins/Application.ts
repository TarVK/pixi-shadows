import '@pixi/ticker';

import { Application } from '@pixi/app';
import { ShadowFilter } from '../filters/ShadowFilter';
import { Stage } from '@pixi/layers';

export function augmentApplication(application: Application, shadowFilter: ShadowFilter) {
    // Replace the stage with a layered stage
    application.stage = new Stage();

    // Remove the current render function
    // eslint-disable-next-line @typescript-eslint/unbound-method
    application.ticker.remove(application.render, application);

    // Overwrite the render function
    application.render = function render(this: Application) {
        // Update stage transforms
        const cacheParent = this.stage.parent;
        // this.stage.parent = this.renderer._tempDisplayObjectParent;
        // this.stage.parent = this.stage._tempDisplayObjectParent;

        this.stage.parent = this.stage;
        this.stage.updateTransform();
        this.stage.parent = cacheParent;

        // Update the shadow filter
        shadowFilter.update(this.renderer);

        // Render the stage without updating the transforms again
        this.renderer.render(this.stage, { skipUpdateTransform: true });
    };

    // Reassign ticker because its setter initialises the render method
    // eslint-disable-next-line no-self-assign
    application.ticker = application.ticker;
}
