import { Stage } from '@pixi/layers';
export default function augment(application, shadowFilter){
    // Replace the stage with a layered stage
    application.stage = new Stage();

    // Remove the current render function
    application.ticker.remove(application.render, application); 

    // Overwrite the render function
    application.render = function(){
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
        this.renderer.render(this.stage, undefined, undefined, undefined, true);
    }

    // Reassign ticker because its setter initialises the render method
    application.ticker = application.ticker;
}
