import { RecordVoiceOver } from '@mui/icons-material';
import { Box } from '@mui/material';
import { useMediaQuery, useTheme } from '@mui/material';
import { Fragment, useEffect, useRef, useState } from 'react';
import DogErrorBoundary from 'src/components/DogErrorBoundary';
import ErrorBoundary from 'src/components/ErrorBoundary';
import LinearProgressWithLabel from 'src/components/LinearProgressWithLabel';
import { Dog } from 'src/types/dog';
import { AssetManager } from '../play/AssetManager';
import DuroDog, { DuroDogHandle } from '../DuroDog';
import PixiApp from '../PixiApp';

const FullDog = ({
    dogs,
    userItems,
    naked = false,
    horizontalMoved = 0,
    verticalMoved = 10,
    playRandomAnimations = true,
    onLoaded,
    onAllLoaded,
    zoomDog = 1,
    withSound = true,
    animationRef,
    dogHeightPercentage,
    unmountDogOnChange= true,
    onClick,
  }) => {
    const newRef = useRef();
    const durodogAnimationRef2 = useRef();
    const durodogAnimationRef3 = useRef();
    const durodogAnimationRef4 = useRef();
    const durodogAnimationRef5 = useRef();
    let durodogAnimationRef = animationRef?animationRef:newRef;
    const refs =[durodogAnimationRef, durodogAnimationRef2, durodogAnimationRef3, durodogAnimationRef4, durodogAnimationRef5];
    const theme = useTheme();
    const isMobileDevice = useMediaQuery(theme.breakpoints.down('sm'));
    const smallScreen = useMediaQuery(theme.breakpoints.down('lg'));
    const isSmallLandscape = (!isMobileDevice) && smallScreen;
    const isPortrait = useMediaQuery('(max-aspect-ratio: 1 / 1)');
    const [resourcesLoaded, setResourcesLoaded] = useState(false);
    const [progress, setProgress] = useState(0);
    const [parts, setParts] = useState(null);
    const [reload, setReload] = useState(false);
    const [dogColliders, setDogColliders] = useState([]);
    const [timeouts, setTimeouts] = useState([]);

 
    useEffect(()=>{
        setReload(false);
        // setResourcesLoaded(false);
        const aniPart = {}
       
        timeouts.forEach((timeout)=>{
            try {
                clearTimeout(timeout);
            } catch(e) {
                console.log('timeout clearing fail', e.message);
            }
        })
        try {
        dogs.forEach((dog, idx)=>{
        if(dog) {       
            aniPart['dogAnimation' + dog.number] = 'https://dog-pngs.s3.amazonaws.com/final2/dd_' + dog.number + '.png';
            dog.items?.forEach((item)=>{
                const dbItem = userItems.find((i)=> i._id === item._id && i.number === item.number);
                if(dbItem) {
                    const url = AssetManager.getItemOnDogPath(dbItem)
                    aniPart[dbItem.picture] = url;
                }
            })
        } 
        if(dogs && playRandomAnimations) {   
                const barkDelay = Math.random()*1000000+ 15000;
                const sleepDelay = Math.random()*400000+ 80000;
                const rollOverDelay = Math.random()*5000000 + 150000;
                const playDeadDelay = Math.random()*5000000 + 150000;
                const petDelay = Math.random()*1000000 + 13000;
                const shakeDelay = Math.random()*1000000 + 13000;
                
                let timeoutPlayDead = setTimeout(()=>{
                    refs[idx]?.current?.playAnimationSequence([
                    { name: 'Play Dead' },
                    { name: 'Idle', loop: true}
                  ]);}, playDeadDelay);
                  let timeoutPet = setTimeout(()=>{
                    refs[idx]?.current?.playAnimationSequence([
                    { name: 'Pet' },
                    { name: 'Idle', loop: true}
                  ]);}, petDelay);
                  let timeoutShake = setTimeout(()=>{
                    refs[idx]?.current?.playAnimationSequence([
                    { name: 'Shake' },
                    { name: 'Idle', loop: true}
                  ]);}, shakeDelay);
                  let timeoutRollOver = setTimeout(()=>{
                    refs[idx]?.current?.playAnimationSequence([
                    { name: 'Roll Over' },
                    { name: 'Idle', loop: true}
                  ]);}, rollOverDelay);
                let timeoutBark = setTimeout(()=>{
                    refs[idx]?.current?.playAnimationSequence([
                    { name: 'Speak' },
                    { name: 'Idle', loop: true}
                  ]);}, barkDelay);
                let timeoutSleep = setTimeout(()=>{
                    refs[idx]?.current?.playAnimationSequence([
                    { name: 'SleepStart' },
                    { name: 'Sleep', loop: true }
                  ]);}, sleepDelay);

                let startAni = setTimeout(()=>{
                    refs[idx]?.current?.playAnimationSequence([
                        { name: 'Play Dead' },
                        { name: 'Idle', loop: true }
                ])}, 80000+400*(dogs.length-idx+1))

                let startAni2 = setTimeout(()=>{
                    refs[idx]?.current?.playAnimationSequence([
                        { name: 'Speak' },
                        { name: 'Idle', loop: true }
                ])}, 3000+400*(dogs.length-idx+1))
                timeouts.push(timeoutPlayDead);
                timeouts.push(timeoutRollOver);
                timeouts.push(timeoutBark);
                timeouts.push(timeoutSleep);
                timeouts.push(startAni);
                timeouts.push(startAni2);
                timeouts.push(timeoutPet);
                timeouts.push(timeoutShake);

                  return ()=>{timeouts.forEach((timeout)=>{
                    clearTimeout(timeout);
                })};
            
        }
        });

        setParts(aniPart);
        } catch(e) {
            console.log('setting up random animations failed', e.message);
        }
    },[dogs]);

    useEffect(()=>{
        setReload(true);
    },[parts])

    /* useEffect(()=>{
        console.log('rleaod', reload);
    },[reload]) */

    function onProgress(progress) {
        setProgress(progress);
    }

    async function dogClicked(idx) {
        if(onClick[idx]) {
            onClick[idx]();
        }
    }

    return (<>
        
        <Box sx={{}}>{dogColliders.map((dogCollider, idx)=><Box key={'' + dogCollider.width + dogCollider.height + dogCollider.left + dogCollider.top} onClick={()=>{dogClicked(idx)}} sx={{zIndex: 3, width: dogCollider.width, height: dogCollider.height, left: dogCollider.left, top: dogCollider.top, position: 'absolute'}}></Box>)}</Box>
        <Box sx={{position: 'relative', width: '100%', height: '100%'}}>
        <DogErrorBoundary dogs={dogs} >
        {
            <>{dogs && dogs.length > 0 && dogs[0] && parts && (reload || !unmountDogOnChange) && <PixiApp
                    resourcesToLoad={parts}
                    backgroundResourcesToLoad={withSound?AssetManager.Sounds:undefined}
                    backgroundLoadingLabel='loading sounds'
                    onResourcesLoaded={() => {
                      //   console.log('resources loaded');
                        setResourcesLoaded(true);
                        if(onLoaded) {
                            onLoaded();
                        }
                    }}
                    onAllLoaded={()=>{
                     //    console.log('all loaded#);')
                        if(onAllLoaded) {
                            onAllLoaded();
                    }}}
                    onProgress={onProgress}
                    loadingLabel={dogs[0]?.dogName}
                >
                    {({ }) => (
                    <>
                    {resourcesLoaded && dogs.map((dog, idx)=> // having a key other than idx in this map breaks the spine loading
                        (!!dog?<DuroDog
                        parts={parts}
                        key={idx}
                        ref={refs[idx]}
                        equipedAccessories={naked?[]:dog?.items}
                        accessories={userItems}
                        playSleepAnimation={false}
                        verticalMoved={verticalMoved}
                        horizontalMoved={35-(35/dogs.length)-100*(0.7/dogs.length)*(idx)}
                        setDogCollider={onClick && onClick[idx]?((coll)=>{if(dogColliders.length >=1){dogColliders[idx] = coll;}else{dogColliders.push(coll);} setDogColliders([...dogColliders])}):undefined}
                        dogHeightPercentage={dogHeightPercentage}
                        number={parseInt(dog?.number)}
                    />:<></>)
                    )}


                    
                    </>
                    )}
            </PixiApp>}</>}
            </DogErrorBoundary>
            </Box>
            </>
            
    );

}

export default FullDog;