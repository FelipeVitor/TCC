import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import Home from '../Home/Home';
import { TextField, Button, IconButton, InputAdornment } from '@mui/material'; // Importando TextField e Button do MUI
import { Visibility, VisibilityOff } from '@mui/icons-material';
import Cart from '../Cart/Cart'


function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Hook para redirecionamento
  const [showPassword, setShowPassword] = useState(false);
  // Função para alternar a visibilidade da senha
  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };


  const handleLogin = async () => {
    try {
      const response = await fetch('http://0.0.0.0:9000/autenticacao/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          senha: password,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro no login, por favor verifique suas credenciais');
      }

      const data = await response.json();
      const token = data.access_token;

      // Armazenar o token no localStorage e redirecionar para a página principal
      localStorage.setItem('token', token);
      setError(null); // Limpa o erro se o login foi bem-sucedido
      navigate('/home'); // Redireciona para a página principal
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Routes>
      {/* Rota da tela de login */}
      <Route
        path="/"
        element={
          <div className="App">
            <h1>Login Livraria Virtual</h1>
            <div className="login-form">
              <TextField
                label="Email"
                type="email"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                margin="normal"
                InputProps={{
                  // Adiciona o botão de ícone no campo de senha
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={toggleShowPassword} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                variant="contained"
                color="primary"
                onClick={handleLogin}
                fullWidth
              >
                Login
              </Button>
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
          </div>
        }
      />

      {/* Rota da página principal */}
      <Route path="/home" element={<Home />} />

      {/* Rota para a tela do carrinho */}
      <Route path="/cart" element={<Cart />} />
    </Routes>
  );
}

export default App;
