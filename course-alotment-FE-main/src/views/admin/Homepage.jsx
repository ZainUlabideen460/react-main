import React, { useEffect } from 'react';
import {
  Box,
} from '@chakra-ui/react';

import { Navbar } from './Homepage/Navbar';
import { Herosection } from './Homepage/Herosection';
import { Footer } from './Homepage/Footer';
import { Teamsection } from './Homepage/Teamsection';
import { StarsAndFeature } from './Homepage/StarsAndFeature';
import { UserGroup } from './Homepage/UserGroup';


const fontImport = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap');
`;



export default function Homepage() {
  useEffect(() => {
    // Add font import to document
    const style = document.createElement('style');
    style.innerHTML = fontImport;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);


  return (
    <Box fontFamily="'Inter', sans-serif" bg="gray.50">
     
      <Navbar/>
      <Herosection/>
      <StarsAndFeature/>
      <UserGroup/>

     

    
<Teamsection/>
     
      <Footer/>
    </Box>
  );
}