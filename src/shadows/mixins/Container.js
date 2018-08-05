import Shadow from '../Shadow';
export default function setup(shadowObjectGroup, shadowFilter){
    const orTransform = PIXI.Container.prototype.updateTransform;
    PIXI.Container.prototype.updateTransform = function(){

        if(this.parentGroup == shadowObjectGroup){
            if(this.tick != shadowFilter.tick)
                shadowFilter._objectContainer.children.push(this);
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