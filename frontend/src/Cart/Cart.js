import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Avatar, Menu, MenuItem, IconButton, Grid, Card, CardContent, CardMedia, Box, TextField, Snackbar, Alert } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import api from '../configs/api';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const navigate = useNavigate();
    const defaultImage = "https://img.freepik.com/fotos-premium/uma-pilha-de-livros-com-a-palavra-citacao-na-parte-superior_583952-80623.jpg?semt=ais_hybrid";

    const openSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const closeSnackbar = () => {
        setSnackbar({ open: false, message: '', severity: 'success' });
    };

    useEffect(() => {
        const fetchCartItems = async () => {
            try {
                const response = await api.get('/carrinho', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                setCartItems(response.data.itens);
            } catch (error) {
                console.error('Erro ao carregar os itens do carrinho:', error);
            }
        };
        fetchCartItems();
    }, []);

    const handleQuantityChange = async (id, newQuantity) => {
        const item = cartItems.find((item) => item.livro.id === id);
        const previousQuantity = item.carrinho.quantidade;

        if (item.carrinho.quantidade === newQuantity) return;

        const updatedCartItems = cartItems.map((item) =>
            item.livro.id === id ? { ...item, carrinho: { ...item.carrinho, quantidade: newQuantity } } : item
        );
        setCartItems(updatedCartItems);

        try {
            if (newQuantity > previousQuantity) {
                newQuantity = newQuantity - previousQuantity;
                await api.post(
                    '/carrinho/adicionar',
                    { livro_id: id, quantidade: newQuantity },
                    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                );
            } else {
                newQuantity = previousQuantity - newQuantity;
                if (newQuantity === previousQuantity) {
                    const confirmed = window.confirm('Deseja apagar o item do carrinho?');
                    if (!confirmed) {
                        const restoredCartItems = cartItems.map((item) =>
                            item.livro.id === id ? { ...item, carrinho: { ...item.carrinho, quantidade: previousQuantity } } : item
                        );
                        setCartItems(restoredCartItems);
                        return;
                    }
                }
                await api.delete(`/carrinho/remover-item/${id}/${Math.abs(newQuantity)}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
            }
            openSnackbar('Quantidade atualizada com sucesso.');
        } catch (error) {
            const restoredCartItems = cartItems.map((item) =>
                item.livro.id === id ? { ...item, carrinho: { ...item.carrinho, quantidade: previousQuantity } } : item
            );
            setCartItems(restoredCartItems);

            console.error('Erro ao atualizar a quantidade do item:', error);
            openSnackbar('Erro ao atualizar a quantidade.', 'error');
        }
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + item.carrinho.quantidade * item.livro.preco, 0).toFixed(2);
    };

    const handleCheckout = async () => {
        try {
            await api.post(
                '/venda/comprar-do-carrinho/',
                {},
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );

            openSnackbar('Compra finalizada com sucesso.');
            localStorage.removeItem('cartItems');
            navigate('/home');
        } catch (error) {
            console.error('Erro ao finalizar a compra:', error);
            openSnackbar('Erro ao finalizar a compra. Tente novamente.', 'error');
        }
    };

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
    };
    const isLoggedIn = Boolean(localStorage.getItem('token'));

    return (
        <div>
            <AppBar sx={{ backgroundColor: '#2e8b74', color: 'white', fontWeight: 'bold', width: '100%' }} position="static">
                <Toolbar>
                    <Typography variant="h6" style={{ flexGrow: 1 }}>
                        <Link to="/home" style={{ textDecoration: 'none', color: 'inherit' }}>
                            Livraria Virtual
                        </Link>
                    </Typography>
                    <Button color="inherit" startIcon={<ShoppingCartIcon />} onClick={handleCartClick}></Button>
                    <IconButton color="inherit" onClick={handleMenuOpen}>
                        <Avatar>
                            <AccountCircleIcon />
                        </Avatar>
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                        {isLoggedIn && (
                            <>
                                <MenuItem onClick={() => { handleMenuClose(); navigate('/mybooks'); }}>Meus Livros</MenuItem>
                                <MenuItem onClick={() => { handleMenuClose(); navigate('/mypurchases'); }}>Minhas Compras</MenuItem>
                                <MenuItem onClick={() => { handleMenuClose(); navigate('/mysales'); }}>Minhas Vendas</MenuItem>
                                <MenuItem onClick={() => { handleMenuClose(); handleLogout(); }}>Logout</MenuItem>
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

            <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12} md={8}>
                    <Typography variant="h4" marginLeft={2} gutterBottom>
                        Meu Carrinho
                    </Typography>

                    {cartItems.length === 0 ? (
                        <Typography variant="h6" marginLeft={2}>
                            Seu carrinho está vazio.
                        </Typography>
                    ) : (
                        <Grid container spacing={3}>
                            {cartItems.map((item) => (
                                <Grid item xs={12} sm={6} md={4} key={item.livro.id}>
                                    <Card sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: 3, ml: 2 }}>
                                        <Box sx={{ position: 'relative', paddingTop: '125%' }}>
                                            <CardMedia
                                                component="img"
                                                image={item.url_imagem === "" ? item.url_imagem : defaultImage}
                                                alt={item.livro.titulo}
                                                sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </Box>
                                        <CardContent sx={{ flexGrow: 1 }}>
                                            <Typography variant="h6">{item.livro.titulo}</Typography>
                                            <Typography variant="subtitle1" color="textSecondary">
                                                {item.livro.autor}
                                            </Typography>
                                            <Typography variant="h6" color="primary">
                                                R$ {parseFloat(item.livro.preco).toFixed(2)}
                                            </Typography>
                                        </CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
                                            <TextField
                                                label="Quantidade"
                                                type="number"
                                                value={item.carrinho.quantidade}
                                                onChange={(e) => handleQuantityChange(item.livro.id, parseInt(e.target.value))}
                                                InputProps={{ inputProps: { min: 1 } }}
                                                variant="outlined"
                                                size="small"
                                                sx={{ width: '100px' }}
                                            />
                                        </Box>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Grid>

                <Grid item xs={12} md={4}>
                    <Box sx={{ backgroundColor: '#2e8b74', color: 'white', position: 'sticky', top: '100px', textAlign: 'left', pl: 2, pb: 2 }}>
                        <Typography variant="h5" gutterBottom>
                            Resumo do Pedido
                        </Typography>
                        <Typography variant="h6">Total: R$ {calculateTotal()}</Typography>
                        <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleCheckout}>
                            Finalizar Compra
                        </Button>
                    </Box>
                </Grid>
            </Grid>

            {/* Snackbar */}
            <Snackbar open={snackbar.open} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} autoHideDuration={6000} onClose={closeSnackbar}>
                <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </div >
    );
}

export default Cart;
