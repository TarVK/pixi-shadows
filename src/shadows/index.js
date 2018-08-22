import ContainerSetup from "./mixins/Container";
import ApplicationSetup from "./mixins/Application";
import ShadowFilter from "./filters/ShadowFilter";
import ShadowMapFilter from "./filters/ShadowMapFilter";
import ShadowMaskFilter from "./filters/ShadowMaskFilter";
import FilterFuncs from "./filters/FilterFuncs";
import Shadow from "./Shadow";

PIXI.shadows = {
  init: function(application) {
    // The objects that will cast shadows
    this.casterGroup = new PIXI.display.Group();
    this.casterLayer = new PIXI.display.Layer(this.casterGroup);

    // The objects that will remain ontop of the shadows
    this.overlayGroup = new PIXI.display.Group();
    this.overlayLayer = new PIXI.display.Layer(this.overlayGroup);

    // Make sure the caster objects aren't actually visible
    this.casterLayer.renderWebGL = function() {};
    this.overlayLayer.renderWebGL = function() {};

    // Create the shadow filter
    this.filter = new ShadowFilter(
      application.renderer.width,
      application.renderer.height
    );

    // Set up the container mixin so that it tells the filter about the available shadows and objects
    ContainerSetup(this.casterGroup, this.overlayGroup, this.filter);

    // Overwrite the application render method
    ApplicationSetup(application, this.filter);

    // If a container is specified, set up the filter
    var container = new PIXI.Container();
    application.stage.addChild(container);

    // Set up the shadow layers
    application.stage.addChild(this.casterLayer, this.overlayLayer);

    // Set up pixi lights if available
    if (PIXI.lights) {
      // Set up pixi-light's layers
      this.diffuseLayer = new PIXI.display.Layer(PIXI.lights.diffuseGroup);
      this.normalLayer = new PIXI.display.Layer(PIXI.lights.normalGroup);
      this.lightLayer = new PIXI.display.Layer(PIXI.lights.lightGroup);
      var diffuseBlackSprite = new PIXI.Sprite(
        this.diffuseLayer.getRenderTexture()
      );
      diffuseBlackSprite.tint = 0;

      application.stage.addChild(
        this.diffuseLayer,
        diffuseBlackSprite,
        this.normalLayer,
        this.lightLayer
      );

      // Add the shadow filter to the diffuse layer
      this.diffuseLayer.filters = [this.filter];
    } else {
      // Add the shadow filter to the container
      container.filters = [this.filter];
    }

    // Rreturn the container to use
    return container;
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
    Shadow
  }
};
export default PIXI.shadows;
