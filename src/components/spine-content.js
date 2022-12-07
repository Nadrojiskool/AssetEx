import { useRef, useState } from 'react';
import FullDog from './FullDog';

export const SpineContent = (props) => {
  const [dog, setDog] = useState(null);
  const [item, setItem] = useState(null);
  const dogRef = useRef();

  return (<>
    <FullDog dogs={[dog]} verticalMoved={17.5} unmountDogOnChange={false} withSound={false} dogHeightPercentage={0.65} horizontalMoved={0} animationRef={dogRef}
      onLoaded={()=>{}} userItems={[item]} naked={false} playRandomAnimations={false}/>
  </>);
};
