import React, { useState, useEffect } from 'react';
import { Typography, Grid, Card, CardContent, Container, Snackbar, Alert, Pagination, AppBar, Toolbar, IconButton, Avatar, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import api from '../configs/api';

function AuthorPurchases() {
    const [purchases, setPurchases] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4; // Número de compras por página
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    // Função para buscar as compras da API
    const fetchPurchases = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error("Token de autenticação não encontrado.");
            }

            const response = await api.get(`/venda/listar`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = response.data;

            if (data && Array.isArray(data.compras)) {
                const formattedPurchases = data.compras.map((item) => {
                    const compra = item.compra;
                    return {
                        data: compra.data_venda,
                        total: compra.valor_total_da_venda,
                        livros: compra.nome_do_livro.map((livro) => ({
                            titulo: livro.titulo,
                            preco: livro.preco,
                            quantidade: livro.quantidade,
                        })),
                    };
                });

                setPurchases(formattedPurchases);
            } else {
                throw new Error("Formato inesperado de resposta da API.");
            }
        } catch (error) {
            console.error('Erro ao buscar as compras:', error);
            showSnackbar('Erro ao carregar as compras.', 'error');
        }
    };

    // Função para exibir mensagens
    const showSnackbar = (message, severity = 'success') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    // Chama a busca das compras ao carregar o componente
    useEffect(() => {
        fetchPurchases();
    }, []);

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    // Gerencia a paginação
    const paginatedPurchases = purchases.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div>
            <AppBar position="static" sx={{ backgroundColor: '#2e8b74', color: 'white', fontWeight: 'bold' }}>
                <Toolbar>
                    <Typography variant="h6" style={{ flexGrow: 1 }}>
                        <Link to="/home" style={{ textDecoration: 'none', color: 'inherit' }}>
                            Livraria Virtual
                        </Link>
                    </Typography>
                    <Button color="inherit" startIcon={<ShoppingCartIcon />} />
                    <IconButton color="inherit">
                        <Avatar>
                            <AccountCircleIcon />
                        </Avatar>
                    </IconButton>
                </Toolbar>
            </AppBar>

            <Container>
                <Typography variant="h4" style={{ margin: '20px 0' }} align="center">
                    Minhas Compras
                </Typography>

                <Grid container spacing={3} justifyContent="center">
                    {paginatedPurchases.length > 0 ? (
                        paginatedPurchases.map((purchase, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        boxShadow: 3,
                                        height: '100%',
                                    }}
                                >
                                    <CardContent>
                                        <Typography variant="subtitle1" color="textSecondary">
                                            Data da Compra: {new Date(purchase.data).toLocaleDateString()}
                                        </Typography>

                                        {purchase.livros.map((livro, i) => (
                                            <Typography
                                                key={i}
                                                variant="subtitle1"
                                                color="textSecondary"
                                            >
                                                {livro.titulo} - Quantidade: {livro.quantidade} - Preço: R${' '}
                                                {parseFloat(livro.preco).toFixed(2).replace('.', ',')}
                                            </Typography>
                                        ))}

                                        <Typography
                                            variant="h6"
                                            color="primary"
                                            style={{ marginTop: '10px' }}
                                        >
                                            Total: R${' '}
                                            {parseFloat(purchase.total)
                                                .toFixed(2)
                                                .replace('.', ',')}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        <Typography variant="h6" align="center" color="textSecondary">
                            Nenhuma compra encontrada.
                        </Typography>
                    )}
                </Grid>

                {/* Paginação */}
                <Grid container justifyContent="center" style={{ marginTop: '20px' }}>
                    <Pagination
                        count={Math.ceil(purchases.length / itemsPerPage)}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                    />
                </Grid>

                {/* Snackbar para mensagens */}
                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={4000}
                    onClose={handleSnackbarClose}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    <Alert
                        onClose={handleSnackbarClose}
                        severity={snackbarSeverity}
                        sx={{ width: '100%' }}
                    >
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
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
        </div >
    );
}

export default AuthorPurchases;
