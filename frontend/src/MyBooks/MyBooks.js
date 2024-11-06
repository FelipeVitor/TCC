import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Grid, Card, CardContent, Box, CardMedia, Container, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Menu, MenuItem, Avatar, Snackbar, Alert } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useNavigate, Link } from 'react-router-dom';
import InputMask from 'react-input-mask';
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
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const booksPerPage = 4;
    const navigate = useNavigate();

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

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const showSnackbar = (message, severity) => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleDeleteBook = async (bookId) => {
        const confirmed = window.confirm('Tem certeza que deseja excluir este livro? Essa ação não pode ser desfeita.');
        if (confirmed) {
            try {
                const token = localStorage.getItem('token');
                await api.delete(`/livros/${bookId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                showSnackbar('Livro excluído com sucesso!', 'success');
                fetchBooks(currentPage);
            } catch (error) {
                console.error('Erro ao excluir o livro:', error);
                showSnackbar('Erro ao excluir o livro.', 'error');
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

            showSnackbar('Livro atualizado com sucesso!', 'success');
            handleCloseEdit();
            fetchBooks(currentPage);
        } catch (error) {
            console.error('Erro ao editar o livro:', error);
            showSnackbar('Erro ao editar o livro.', 'error');
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
            showSnackbar('Livro cadastrado com sucesso!', 'success');
            setNewBook({ titulo: '', genero: '', quantidade: '', preco: '', descricao: '', url_imagem: '' });
            handleCloseNewBookModal();
            fetchBooks(currentPage);
        } catch (error) {
            console.error('Erro ao cadastrar o livro:', error);
            showSnackbar('Erro ao cadastrar o livro.', 'error');
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

    const defaultImage = "https://img.freepik.com/fotos-premium/uma-pilha-de-livros-com-a-palavra-citacao-na-parte-superior_583952-80623.jpg?semt=ais_hybrid";

    return (
        <div>
            <AppBar position="static" sx={{ backgroundColor: '#2e8b74', color: 'white', fontWeight: 'bold' }}>
                <Toolbar>
                    <Typography variant="h6" style={{ flexGrow: 1 }}>
                        <Link to="/home" style={{ textDecoration: 'none', color: 'inherit' }}>
                            Livraria Virtual
                        </Link>
                    </Typography>
                    <Button sx={{ color: 'white', fontWeight: 'bold' }} onClick={handleOpenNewBookModal}>
                        Cadastrar Novo Livro
                    </Button>

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
                                        image={book.url_imagem === '' ? defaultImage : book.url_imagem}
                                        alt={book.titulo}
                                        sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </Box>
                                <CardContent>
                                    <Typography variant="h6" component="div">
                                        {book.titulo}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {book.autor}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        R$ {book.preco.toFixed(2)}
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
                        <InputMask
                            mask="R$ 999,99"
                            value={newBook.preco || ''}
                            onChange={(e) => setNewBook({ ...newBook, preco: e.target.value })}
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
                        <Button onClick={handleCloseNewBookModal} color="primary">
                            Cancelar
                        </Button>
                        <Button onClick={handleAddNewBook} color="primary">
                            Cadastrar
                        </Button>
                    </DialogActions>
                </Dialog>
                {/* Pop-up de detalhes */}
                {selectedBook && (
                    <Dialog open={open} onClose={handleClose}>
                        <DialogTitle>{selectedBook.titulo}</DialogTitle>
                        <DialogContent>
                            <Typography variant="h6">{selectedBook.autor}</Typography>
                            <Typography variant="body1">{selectedBook.descricao}</Typography>
                            {selectedBook.url_imagem && (
                                <Box component="img" src={selectedBook.url_imagem} alt={selectedBook.titulo} sx={{ maxWidth: '100%', height: 'auto' }} />
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClose}>Fechar</Button>
                        </DialogActions>
                    </Dialog>
                )}

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

            {/* Snackbar para feedback visual */}
            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
}

export default MyBooks;
