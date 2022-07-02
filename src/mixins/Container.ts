import '@pixi/ticker';

import { Container } from '@pixi/display';
import { Group } from '@pixi/layers';
import { Shadow } from '../Shadow';
import { ShadowFilter } from '../filters/ShadowFilter';

export function augmentContainer(shadowCasterGroup: Group, shadowOverlayGroup: Group, shadowFilter: ShadowFilter) {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const orTransform: Container['updateTransform'] = Container.prototype.updateTransform;
    const ticks = new WeakMap<Container, number>();

    Container.prototype.updateTransform = function updateTransform(this: Container, ...args) {
        if (this.parentGroup === shadowCasterGroup) {
            if (ticks.get(this) !== shadowFilter.tick) shadowFilter._shadowCasterContainer.children.push(this);
            ticks.set(this, shadowFilter.tick);
        }

        if (this.parentGroup === shadowOverlayGroup) {
            if (ticks.get(this) !== shadowFilter.tick) shadowFilter._shadowOverlayContainer.children.push(this);
            ticks.set(this, shadowFilter.tick);
        }

        if (this instanceof Shadow) {
            if (ticks.get(this) !== shadowFilter.tick) shadowFilter._maskContainer.children.push(this);
            ticks.set(this, shadowFilter.tick);
        }

        return orTransform.apply(this, args) as ReturnType<Container['updateTransform']>;
    };
}
