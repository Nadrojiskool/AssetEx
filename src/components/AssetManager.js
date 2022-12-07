import '@pixi/sound';
import { Sound } from '@pixi/sound';
import 'pixi-spine';
import * as PIXI from 'pixi.js';
import { Texture } from 'pixi.js';
import { Resources } from 'react-i18next';

class PrerenderedDogsCache {

  _imageMap = {};

  getDogImageById(id) {
    if (this._imageMap[id] === undefined) {
      throw new Error(`There is no prerendered image for dog with id '${id}'`);
    }

    return this._imageMap[id];
  }

  addDogImage(dogId, imgPath) {
    if (this._imageMap[dogId]) {
      URL.revokeObjectURL(this._imageMap[dogId]);
    }

    this._imageMap[dogId] = imgPath;
  }

  getAllDogImages() {
    return Object.assign({}, this._imageMap);
  }
}

const withResolution = (str) => str.replace('@x', `@${PIXI.settings.RESOLUTION}x`);

const images = {
  
};

const sounds = {
  
};

class AssetManager {
  _loader = new PIXI.Loader();
  _bgLoader = new PIXI.Loader();
  _defaultLoader = new PIXI.Loader();

  _resourceQueue = [];
  _handledResources = [];

  prerenderdDogsCache = new PrerenderedDogsCache();
  soundsLoaded = false;
  imagesLoaded = false;

  queuedAssets = {};

  Sounds = sounds;

  ImagesAndSounds = {
    ...images,
    ...sounds
  }

  Images = {
    ...images
  }

  _dogImageList = {};


  // interruptLoading will only clear the queue and still continue loading what is currently loading, if  clearAll is set, it will interrupt current loading
  async load(assetsToLoad, cb, onProgress = null, interruptLoading = false, clearAll = false ) { 
    if(!assetsToLoad) {
      //console.log('no assets to load');
      return;
    }
    
    const isAlreadyQueued = this._resourceQueue.find((r) => {return r.resources === assetsToLoad});
    const isAlreadyHandled = this._handledResources.find((r) =>{return r.resources === assetsToLoad});
    if(isAlreadyQueued || isAlreadyHandled) {
      if(this._resourceQueue?.length === 0) {
        cb(this._loader, this._loader.resources);
      }
      return;
    }
    if(this._loader.loading || (!this.imagesLoaded)) {
        if(clearAll) {
          this._loader.reset();
        } else {
          if(interruptLoading) {
            this._resourceQueue=[];
          }
            this.addToQueue(assetsToLoad, cb, onProgress);
            return;
        }
    
      
    }
    this._loader.concurrency = 100;
    if (onProgress) {
      this._loader.onProgress.add(onProgress);
    }
    if (this._bgLoader.loading) {
      this._bgLoader.onComplete.detachAll();
      const keys = Object.keys(this._bgLoader.resources);
      for(let i = 0; i < keys.length; i++) {
        if(this._bgLoader.resources[keys[i]].isComplete) {
          if(!this._loader.resources[keys[i]]) {
            this._loader.resources[keys[i]] = this._bgLoader.resources[keys[i]];
          }
        }

      }
      
      this._bgLoader.reset();
    }
    for (const [key, value] of Object.entries(assetsToLoad)) {
      if(this.queuedAssets[value]) {
        continue;
      }

      if ((!this._loader.resources[value]) && (!this._loader.resources[key]) && !this._dogImageList[value] && !this._dogImageList[key]) {
        if (key.includes('dogAnimation')) {
          try {
            const texture = PIXI.BaseTexture.from(value);
            let spineLoaderOptions = { metadata: { 
              spineAtlasFile: '/static/playground/durodog_animation3.atlas',
              image: texture }};
              
              this._loader
              .add(key, '/static/playground/durodog_animation3.json', spineLoaderOptions)
          } catch(e) {
            console.log('err: ', e.message);
          }
          
            
        } else {
          this._loader.add(value, value);
        }
        this.queuedAssets[value] = value;
      } 
    }
    if(this._dogImageList) {
      this._dogImageList = Object.assign(this._dogImageList, assetsToLoad);
    }
    else {
      this._dogImageList = assetsToLoad;
    }
    const loaderCb = (_loader, res) => {
      if(res === this.ImagesAndSounds || res === sounds) {
        this.soundsLoaded = true;
      }
      if(res === this.Images || res  === this.ImagesAndSounds) {
        this.imagesLoaded = true;
      }
      this._handledResources.push({resources: assetsToLoad, onLoaded: cb, onProgress: onProgress });
      if( this._resourceQueue.length > 0) {
        const nextUp = this._resourceQueue.pop();
        this.load(nextUp.resources, nextUp.onLoaded, nextUp.onProgress);
        cb(this._loader, this._loader.resources, true);
      } else {
        cb(this._loader, this._loader.resources);
      }

    }
    this._loader.load(loaderCb);
  }
  

  loadDefault(assetsToLoad, cb, onProgress = null) {
    if(!assetsToLoad) {
      //console.log('no assets to load');
      return;
    }
    if(this._defaultLoader.loading) {
      return;
    }
    if((assetsToLoad === this.Images && this.imagesLoaded) || (assetsToLoad === this.Sounds && this.soundsLoaded)) {
      return;
    }
    if (onProgress) {
      this._defaultLoader.onProgress.add(onProgress);
    }
    const assetsList = []; // list of assets that are already added to loader to avoid duplicate resource loads
    for (const [key, value] of Object.entries(assetsToLoad)) {

       if ((!this._defaultLoader.resources[value]) && (!this._defaultLoader.resources[key] && (!this._loader.resources[key]) && (!this._loader.resources[value]))) {
         this._defaultLoader.add(value, value);
         assetsList.push(value);
       }
     }
    

    const loaderCb = (_loader, res) => {
      this.imagesLoaded = true;
      if(this._loader.resources) {
        Object.assign(this._loader.resources, this._defaultLoader.resources);
      } else {
        this._loader.resources = this._defaultLoader.resources;
      }

      if(this._dogImageList) {
        this._dogImageList = Object.assign(this._dogImageList, assetsToLoad);
      }
      else {
        this._dogImageList = assetsToLoad;
      }
      this._handledResources.push({resources: assetsToLoad, onLoaded: cb, onProgress: onProgress });
      if( this._resourceQueue.length > 0) {
        const nextUp = this._resourceQueue.pop();
        this.load(nextUp.resources, nextUp.onLoaded, nextUp.onProgress);
      } 
      cb(this._defaultLoader, this._defaultLoader.resources);
      
    }
    this._defaultLoader.load(loaderCb)
  }

  async addTextureURL(url) {
    if(this._loader.resources[url]) {
      return this._loader.resources[url].texture;
    }
    Object.assign(this._dogImageList, ({[url]: url}));
    let urlToLoad = url;
    const tex = await PIXI.Texture.fromURL(urlToLoad);
    Object.assign(this._loader.resources, {[url]: {texture: tex} });

    return tex;
  }


  loadBG(assetsToLoad, cb, onProgress = null) {
    if(assetsToLoad === this.ImagesAndSounds || assetsToLoad === sounds) {
      this.soundsLoaded = true;
    }
    if(!assetsToLoad) {
      // console.log('no assets to load');
      return;
    }
    if(this._bgLoader.loading) {
      return;
    }
    if (onProgress) {
      this._bgLoader.onProgress.add(onProgress);
    }
    this._bgLoader.concurrency = 100;
    const assetsList = {}; // list of assets that are already added to loader to avoid duplicate resource loads
    for (const [key, value] of Object.entries(assetsToLoad)) {

      if (!assetsList[key] && (!this._bgLoader.resources[value]) && (!this._bgLoader.resources[key] && (!this._loader.resources[key]) && (!this._loader.resources[value]))) {
        this._bgLoader.add(value, value);
        assetsList[value] = value;
      }
    }
    const loaderCb = (_loader, res) => {
        if(this._loader.resources) {
          Object.assign(this._loader.resources, this._bgLoader.resources);
        } else {
          this._loader.resources = this._bgLoader.resources;
        }

        if(this._dogImageList) {
          this._dogImageList = Object.assign(this._dogImageList, assetsToLoad);
        }
        else {
          this._dogImageList = assetsToLoad;
        }
        cb(this._loader, this._loader.resources);
    }
    this._bgLoader.load(loaderCb);
  }

  addToQueue(assetsToLoad, cb, onProgress = null)  {
    this._resourceQueue.push({resources: assetsToLoad, onLoaded: cb, onProgress: onProgress});
  }

  getItemOnDogPath(item) {
    if (item.pictureAnimation) {
      return item.pictureAnimation;
    }
    return item.picture.replace('items', 'items-atlas-images');
  }

  async getTextureFromItem(item) {
    let name = this.getItemOnDogPath(item);
    

    if(this._loader.resources[name]) {
      return (this._loader.resources[name].texture);
    } else {
      const tex = await Texture.fromURL(name);
      return tex;
    }
    
  }

  getTextureByName(name) {
    const textureName = this._dogImageList[name];
    if (this._loader.resources[textureName]) {
      return this._loader.resources[textureName].texture;
    }
    return undefined;
  }

  getAtlasByName(name) {
    const atlasName = this._dogImageList[name];
    if (this._loader.resources[atlasName]) {
      return this._loader.resources[atlasName];
    }
    console.warn(`Atlas with name: ${name} does not exist`);
  }

  getSoundByName(name) {
    const soundName = this._dogImageList[name];
    if (soundName && this._loader.resources[soundName]) {
      if(this._loader.resources[soundName]) {
        // @ts-expect-error
        return this._loader.resources[soundName].sound;
      } else {
        console.warn(`Sound data with name: ${name} does not exist`);
        return null;
      }

    }
    console.warn(`Sound with name: ${name} does not exist`);
  }

  /*get sounds() {
    return Object.entries(this._loader.resources)
      .reduce((acc, [key, value]) => {
        // @ts-expect-error
        if (value.sound) {
          // @ts-expect-error
          acc[key] = value.sound as Sound;
        }
        return acc;
      }, {});
  }*/

  get resources() {
    return this._loader.resources;
  }
}

const manager = new AssetManager();

export { manager as AssetManager }
