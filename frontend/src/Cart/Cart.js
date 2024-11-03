import React, { useState, useEffect } from 'react';
import { Typography, Toolbar, Grid, Card, CardContent, CardMedia, Box, Button, TextField, AppBar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import api from '../configs/api';

function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Carrega os itens do carrinho da API
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

        // Se a quantidade for igual a de antes, nada acontece
        if (item.carrinho.quantidade === newQuantity) return;

        const previousQuantity = item.carrinho.quantidade;

        const updatedCartItems = cartItems.map((item) =>
            item.livro.id === id ? { ...item, carrinho: { ...item.carrinho, quantidade: newQuantity } } : item
        );
        setCartItems(updatedCartItems);

        try {
            if (newQuantity > item.carrinho.quantidade) {
                newQuantity = newQuantity - item.carrinho.quantidade;
                await api.post(
                    '/carrinho/adicionar',
                    {
                        livro_id: id,
                        quantidade: newQuantity,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                    }
                );
            } else {
                newQuantity = item.carrinho.quantidade - newQuantity;

                if (newQuantity === item.carrinho.quantidade) {
                    const result = await Swal.fire({
                        title: 'Deseja apagar o item do carrinho?',
                        text: "Essa ação não pode ser desfeita",
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Sim',
                        cancelButtonText: 'Cancelar'
                    });

                    if (result.isDismissed) {
                        const restoredCartItems = cartItems.map((item) =>
                            item.livro.id === id ? { ...item, carrinho: { ...item.carrinho, quantidade: previousQuantity } } : item
                        );
                        setCartItems(restoredCartItems);
                        return;
                    }
                }

                await api.delete(`/carrinho/remover-item/${id}/${Math.abs(newQuantity)}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (newQuantity === item.carrinho.quantidade) {
                    window.location.reload();  // Recarrega a página para refletir as mudanças
                }
            }
        } catch (error) {
            const restoredCartItems = cartItems.map((item) =>
                item.livro.id === id ? { ...item, carrinho: { ...item.carrinho, quantidade: previousQuantity } } : item
            );
            setCartItems(restoredCartItems);

            console.error('Erro ao atualizar a quantidade do item:', error);

            if (error.message) {
                await Swal.fire({
                    icon: 'error',
                    title: 'Erro',
                    text: error.message
                });
            } else {
                await Swal.fire({
                    icon: 'error',
                    title: 'Erro',
                    text: 'Erro de rede ou desconhecido'
                });
            }
        }
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + item.carrinho.quantidade * item.livro.preco, 0).toFixed(2);
    };

    const handleCheckout = async () => {
        try {
            // Fazendo requisição POST para finalizar a compra
            await api.post(
                '/venda/comprar-do-carrinho/',
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            // Exibe mensagem de sucesso
            await Swal.fire({
                icon: 'success',
                title: 'Compra finalizada com sucesso!'
            });

            // Remove itens do carrinho do localStorage
            localStorage.removeItem('cartItems');

            // Redireciona para a página home
            navigate('/home');
        } catch (error) {
            if (error.response && error.response.data) {
                // Exibe mensagem de erro detalhada retornada pela API
                await Swal.fire({
                    icon: 'error',
                    title: 'Erro',
                    text: `Erro: ${error.response.data.detail}`
                });
            } else {
                // Mensagem de erro genérica
                await Swal.fire({
                    icon: 'error',
                    title: 'Erro',
                    text: 'Erro ao finalizar a compra. Tente novamente.'
                });
            }
        }
    };

    return (
        <div>
            {/* Barra de navegação preenchendo toda a largura */}
            <AppBar sx={{ backgroundColor: '#2e8b74', color: 'white', fontWeight: 'bold', width: '100%' }} position="static">
                <Toolbar>
                    <Typography variant="h6" style={{ flexGrow: 1 }}>
                        Livraria Virtual
                    </Typography>
                </Toolbar>
            </AppBar>

            <Grid container spacing={2} sx={{ mt: 2 }}>
                {/* Itens do carrinho à esquerda */}
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
                                                image={item.livro.url_imagem}
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

                {/* Caixa de resumo à direita */}
                <Grid item xs={12} md={4}>
                    <Box sx={{ backgroundColor: '#2e8b74', color: 'white', position: 'sticky', top: '100px', textAlign: 'left', pl: 2, pb: 2 }}>
                        <Typography variant="h5" gutterBottom>
                            Resumo do Pedido
                        </Typography>
                        <Typography variant="h6">
                            Total: R$ {calculateTotal()}
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            sx={{ mt: 2 }}
                            onClick={handleCheckout}
                        >
                            Finalizar Compra
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </div >
    );
}

export default Cart;
