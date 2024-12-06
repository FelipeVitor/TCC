import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppBar, Button, Toolbar, Typography, Grid, Card, CardContent, Container, IconButton, Avatar, Menu, MenuItem, Snackbar, Alert, Pagination } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import api from '../configs/api';

function AuthorSales() {
    const [sales, setSales] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4; // Número de cards por página
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

            const data = response.data;

            if (data && Array.isArray(data.vendas)) {
                const formattedSales = [];

                // Processa as vendas
                if (Array.isArray(data.vendas)) {
                    data.vendas.forEach((item) => {
                        item.venda.forEach((venda) => {
                            formattedSales.push({
                                data: venda.data_venda,
                                total: venda.valor_total_da_venda,
                                livros: [
                                    {
                                        titulo: venda.nome_do_livro,
                                        quantidade: venda.quantidade,
                                    },
                                ],
                            });
                        });
                    });
                }

                setSales(formattedSales);
            } else {
                throw new Error("Formato inesperado de resposta da API.");
            }
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

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    // Calcular vendas da página atual
    const paginatedSales = sales.slice(
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
                    Minhas Vendas
                </Typography>

                <Grid container spacing={3} justifyContent="center">
                    {paginatedSales.length > 0 ? (
                        paginatedSales.map((sale, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: 3, height: '100%' }}>
                                    <CardContent>
                                        <Typography variant="subtitle1" color="textSecondary">
                                            Data da Venda: {new Date(sale.data).toLocaleDateString()}
                                        </Typography>

                                        {sale.livros.map((livro, i) => (
                                            <Typography key={i} variant="subtitle1" color="textSecondary">
                                                {livro.titulo} - Quantidade: {livro.quantidade}
                                            </Typography>
                                        ))}

                                        <Typography variant="h6" color="primary" style={{ marginTop: '10px' }}>
                                            Total: R$ {parseFloat(sale.total).toFixed(2).replace('.', ',')}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        <Typography variant="h6" align="center" color="textSecondary">
                            Nenhuma venda encontrada.
                        </Typography>
                    )}
                </Grid>

                {/* Paginação */}
                <Grid container justifyContent="center" style={{ marginTop: '20px' }}>
                    <Pagination
                        count={Math.ceil(sales.length / itemsPerPage)}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                    />
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
