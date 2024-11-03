import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Grid, Card, CardContent, Container } from '@mui/material';
import axios from 'axios';
import Swal from 'sweetalert2';
import api from '../configs/api';

function AuthorSales() {
    const [sales, setSales] = useState([]);

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
            Swal.fire({
                title: 'Erro',
                text: 'Erro ao carregar as vendas.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    useEffect(() => {
        fetchSales();
    }, []);

    return (
        <div>
            <AppBar position="static" sx={{ backgroundColor: '#2e8b74', color: 'white', fontWeight: 'bold' }}>
                <Toolbar>
                    <Typography variant="h6" style={{ flexGrow: 1 }}>
                        Minhas Vendas
                    </Typography>
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
                                    <Typography variant="h6">{sale.livro_titulo}</Typography>
                                    <Typography variant="subtitle1" color="textSecondary">
                                        Quantidade: {sale.quantidade}
                                    </Typography>
                                    <Typography variant="subtitle1" color="textSecondary">
                                        Data: {new Date(sale.data_venda).toLocaleDateString()}
                                    </Typography>
                                    <Typography variant="h6" color="primary">
                                        R$ {parseFloat(sale.total).toFixed(2).replace('.', ',')}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </div>
    );
}

export default AuthorSales;
