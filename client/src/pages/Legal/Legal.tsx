import {Header} from "../../containers";
import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';


function Copyright() {
    return (
      <Typography variant="body2" color="text.secondary">
        {'Copyright © '}
        <Link color="inherit" href="https://mui.com/">
            pfa.c-saccoccio.fr/
        </Link>{' '}
        {new Date().getFullYear()}
        {'.'}
      </Typography>
    );
}

function StickyFooter() {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          backgroundColor:"#00A3E0",  
        }}
      >
        <CssBaseline />
        <Container component="main" sx={{ mt: 8, mb: 2 }} maxWidth="sm">
          <Typography variant="h2" component="h1" gutterBottom>
            Tableau Électrique Citoyen
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom>
            {'Projet réalisé en équipe de 7 dans le cadre de PFA à ENSEIRB-MATMECA en partenariat avec ENEDIS.'}
          </Typography>
          <Typography variant="body1">Équipe:Badre Iddine Agtaib-Faustin Boitel-Alexandre Choura-Theo Gomichon-Othmane Mansouri-Clement Saccoccio-Aymen Tilfani</Typography>
        </Container>
        <Box
          component="footer"
          sx={{
            py: 3,
            px: 2,
            mt: 'auto',
            backgroundColor:"#005EB8"  
          }}
        >
          <Container maxWidth="sm">
            <Typography variant="body1">
            </Typography>
            <Copyright />
          </Container>
        </Box>
      </Box>
    );
  }

function Legal() {
    return (
        <div>
            <Header title={'MENTIONS'} />
            <StickyFooter />
        </div>
    );
}

export default Legal;