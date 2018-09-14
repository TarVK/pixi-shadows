import Shadow from "../Shadow";
export default function setup() {
    const orTransform = PIXI.Container.prototype.updateTransform;
    PIXI.Container.prototype.updateTransform = function() {
        if (
            this.shadowLayers ||
            this.isShadowCaster ||
            this.isShadowOverlay ||
            this instanceof Shadow
        ) {
            // Find all the filters that this container should be added to
            var filters =
                (this.shadowLayers &&
                    this.shadowLayers.map(layer => layer.shadowFilter)) ||
                PIXI.shadows.filters;
            if (this.isShadowCaster) this.shadowLayers;

            // Go through all retrieved filters
            filters.forEach(shadowFilter => {
                // Add this container to the correct set of objects (casters | overlays | shadows)
                if (this.isShadowCaster) {
                    shadowFilter._shadowCasterContainer.children.push(this);
                } else if (this.isShadowOverlay) {
                    shadowFilter._shadowOverlayContainer.children.push(this);
                } else if (this instanceof Shadow) {
                    shadowFilter._maskContainer.children.push(this);
                }

                // Make sure that the filter's existence is known so it will be updated
                if (PIXI.shadows.filterInstances.indexOf(shadowFilter) == -1)
                    PIXI.shadows.filterInstances.push(shadowFilter);
            });
        }

        return orTransform.apply(this, arguments);
    };

    const orRenderWebGL = PIXI.Container.prototype.renderWebGL;
    PIXI.Container.prototype.renderWebGL = function() {
        if (
            this.shadowLayers ||
            this.isShadowCaster ||
            this.isShadowOverlay ||
            this instanceof Shadow
        ) {
            // Don't render if it is called by the normal render function (renderStep is set in ShadowFilter.update)
            if (!this.renderStep) return;
        }

        return orRenderWebGL.apply(this, arguments);
    };
}
