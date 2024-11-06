import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Avatar, Menu, MenuItem, IconButton, Container, } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle'; // Ícone de perfil
import { useNavigate, Link } from 'react-router-dom';

function Callcenter() {

    const [anchorEl, setAnchorEl] = useState(null); // Estado para controlar o submenu do perfil
    const navigate = useNavigate();
    const handleCartClick = () => {
        navigate('/cart');
    };
    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    }
    const isLoggedIn = Boolean(localStorage.getItem('token'));

    return (
        <div>
            <AppBar position="static" sx={{ backgroundColor: '#2e8b74', color: 'white', fontWeight: 'bold' }}>
                <Toolbar>
                    <Typography variant="h6" style={{ flexGrow: 1 }}>
                        <Link to="/home" style={{ textDecoration: 'none', color: 'inherit' }}>
                            Livraria Virtual
                        </Link>
                    </Typography>
                    <Button color="inherit" startIcon={<ShoppingCartIcon />} onClick={handleCartClick}>
                    </Button>
                    <IconButton color="inherit" onClick={handleMenuOpen}>
                        <Avatar>
                            <AccountCircleIcon />
                        </Avatar>
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                    >

                        {/* Visível apenas se o usuário estiver logado */}
                        {isLoggedIn && (
                            <>
                                <MenuItem onClick={() => { handleMenuClose(); navigate('/mybooks'); }}>Meus Livros</MenuItem>
                                <MenuItem onClick={() => { handleMenuClose(); navigate('/mypurchases'); }}>Minhas Compras</MenuItem>
                                <MenuItem onClick={() => { handleMenuClose(); navigate('/mysales'); }}>Minhas Vendas</MenuItem>
                                <MenuItem onClick={() => { handleMenuClose(); handleLogout() }}>Logout</MenuItem>
                            </>
                        )}

                        {/* Visível apenas se o usuário não estiver logado */}
                        {!isLoggedIn && (
                            <>
                                <MenuItem onClick={() => { handleMenuClose(); navigate('/'); }}>Login</MenuItem>
                            </>
                        )}

                        {/* Sempre Visível */}
                        <MenuItem onClick={() => { handleMenuClose(); navigate('/callcenter'); }}>Fale Conosco</MenuItem>

                    </Menu>
                </Toolbar>

            </AppBar>
            <Container>
                <Typography variant="h4" style={{ margin: '20px 0' }} align='center'>
                    Fale Conosco
                </Typography>
                <p align='center'>E-mail:</p>
                <p align='center'>Telefone:</p>
            </Container>
        </div>
    );
}

export default Callcenter;
