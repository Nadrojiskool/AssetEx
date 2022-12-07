import React, { useRef, useEffect, useState, useContext } from 'react';
import * as PIXI from 'pixi.js';
import { LoaderResource } from 'pixi.js';
import { Box, BoxProps, useMediaQuery, useTheme } from '@mui/material';
import { AssetManager } from '../AssetManager';
import { keyframes } from '@mui/styled-engine';
import LinearProgressWithLabel from 'src/components/LinearProgressWithLabel';
import useMounted from 'src/hooks/useMounted';
import { Stage } from '@inlet/react-pixi';
import { Dog } from 'src/types/dog';

const k = () => {};

const PixiApp = ({
  children,
  visible = true,
  resourcesToLoad = AssetManager.Images,
  backgroundResourcesToLoad,
  onAllLoaded,
  onProgress, 
  loadingLabel,
  backgroundLoadingLabel,
  onBackgroundProgress,
  onResourcesLoaded = k,
  }
) => {
  const [resources, setResources] = useState(null);
  const canvasWrapperRef = useRef();
  const viewRef = useRef();
  const [progress, setProgress] = useState(0);
  const [progressDefault, setProgressDefault] = useState(0);
  const [progressAll, setProgressAll] = useState(0);
  const [loadingLabels, setLoadingLabels] = useState([]);

  const theme = useTheme();
  const isMobileDevice = useMediaQuery(theme.breakpoints.down('sm'));
  const mounted = useMounted();

  function handleProgress(loader, resources) {
    if(mounted.current) {
      setProgress(loader.progress);
      if(onProgress) {
        onProgress(loader.progress);
      }
    }
  }
  function handleAllProgress(loader, resources) {
    if(mounted.current) {
      setProgressAll(loader.progress);
      if(onBackgroundProgress) {
        onBackgroundProgress(loader.progress);
      }
    }
  }

  function handleAssetsLoaded(_loader, res, moreToLoad = null) {
    if(mounted.current) {
      if(moreToLoad) {
        loadingLabels.splice(0, 1);
        return;
      }
        setResources(res);
        onResourcesLoaded();
        setLoadingLabels([]);
        if(backgroundResourcesToLoad) {
          AssetManager.loadBG(backgroundResourcesToLoad, handleAllLoaded, handleAllProgress);
        }
    }
  }

  function handleAllLoaded(_loader, res) {
    if( mounted.current) {
        if(resources) {
          setResources(Object.assign(resources, res));
        } else {
          setResources(res);
        }
          onAllLoaded();
          
      }
  }

  function handleDefaultsLoaded(_loader, res) {
  }

  function handleProgressDefault(_loader, res) {
    if(mounted.current) {
      setProgressDefault(_loader.progress);
    }
  }

  useEffect(() => {
    try {
      setProgress(0);
      setResources(null);

        if(!AssetManager.imagesLoaded) {
          console.log('loading defaults');
          AssetManager.loadDefault(AssetManager.Images, handleDefaultsLoaded, handleProgressDefault);
        }
        if (resourcesToLoad && Object.keys(resourcesToLoad).length > 0) {
            AssetManager.load(resourcesToLoad, handleAssetsLoaded, handleProgress, true, false);
        } 
      }
    catch(e) {
      console.error(e);
    }
  }, [resourcesToLoad]); // eslint-disable-line

  useEffect(()=>{
    if(loadingLabel && loadingLabel !== '') {
      loadingLabels.push(loadingLabel);
    }
  }, [loadingLabel])

  return (
    <React.Fragment>
            <div
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          display: visible ? 'block' : 'none'
        }}
        ref={canvasWrapperRef}
      >
      {(progressAll > 0 && progressAll < 99.9) && <Box sx={{position: 'absolute',right: '3rem', top: isMobileDevice?'5rem':'3rem', opacity: 0.3, width: '20%'}}><LinearProgressWithLabel value={progressAll} topLabel={backgroundLoadingLabel?backgroundLoadingLabel:'all dogs'} /></Box>}
      {(progressDefault > 0 && progressDefault < 99.9) && <Box sx={{position: 'absolute',left: isMobileDevice?'17%':'35%', top: isMobileDevice?'30%':'50%', width: isMobileDevice?'66%':'30%'}}><LinearProgressWithLabel value={progressDefault} topLabel={'loading animation'} /></Box>}
      {(progress > 0 && progress < 99.9) && <Box sx={{position: 'absolute',left: isMobileDevice?'17%':'35%', top: isMobileDevice?'30%':'50%', width: isMobileDevice?'66%':'30%'}}><LinearProgressWithLabel value={progress} topLabel={'loading Dogs: ' + (loadingLabels.length > 0?loadingLabels[0]: '')} /></Box>}
      <Stage renderOnComponentChange={true} width={canvasWrapperRef.current?.clientWidth?canvasWrapperRef.current.clientWidth:800} height={canvasWrapperRef.current?.clientHeight?canvasWrapperRef.current.clientHeight:800} options={{backgroundAlpha: 0 }}  >

        {
          resources
            ? children({ resources })
            : null
        }
      </Stage>
      </div>
    </React.Fragment>
  )
}

export default PixiApp;
