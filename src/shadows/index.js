import ContainerSetup from "./mixins/Container";
import Application from "./Application";
import ShadowFilter from "./filters/ShadowFilter";
import ShadowMapFilter from "./filters/ShadowMapFilter";
import ShadowMaskFilter from "./filters/ShadowMaskFilter";
import FilterFuncs from "./filters/FilterFuncs";
import Shadow from "./Shadow";

PIXI.shadows = {
    Application,
    Shadow,
    ShadowFilter,
    filterInstances: [], // The list of filters that need to be updated
    filters: [], // A list of filters to apply if no shadowLayers is specified

    // Making all classes available for if you want to augmnent this code without going into the source and properly building things afterwards
    __classes: {
        ContainerSetup,
        Application,
        ShadowFilter,
        ShadowMapFilter,
        ShadowMaskFilter,
        FilterFuncs,
        Shadow
    }
};
export default PIXI.shadows;
