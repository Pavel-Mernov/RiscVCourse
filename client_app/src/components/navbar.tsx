import { AppBar, Toolbar, Button, Box } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();

  const [leftBtnIsEntered, setLeftBtnEntered] = useState(false)

  const [contestsBtnIsEntered, setContentBtnEntered] = useState(false)

  const [loginBtnIsEntered, setLoginBtnEntered] = useState(false)

  const { setAccessToken, isTokenValid } = useAuth()

  const logout = async () => {
    setAccessToken(undefined)

    /*
    const serverIp = '130.49.150.32'
    const url = `http://${serverIp}:3003/api/logout`
    const method = 'POST'
    

    await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
            
    })
      */
  }

  return (
    <AppBar 
        // position="static" 
        sx={{ bgcolor: 'blue', paddingInline : '40px', paddingBlock : '12px' }}
    >
      
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* Левая группа кнопок */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
          <Button
            onMouseEnter={() => setLeftBtnEntered(true)}
            onMouseLeave={() => setLeftBtnEntered(false)}
            onClick={() => navigate('/')}
            sx={{ 
              color: 'white', 
              textTransform: 'none', 
              transform: leftBtnIsEntered ? 'scale(1.04)' : 'scale(1)',
              gap: 1, 
              fontSize : '20px' 
            }}
            startIcon={
              <img
                src='/logo-no-background.png'
                alt="RISC-V Course"
                style={{ width: 60, height: 60 }}
              />
            }
          >
            RISC-V Course
          </Button>

          <Button
            onClick={() => navigate('/contests')}
            onMouseEnter={() => setContentBtnEntered(true)}
            onMouseLeave={() => setContentBtnEntered(false)}
            sx={{ 
              color: 'white', 
              textTransform: 'none', 
              fontSize : '20px', 
              transform: contestsBtnIsEntered ? 'scale(1.04)' : 'scale(1)',
            }}
          >
            Контесты
          </Button>
        </Box>

        {/* Правая кнопка */}
        {
          (!isTokenValid()) ?
            <Button
              onClick={() => {
                
                  navigate('/login')
              }}
              onMouseEnter={() => setLoginBtnEntered(true)}
              onMouseLeave={() => setLoginBtnEntered(false)}
              sx={{ color: 'white', 
                textTransform: 'none', 
                fontSize : '20px', 
                transform: loginBtnIsEntered ? 'scale(1.04)' : 'scale(1)',
              }}
            >
              Войти
            </Button>
            :
            <Button
              onClick={ logout }
              onMouseEnter={() => setLoginBtnEntered(true)}
              onMouseLeave={() => setLoginBtnEntered(false)}
              sx={{ color: 'white', 
                textTransform: 'none', 
                fontSize : '20px', 
                transform: loginBtnIsEntered ? 'scale(1.04)' : 'scale(1)',
              }}
            >
              Выйти
            </Button>
        }
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
