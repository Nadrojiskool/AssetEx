import Head from 'next/head';
import { useRef } from 'react';
import { Box, Button, Container, Grid } from '@mui/material';
import { SpineContent } from '../components/spine-content';

const Page = () => {

  return (
    <>
      <Head>
        <title>
          Spine | AssetX
        </title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8
        }}
      >
        <Container maxWidth={false}>
          <SpineContent/>
        </Container>
      </Box>
    </>
  );
};

export default Page;
