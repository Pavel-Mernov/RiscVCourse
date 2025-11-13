import { AppBar, Toolbar, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <AppBar 
        // position="static" 
        sx={{ bgcolor: 'blue', paddingInline : '40px', paddingBlock : '12px' }}
    >
      
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* Левая группа кнопок */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
          <Button
            onClick={() => navigate('/')}
            sx={{ color: 'white', textTransform: 'none', gap: 1, fontSize : '20px' }}
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
            sx={{ color: 'white', textTransform: 'none', fontSize : '20px' }}
          >
            Контесты
          </Button>
        </Box>

        {/* Правая кнопка */}
        <Button
          onClick={() => navigate('/login')}
          sx={{ color: 'white', textTransform: 'none', fontSize : '20px' }}
        >
          Войти
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
