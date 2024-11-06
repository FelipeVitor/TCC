import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppBar, Button, Toolbar, Typography, Grid, Card, CardContent, Container, IconButton, Avatar, Menu, MenuItem, Snackbar, Alert } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import api from '../configs/api';

function AuthorSales() {
    const [sales, setSales] = useState([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const fetchSales = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error("Token de autenticação não encontrado.");
            }

            const response = await api.get(`/venda/listar`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSales(response.data);
        } catch (error) {
            console.error('Erro ao buscar as vendas:', error);
            showSnackbar('Erro ao carregar as vendas.', 'error');
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    useEffect(() => {
        fetchSales();
    }, []);

    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
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
        showSnackbar('Logout realizado com sucesso.', 'success');
    };

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
                        {isLoggedIn && (
                            <>
                                <MenuItem onClick={() => { handleMenuClose(); navigate('/mybooks'); }}>Meus Livros</MenuItem>
                                <MenuItem onClick={() => { handleMenuClose(); navigate('/mypurchases'); }}>Minhas Compras</MenuItem>
                                <MenuItem onClick={() => { handleMenuClose(); navigate('/mysales'); }}>Minhas Vendas</MenuItem>
                                <MenuItem onClick={() => { handleMenuClose(); handleLogout() }}>Logout</MenuItem>
                            </>
                        )}

                        {!isLoggedIn && (
                            <>
                                <MenuItem onClick={() => { handleMenuClose(); navigate('/'); }}>Login</MenuItem>
                            </>
                        )}

                        <MenuItem onClick={() => { handleMenuClose(); navigate('/callcenter'); }}>Fale Conosco</MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            <Container>
                <Typography variant="h4" style={{ margin: '20px 0' }} align="center">
                    Minhas Vendas
                </Typography>

                <Grid container spacing={3} justifyContent="center">
                    {sales.map((sale) => (
                        <Grid item xs={12} sm={6} md={3} key={sale.id}>
                            <Card sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: 3, height: '100%' }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography variant="h6">Venda ID: {sale.id}</Typography>
                                    <Typography variant="subtitle1" color="textSecondary">
                                        Data: {new Date(sale.data_venda).toLocaleDateString()}
                                    </Typography>

                                    {/* Exibe a lista de livros com as respectivas quantidades */}
                                    {sale.livros.map((livro, index) => (
                                        <Typography key={index} variant="subtitle1" color="textSecondary">
                                            {livro.titulo} - Quantidade: {livro.quantidade}
                                        </Typography>
                                    ))}

                                    <Typography variant="h6" color="primary" style={{ marginTop: '10px' }}>
                                        Total: R$ {parseFloat(sale.total).toFixed(2).replace('.', ',')}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Snackbar para exibir mensagens */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
}

export default AuthorSales;
