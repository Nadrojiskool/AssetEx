import Head from 'next/head';
import { useLink } from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Box, Button, Container, Grid } from '@mui/material';
import { useAuthContext } from '../contexts/auth-context';

const appId = "636b0c16b4d0e6825f9335b2";
const redirectionURL = 'https://app.handcash.io/#/authorizeApp?appId=' + appId;

const { HandCashConnect } = require('@handcash/handcash-connect');
const handCashConnect = new HandCashConnect({
  appId: String(process.env.ASSETX_HANDCASH_APPID),
  appSecret: String(process.env.ASSETX_HANDCASH_SECRET),
});

function checkForAuth(auth, router) {
  const { origin, pathname, search } = window.location;
  const params = new URLSearchParams(search);
  const authToken = params.get('authToken') 
    || window.localStorage.getItem('authToken') 
    || null;
  
  if (authToken) {
    window.localStorage.setItem('authToken', authToken);
    auth.signIn({ authToken });
    router.push(origin + '/dashboard');
  }
}

const Page = () => {
  const auth = useAuthContext();
  const router = useRouter();

  function checkAuth() { if (window) checkForAuth(auth, router); }
  function login() { window.location.href = redirectionURL; }

  useEffect(checkAuth, []);

  return (
    <>
      <Head>
        <title>
          Login | AssetX
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
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
              <Button sx={{ background: 'lightgreen' }} onClick={login}>Login with Handcash</Button>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default Page;
