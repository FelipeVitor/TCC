import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Grid, Card, CardContent, Box, CardMedia, Container, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import axios from 'axios';
import './MyBooks.css'; // Opcional, para estilização personalizada
import InputMask from 'react-input-mask'; // Importa o react-input-mask
import Swal from 'sweetalert2';

function MyBooks() {
    const [currentPage, setCurrentPage] = useState(1); // Página atual
    const [totalPages, setTotalPages] = useState(0); // Total de páginas
    const [books, setBooks] = useState([]); // Livros da página atual
    const [open, setOpen] = useState(false); // Estado para abrir/fechar o modal
    const [selectedBook, setSelectedBook] = useState(null); // Livro selecionado
    const [newBook, setNewBook] = useState({ titulo: '', autor: '', preco: '', url_imagem: '' }); // Estado para um novo livro
    const [openNewBookModal, setOpenNewBookModal] = useState(false); // Modal para cadastro de novo livro
    const booksPerPage = 4; // Número de livros por página

    // Função para buscar os livros do autor logado
    const fetchBooks = async (pagina, busca = '') => {
        try {
            const token = localStorage.getItem('token'); // Obtém o token de autenticação
            if (!token) {
                throw new Error("Token de autenticação não encontrado.");
            }
            const response = await axios.get(`http://0.0.0.0:9000/livros/livros-do-autor?quantidade=${parseInt(booksPerPage)}&pagina=${parseInt(pagina)}&busca=${busca}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBooks(response.data.data); // Define os livros da página atual
            setTotalPages(response.data.total_paginas); // Define o total de páginas com base no backend
        } catch (error) {
            console.error('Erro ao buscar os livros:', error);
        }
    };

    // Buscar livros sempre que a página atual for alterada
    useEffect(() => {
        fetchBooks(currentPage);
    }, [currentPage]);

    // Função para abrir o modal de detalhes
    const handleOpen = (book) => {
        setSelectedBook(book);
        setOpen(true);
    };

    // Função para fechar o modal de detalhes
    const handleClose = () => {
        setOpen(false);
    };

    // Função para abrir o modal de novo livro
    const handleOpenNewBookModal = () => {
        setOpenNewBookModal(true);
    };

    // Função para fechar o modal de novo livro
    const handleCloseNewBookModal = () => {
        setOpenNewBookModal(false);
    };

    // Função para excluir um livro
    const handleDeleteBook = async (bookId) => {
        const result = await Swal.fire({
            title: 'Tem certeza que deseja excluir este livro?',
            text: "Essa ação não pode ser desfeita",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sim',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://0.0.0.0:9000/livros/${bookId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                Swal.fire({
                    title: 'Sucesso',
                    text: 'Livro excluído com sucesso!',
                    icon: 'success',
                    confirmButtonText: 'OK'
                });
                fetchBooks(currentPage); // Atualiza a lista de livros após exclusão
            } catch (error) {
                console.error('Erro ao excluir o livro:', error);
                Swal.fire({
                    title: 'Erro',
                    text: 'Erro ao excluir o livro.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        }
    };

    // Função para cadastrar um novo livro
    const handleAddNewBook = async () => {
        try {
            const token = localStorage.getItem('token');
            const priceInFloat = parseFloat(newBook.preco.replace('R$ ', '').replace('.', '').replace(',', '.'));

            // Adiciona o usuario_id ao objeto newBook
            const newBookWithUserId = {
                ...newBook,  // Mantém os dados existentes de newBook
                preco: priceInFloat,
            };

            await axios.post(
                'http://0.0.0.0:9000/livros/cadastrar',
                newBookWithUserId,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            Swal.fire({
                title: 'Sucesso',
                text: 'Livro cadastrado com sucesso!',
                icon: 'success',
                confirmButtonText: 'OK'
            });
            setNewBook({ titulo: '', genero: '', quantidade: '', preco: '', descricao: '', url_imagem: '' }); // Limpa o formulário
            handleCloseNewBookModal(); // Fecha o modal
            fetchBooks(currentPage); // Atualiza a lista de livros
        } catch (error) {
            console.error('Erro ao cadastrar o livro:', error);
            Swal.fire({
                title: 'Erro',
                text: 'Erro ao cadastrar o livro.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    return (
        <div>
            {/* Barra de navegação */}
            <AppBar position="static" sx={{ backgroundColor: '#2e8b74', color: 'white', fontWeight: 'bold' }}>
                <Toolbar>
                    <Typography variant="h6" style={{ flexGrow: 1 }}>
                        Meus Livros
                    </Typography>
                    <Button sx={{ color: 'white', fontWeight: 'bold' }} onClick={handleOpenNewBookModal}>
                        Cadastrar Novo Livro
                    </Button>
                </Toolbar>
            </AppBar>

            {/* Conteúdo principal */}
            <Container>
                <Typography variant="h4" style={{ margin: '20px 0' }} align="center">
                    Meus Livros
                </Typography>

                {/* Lista de livros */}
                <Grid container spacing={3} justifyContent="center">
                    {books.map((book) => (
                        <Grid item xs={12} sm={6} md={3} key={book.id}>
                            <Card sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: 3, height: '100%' }}>
                                <Box sx={{ position: 'relative', paddingTop: '125%' }}>
                                    <CardMedia
                                        component="img"
                                        image={book.url_imagem} // Usando a URL da imagem da API
                                        alt={book.titulo}
                                        sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </Box>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography variant="h6">{book.titulo}</Typography>
                                    <Typography variant="subtitle1" color="textSecondary">
                                        {book.autor}
                                    </Typography>
                                    <Typography variant="h6" color="primary">
                                        {/* Formata o preço */}
                                        R$ {parseFloat(book.preco).toFixed(2).replace('.', ',')}
                                    </Typography>
                                </CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Button sx={{ backgroundColor: '#e53935', color: 'white' }} onClick={() => handleDeleteBook(book.id)}>
                                        Excluir
                                    </Button>
                                    <Button sx={{ backgroundColor: '#2e8b74', color: 'white' }} onClick={() => handleOpen(book)}>
                                        Detalhes
                                    </Button>
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Modal para adicionar um novo livro */}
            <Dialog open={openNewBookModal} onClose={handleCloseNewBookModal}>
                <DialogTitle>Cadastrar Novo Livro</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Título"
                        fullWidth
                        margin="normal"
                        value={newBook.titulo}
                        onChange={(e) => setNewBook({ ...newBook, titulo: e.target.value })}
                    />
                    <TextField
                        label="Genero"
                        fullWidth
                        margin="normal"
                        value={newBook.genero}
                        onChange={(e) => setNewBook({ ...newBook, genero: e.target.value })}
                    />
                    <TextField
                        label="Quantidade"
                        fullWidth
                        margin="normal"
                        value={newBook.quantidade}
                        onChange={(e) => setNewBook({ ...newBook, quantidade: e.target.value })}
                    />
                    {/* Campo de Preço com máscara */}
                    <InputMask
                        mask="R$ 999,99"
                        value={newBook.preco}
                        onChange={(e) => setNewBook({ ...newBook, preco: e.target.value })}
                    >
                        {(inputProps) => (
                            <TextField
                                {...inputProps}
                                label="Preço"
                                fullWidth
                                margin="normal"
                            />
                        )}
                    </InputMask>
                    <TextField
                        label="Descrição"
                        fullWidth
                        margin="normal"
                        value={newBook.descricao}
                        onChange={(e) => setNewBook({ ...newBook, descricao: e.target.value })}
                    />
                    <TextField
                        label="Url da Imagem"
                        fullWidth
                        margin="normal"
                        value={newBook.url_imagem}
                        onChange={(e) => setNewBook({ ...newBook, url_imagem: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseNewBookModal}>Cancelar</Button>
                    <Button onClick={handleAddNewBook} sx={{ backgroundColor: '#2e8b74', color: 'white' }}>
                        Adicionar Livro
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default MyBooks;
