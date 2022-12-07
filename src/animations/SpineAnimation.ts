
import { Spine } from 'pixi-spine';
import * as PIXI from 'pixi.js';
import { PixiComponent, applyDefaultProps } from '@inlet/react-pixi';

export interface SpineAnimationProps {
  app: PIXI.Application;
  resources: Record<string, PIXI.LoaderResource>;
  name: string;
  skinName?: string;
  scale?: number;
}

const SpineAnimation = PixiComponent('SpineAnimation', {

  create: ({resources, name, scale}:SpineAnimationProps) => {
    const spineData = resources[name].spineData;
    let spine = undefined;
    spine = new Spine(spineData);
    // spine.scale = scale?{x: scale, y: scale}:{x: 1, y: 1};
    return spine;
  },
  didMount: (instance, parent) => {
    // apply custom logic on mount
  },
  willUnmount: (instance, parent) => {
    // clean up before removal
  },
  applyProps: (instance, oldProps, newProps) => {
    // props changed
    // apply logic to the instance
    // instance.scale = {x: newProps.scale, y: newProps.scale}; // applyDisplayObjectProps(oldProps, newProps);
    // applyDefaultProps(instance, oldProps, newProps);
  },
  config: {
    // destroy instance on unmount?
    // default true
    destroy: true,

    /// destroy its children on unmount?
    // default true
    destroyChildren: false,
  },
  })



export default SpineAnimation;
