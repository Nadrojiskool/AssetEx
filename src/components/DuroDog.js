import * as PIXI from 'pixi.js';
import { Spine } from 'pixi-spine';
import { forwardRef, useContext, useEffect, useImperativeHandle, useRef } from 'react';
import SpineAnimation, { SpineAnimationProps } from 'src/animations/SpineAnimation';
import { Activity, ActivityTypes } from 'src/types/activities';
import useCanvasResize from '../useCanvasResize';
import { AssetManager } from '../AssetManager';
import { useApp, Container, Sprite } from '@inlet/react-pixi';

const MIX_DURATION = 0.5;

// TODO: need to use correct animations
const activitiesToAnimationsMap = {
  Pet: 'durodog_pet_1',
  Lay: 'durodog_lay_1',
  Stand: 'durodog_idle_2',
  Shake: 'durodog_shake',
  Dig: 'durodog_dig',
  Feed: 'durodog_eat',
  Idle: 'durodog_idle_1',
  Sleep: 'durodog_sleep_idle',
  SleepStart: 'durodog_sleep_start',
  SleepEnd: 'durodog_sleep_end',
  Beg: 'durodog_beg_1',
  Speak: 'durodog_bark_1',
  'Level Up': 'durodog_level_up',
  'Roll Over': 'durodog_roll',
  'Play Dead': 'durodog_dead_1'
}

const idleAnimationName = activitiesToAnimationsMap['Idle'];

function findAnimationByActivity(activity) {
  if (activity.type === 'feed') {
    return activitiesToAnimationsMap['Feed'];
  }

  if (activity.type === 'dig') {
    return activitiesToAnimationsMap['Dig'];
  }

  if (activity.type === 'play') {
    return activitiesToAnimationsMap[activity.data.name]
  }

  throw new Error(`No animation found for selected activity.'${activity.type}: ${activity.data.name}'`)
}

const DuroDog = forwardRef((props, ref) => {
  const { accessories, parts, equipedAccessories, playIdleAnimation = true, playSleepAnimation = false, verticalMoved = 12, horizontalMoved= 0, dogHeightPercentage, setDogCollider, number} = props;
  const app = useApp();
  const resources = AssetManager.resources;
  const spineRef = useRef();
  let gameSize = {width: app.view.clientWidth, height: app.view.clientHeight};//useCanvasResize(app);

  function handleGameResize() {
    gameSize = {width: app.view.clientWidth, height: app.view.clientHeight};
    const spine = spineRef?.current;
    if (spine && gameSize.width > 0 && gameSize.height > 0) {
      const aspectRatio = spine.height / spine.width;
      if(dogHeightPercentage) {
        spine.height = gameSize.height*(dogHeightPercentage / 0.8);
        spine.width = spine.height / aspectRatio;
      }
      spine.x = gameSize.width / 2 - gameSize.width * (horizontalMoved / 100);
      spine.y = gameSize.height - gameSize.height * (verticalMoved / 100);
      if(setDogCollider) {
        setDogCollider({width: spine.width*0.75, height: spine.height*0.8, left: spine.x-(spine.width*0.75)/2,top: spine.y-(spine.height*0.8)});
      }

    }
  }


  

  useEffect(() => {
    // applyBodyParts(parts);
  }, [parts]);

  function changingItems(equipedItems) {
    const spine = spineRef?.current;
    if(!spine) {
      console.log('spine not ready');
      return;
    }
    if (accessories && accessories.length > 0) { // no need to run this if user has no items, would cause problems if saved picture are created while accessories not loaded yet.
      spine.hackTextureBySlotName('hat', PIXI.Texture.EMPTY);
      spine.hackTextureBySlotName('collar', PIXI.Texture.EMPTY);
      spine.hackTextureBySlotName('glasses', PIXI.Texture.EMPTY);
      /*if(!itemTextures) {
        itemTextures = AssetManager.getAtlasByName('cosmetics.0')?.textures;
        for(let i = 0; i < 16; i++) {
          const atlasName = `cosmetics.${i}`;
          itemTextures = {...itemTextures, ...AssetManager.getAtlasByName(atlasName)?.textures};
        }
      }*/
      if(equipedItems && equipedItems.length > 0) {
        for (const { _id, bodyPart, number } of equipedItems) {
          const item = accessories?.find(item => item._id === _id && item.number === number);
          if (item) {
            let texture = AssetManager.getTextureByName(item.picture);
            /* if(!texture) {
              texture = await AssetManager.addTextureURL(item.picture);
            } */
            if (texture) {
              const slot = spine.slotContainers[spine.skeleton.findSlotIndex(bodyPart.toLowerCase())];
              spine.hackTextureBySlotName(bodyPart.toLowerCase(), texture);
            } else {
              console.error(`Texture with name '${item.picture}' does not exist`);
            }
          }
        }
      }
    }
  }

  useEffect(() => {
    if(accessories && accessories.length > 0 && equipedAccessories !== null) {
      changingItems(equipedAccessories);
    }
  }, [equipedAccessories, accessories]); // eslint-disable-line

  useImperativeHandle(
    ref,
    () => {
      const spine = spineRef.current;


      function drawDogToCanvas(ctx, resizeCanvas = false, equippedItems = null) {
        // hack for polaroid feature. Due to tail animation pixi container gets offset which results in dog
        // being off center. Before generating texture, hide tail texture, and then show it again when dog texture
        // is ready.
        if(!spine) {
          return;
        }
        handleGameResize();
        changingItems(equippedItems);
        const tailSprite = spine.children.find(container => {
          //@ts-expect-error
          if (container && container.children.length > 0) {
            //@ts-expect-error
            const spineMesh = container.children[0];
            if (spineMesh?.attachment?.name === 'Tail_0') {
              return true;
            }
          }

          return false;
        });

        // hide tail
        if (tailSprite) {
          tailSprite.renderable = false;
          tailSprite.parent.updateTransform();
        }

        const texture = app.renderer.generateTexture(spine);
        const pixelData = app.renderer.plugins.extract.pixels(texture);

        // show tail
        if (tailSprite) {
          tailSprite.renderable = true;
          tailSprite.parent.updateTransform();
        }

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = texture.width;
        tempCanvas.height = texture.height;
        const tempCtx = tempCanvas.getContext('2d');
        const imageData = tempCtx.createImageData(texture.width, texture.height);
        imageData.data.set(pixelData);
        if(resizeCanvas) {
          ctx.canvas.width = texture.width < texture.height?texture.width:texture.height;
          ctx.canvas.height = texture.width < texture.height?texture.width:texture.height;
          ctx.putImageData(imageData, 0, -texture.height*0.1);
        } else {
          ctx.putImageData(imageData, -38, -40);
        }



      }

      function setNewSlotImage(slotName, texture) {
        const spine = spineRef?.current;
        if(texture.baseTexture) {
          spine.hackTextureBySlotName(slotName, texture);
        } else {
          const baseTex = new PIXI.BaseTexture(texture);
          const tex = new PIXI.Texture(baseTex);
          spine.hackTextureBySlotName(slotName, tex);
        }
      }

      function getSlotSize(slotName) {
        const spine = spineRef?.current;
        const slot = spine.slotContainers[spine.skeleton.findSlotIndex(slotName)];
        const attachment = slot.children[0].attachment;
        return {width: attachment.width, height: attachment.height};
      }

      function setOffset(slotName, offset, zoom = 1) {
        const spine = spineRef?.current;
        const slot = spine.slotContainers[spine.skeleton.findSlotIndex(slotName)];

        const newTex = AssetManager.getTextureByName(slot.children[0]._texture.textureCacheIds[0]);
        newTex.trim = new PIXI.Rectangle(offset.x, offset.y, newTex.width*zoom, newTex.height*zoom);
        spine.hackTextureBySlotName(slotName, newTex);
        spine.skeleton.setSlotsToSetupPose();
      }

      function playAnimation(name) {

        if (name && spine.state.hasAnimation(name)) {
          const entry1 = spine.state.setAnimation(0, name, false);
          entry1.mixDuration = MIX_DURATION;
          spine.state.addAnimation(0, idleAnimationName, true, 0);
        }
      }

      function playAnimationSequence(animations) {
        animations.forEach(({ activity, name, onEnd, loop = false }, i) => {
          const animationName = activity ? findAnimationByActivity(activity) : activitiesToAnimationsMap[name];

          if (!spine.state.hasAnimation(animationName)) {
            return;
          }

          const entry = i === 0
            ? spine.state.setAnimation(0, animationName, loop)
            : spine.state.addAnimation(0, animationName, loop, 0);

          if (activity && activity.type === ActivityTypes.Feed) {
            for(let bowls = 0; bowls <= 5; bowls++) {
              const attachment = spine.skeleton.getAttachmentByName(`Bowl_0`, `Bowl_0`);
              
              if (attachment) {
                const texture = AssetManager.getTextureByName(activity.data.name + '1');
                const success = spine.hackTextureAttachment(`Bowl_0`, 'Bowl_0', texture, texture.orig);

                if (!success) {
                  //console.log('not successful');
                  attachment.region.texture = texture;
                  attachment.region.size = texture?.orig;
                }

              }
            }

            entry.listener = { end: () => {
              if (onEnd) {
                onEnd();
              }

              spine.hackTextureAttachment('Bowl_0', 'Bowl_0', PIXI.Texture.EMPTY, PIXI.Texture.EMPTY.orig);
            }};


            return;
          }

          if (onEnd) {
            entry.listener = { end: onEnd }
            entry.mixDuration = MIX_DURATION;
          }
        });
      }
      if(playSleepAnimation) {
        playAnimationSequence(
          [
            { name: 'SleepStart'},
            { name: 'Sleep', loop: true},
          ]);
      } else if (playIdleAnimation) {
        playAnimation(activitiesToAnimationsMap['Idle']);
      }

      return { playAnimationSequence, drawDogToCanvas, setOffset, getSlotSize, setNewSlotImage };
    },
    []
  )

  useEffect(() => {
    handleGameResize();
  }, [app.view.clientWidth, app.view.clientHeight]); // eslint-disable-line


  return (
    <>
    <SpineAnimation
      {...props}
      name={"dogAnimation" + number}
      resources={resources}
      app={app}
      ref={spineRef}
    />
    </>
  )
});

export default DuroDog;
