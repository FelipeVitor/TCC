import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Grid, Card, CardContent, Box, CardMedia, Container, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import InputMask from 'react-input-mask';
import Swal from 'sweetalert2';
import api from '../configs/api';

function MyBooks() {
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [books, setBooks] = useState([]);
    const [open, setOpen] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [newBook, setNewBook] = useState({ titulo: '', autor: '', preco: '', url_imagem: '' });
    const [openNewBookModal, setOpenNewBookModal] = useState(false);
    const booksPerPage = 4;

    const fetchBooks = async (pagina, busca = '') => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error("Token de autenticação não encontrado.");
            }
            const response = await api.get(`/livros/livros-do-autor?quantidade=${parseInt(booksPerPage)}&pagina=${parseInt(pagina)}&busca=${busca}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBooks(response.data.data);
            setTotalPages(response.data.total_paginas);
        } catch (error) {
            console.error('Erro ao buscar os livros:', error);
        }
    };

    useEffect(() => {
        fetchBooks(currentPage);
    }, [currentPage]);

    const handleOpen = (book) => {
        setSelectedBook(book);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleOpenEdit = (book) => {
        setSelectedBook(book);
        setOpenEdit(true);
    };

    const handleCloseEdit = () => {
        setOpenEdit(false);
    };

    const handleOpenNewBookModal = () => {
        setOpenNewBookModal(true);
    };

    const handleCloseNewBookModal = () => {
        setOpenNewBookModal(false);
    };

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
                await api.delete(`/livros/${bookId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                Swal.fire({
                    title: 'Sucesso',
                    text: 'Livro excluído com sucesso!',
                    icon: 'success',
                    confirmButtonText: 'OK'
                });
                fetchBooks(currentPage);
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

    const handleEditBook = async (bookId) => {
        try {
            const token = localStorage.getItem('token');
            const precoString = typeof selectedBook.preco === 'string'
                ? selectedBook.preco
                : selectedBook.preco.toString();

            const updatedBook = {
                ...selectedBook,
                preco: parseFloat(precoString.replace('R$ ', '').replace('.', '').replace(',', '.'))
            };

            await api.put(
                `/livros/editar/${bookId}`,
                updatedBook,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            Swal.fire({
                title: 'Sucesso',
                text: 'Livro atualizado com sucesso!',
                icon: 'success',
                confirmButtonText: 'OK'
            });
            handleCloseEdit();
            fetchBooks(currentPage);
        } catch (error) {
            console.error('Erro ao editar o livro:', error);
            Swal.fire({
                title: 'Erro',
                text: 'Erro ao editar o livro.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    const handleAddNewBook = async () => {
        try {
            const token = localStorage.getItem('token');
            const priceInFloat = parseFloat(newBook.preco.replace('R$ ', '').replace('.', '').replace(',', '.'));

            const newBookWithUserId = {
                ...newBook,
                preco: priceInFloat,
            };

            await api.post(
                '/livros/cadastrar',
                newBookWithUserId,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            Swal.fire({
                title: 'Sucesso',
                text: 'Livro cadastrado com sucesso!',
                icon: 'success',
                confirmButtonText: 'OK'
            });
            setNewBook({ titulo: '', genero: '', quantidade: '', preco: '', descricao: '', url_imagem: '' });
            handleCloseNewBookModal();
            fetchBooks(currentPage);
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

            <Container>
                <Typography variant="h4" style={{ margin: '20px 0' }} align="center">
                    Meus Livros
                </Typography>

                <Grid container spacing={3} justifyContent="center">
                    {books.map((book) => (
                        <Grid item xs={12} sm={6} md={3} key={book.id}>
                            <Card sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: 3, height: '100%' }}>
                                <Box sx={{ position: 'relative', paddingTop: '125%' }}>
                                    <CardMedia
                                        component="img"
                                        image={book.url_imagem}
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
                                        R$ {parseFloat(book.preco).toFixed(2).replace('.', ',')}
                                    </Typography>
                                </CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, paddingBottom: 2 }}>
                                    <Button sx={{ backgroundColor: '#e53935', color: 'white' }} onClick={() => handleDeleteBook(book.id)}>
                                        Excluir
                                    </Button>
                                    <Button sx={{ backgroundColor: '#2e8b74', color: 'white' }} onClick={() => handleOpen(book)}>
                                        Detalhes
                                    </Button>
                                    <Button sx={{ backgroundColor: '#f9a825', color: 'white' }} onClick={() => handleOpenEdit(book)}>
                                        Editar
                                    </Button>
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* Modal de Edição */}
                {selectedBook && (
                    <Dialog open={openEdit} onClose={handleCloseEdit}>
                        <DialogTitle>Editar Livro</DialogTitle>
                        <DialogContent>
                            <TextField
                                label="Título"
                                fullWidth
                                margin="normal"
                                name="titulo"
                                value={selectedBook.titulo || ''}
                                onChange={(e) => setSelectedBook({ ...selectedBook, titulo: e.target.value })}
                            />
                            <TextField
                                label="Gênero"
                                fullWidth
                                margin="normal"
                                name="genero"
                                value={selectedBook.genero || ''}
                                onChange={(e) => setSelectedBook({ ...selectedBook, genero: e.target.value })}
                            />
                            <TextField
                                label="Quantidade"
                                fullWidth
                                margin="normal"
                                name="quantidade"
                                value={selectedBook.quantidade || ''}
                                onChange={(e) => setSelectedBook({ ...selectedBook, quantidade: e.target.value })}
                            />
                            <InputMask
                                mask="R$ 999,99"
                                value={selectedBook.preco || ''}
                                onChange={(e) => setSelectedBook({ ...selectedBook, preco: e.target.value })}
                            >
                                {(inputProps) => (
                                    <TextField
                                        {...inputProps}
                                        label="Preço"
                                        fullWidth
                                        margin="normal"
                                        name="preco"
                                    />
                                )}
                            </InputMask>
                            <TextField
                                label="Descrição"
                                fullWidth
                                margin="normal"
                                name="descricao"
                                value={selectedBook.descricao || ''}
                                onChange={(e) => setSelectedBook({ ...selectedBook, descricao: e.target.value })}
                            />
                            <TextField
                                label="URL da Imagem"
                                fullWidth
                                margin="normal"
                                name="url_imagem"
                                value={selectedBook.url_imagem || ''}
                                onChange={(e) => setSelectedBook({ ...selectedBook, url_imagem: e.target.value })}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseEdit} color="primary">
                                Cancelar
                            </Button>
                            <Button onClick={() => handleEditBook(selectedBook.id)} sx={{ backgroundColor: '#2e8b74', color: 'white' }}>
                                Salvar
                            </Button>
                        </DialogActions>
                    </Dialog>
                )}
            </Container>
        </div>
    );
}

export default MyBooks;
