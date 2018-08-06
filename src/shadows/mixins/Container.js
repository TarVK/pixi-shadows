import Shadow from '../Shadow';
export default function setup(shadowCasterGroup, shadowOverlayGroup, shadowFilter){
    const orTransform = PIXI.Container.prototype.updateTransform;
    PIXI.Container.prototype.updateTransform = function(){

        if(this.parentGroup == shadowCasterGroup){
            if(this.tick != shadowFilter.tick)
                shadowFilter._shadowCasterContainer.children.push(this);
            this.tick = shadowFilter.tick;
        }

        if(this.parentGroup == shadowOverlayGroup){
            if(this.tick != shadowFilter.tick)
                shadowFilter._shadowOverlayContainer.children.push(this);
            this.tick = shadowFilter.tick;
        }
    
        if(this instanceof Shadow){
            if(this.tick != shadowFilter.tick)
                shadowFilter._maskContainer.children.push(this);
            this.tick = shadowFilter.tick;
        }
    
        return orTransform.apply(this, arguments);
    };
}