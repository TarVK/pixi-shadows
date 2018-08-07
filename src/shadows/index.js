import ContainerSetup from './mixins/Container';
import ApplicationSetup from './mixins/Application';
import ShadowFilter from './filters/ShadowFilter';
import ShadowMapFilter from './filters/ShadowMapFilter';
import ShadowMaskFilter from './filters/ShadowMaskFilter';
import FilterFuncs from './filters/FilterFuncs';
import Shadow from './Shadow';

PIXI.shadows = {
    init: function(application){
        // The objects that will cast shadows
        this.shadowCasterGroup = new PIXI.display.Group();
        this.shadowCasterLayer = new PIXI.display.Layer(this.shadowCasterGroup);

        // The objects that will remain ontop of the shadows
        this.shadowOverlayGroup = new PIXI.display.Group();
        this.shadowOverlayLayer = new PIXI.display.Layer(this.shadowOverlayGroup);

        // Make sure the caster objects aren't actually visible
        this.shadowCasterLayer.renderWebGL = function(){}; 
        this.shadowOverlayLayer.renderWebGL = function(){}; 

        // Create the shadow filter
        this.shadowFilter = new ShadowFilter(application.renderer.width, application.renderer.height);

        // Set up the container mixin so that it tells the filter about the available shadows and objects
        ContainerSetup(this.shadowCasterGroup, this.shadowOverlayGroup, this.shadowFilter);

        // Overwrite the application render method
        ApplicationSetup(application, this.shadowFilter);
    },
    Shadow,

    // Making all classes available for if you want to augmnent this code without going into the source and properly building things afterwards
    __classes: {
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