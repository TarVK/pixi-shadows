import 'pixi.js';
import 'pixi-layers';

import ContainerSetup from './mixins/Container';
import ApplicationSetup from './mixins/Application';
import ShadowFilter from './filters/ShadowFilter';
import ShadowMapFilter from './filters/ShadowMapFilter';
import ShadowMaskFilter from './filters/ShadowMaskFilter';
import FilterFuncs from './filters/FilterFuncs';
import Shadow from './Shadow';

PIXI.shadows = {
    init: function(application){
        this.objectGroup = new PIXI.display.Group();
        this.objectLayer = new PIXI.display.Layer(this.objectGroup);

        // Make sure the collider objects aren't actually visible
        this.objectLayer.renderWebGL = function(){}; 

        // Create the shadow filter
        this.shadowFilter = new ShadowFilter(application.renderer.width, application.renderer.height);

        // Set up the container mixin so that it tells the filter about the available shadows and objects
        ContainerSetup(this.objectGroup, this.shadowFilter);

        // Overwrite the application render method
        ApplicationSetup(application, this.shadowFilter);
    },
    Shadow,

    // Making all classes available just for if you want to augmnent this code without going into the source and properly building things afterwards
    __clases: {
        ContainerSetup,
        ApplicationSetup,
        ShadowFilter,
        ShadowMapFilter,
        ShadowMaskFilter,
        FilterFuncs,
        Shadow,
    }
};
export default PIXI.shadows;