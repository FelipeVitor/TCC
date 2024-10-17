import React, { useState, useEffect } from 'react';
import { Typography, Container, Grid, Card, CardContent, CardMedia, Box, Button, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';

function Cart() {
    const [cartItems, setCartItems] = useState([]); // Estado para armazenar os itens do carrinho
    const navigate = useNavigate();

    // Carregar itens do carrinho ao montar o componente
    useEffect(() => {
        const storedCartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        setCartItems(storedCartItems);
    }, []);

    // Função para remover item do carrinho
    const handleRemoveItem = (id) => {
        const updatedCartItems = cartItems.filter(item => item.id !== id);
        setCartItems(updatedCartItems);
        localStorage.setItem('cartItems', JSON.stringify(updatedCartItems)); // Atualiza o localStorage
    };

    // Função para calcular o total do carrinho
    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + item.preco, 0).toFixed(2);
    };

    // Função para finalizar compra
    const handleCheckout = () => {
        // Aqui pode-se implementar lógica de finalização da compra, como chamar uma API
        alert('Compra finalizada com sucesso!');
        localStorage.removeItem('cartItems'); // Limpar o carrinho após finalizar compra
        navigate('/home'); // Voltar à página inicial
    };

    return (
        <Container>
            <Typography variant="h4" align="center" gutterBottom>
                Meu Carrinho
            </Typography>

            {cartItems.length === 0 ? (
                <Typography variant="h6" align="center">
                    Seu carrinho está vazio.
                </Typography>
            ) : (
                <>
                    <Grid container spacing={3}>
                        {cartItems.map((item) => (
                            <Grid item xs={12} sm={6} md={4} key={item.id}>
                                <Card sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: 3 }}>
                                    <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
                                        <CardMedia
                                            component="img"
                                            image={item.url_imagem} // Usando a URL da imagem da API
                                            alt={item.titulo}
                                            sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </Box>
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Typography variant="h6">{item.titulo}</Typography>
                                        <Typography variant="subtitle1" color="textSecondary">
                                            {item.autor}
                                        </Typography>
                                        <Typography variant="h6" color="primary">
                                            R$ {item.preco}
                                        </Typography>
                                    </CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
                                        <Button variant="contained" color="secondary" onClick={() => handleRemoveItem(item.id)}>
                                            Remover
                                            <DeleteIcon />
                                        </Button>
                                    </Box>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Exibe o total do carrinho e botão para finalizar compra */}
                    <Box sx={{ mt: 4, textAlign: 'center' }}>
                        <Typography variant="h5">
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
                </>
            )}
        </Container>
    );
}

export default Cart;
