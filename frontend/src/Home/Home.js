import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Grid, Card, CardContent, Box, CardMedia, Container, Pagination, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Avatar, Menu, MenuItem, IconButton, Snackbar, Alert } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle'; // Ícone de perfil
import { useNavigate, Link } from 'react-router-dom';
import api from '../configs/api';

function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [books, setBooks] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [quantities, setQuantities] = useState({});
  const [anchorEl, setAnchorEl] = useState(null); // Estado para controlar o submenu do perfil
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' }); // Estado do Snackbar

  const booksPerPage = 4;
  const navigate = useNavigate();
  const defaultImage = "https://img.freepik.com/fotos-premium/uma-pilha-de-livros-com-a-palavra-citacao-na-parte-superior_583952-80623.jpg?semt=ais_hybrid";

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 700);
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const fetchBooks = async (pagina, busca = '') => {
    try {
      const response = await api.get(`/livros/?quantidade=${booksPerPage}&pagina=${pagina}&busca=${busca}`);
      setBooks(response.data.data);
      setTotalPages(response.data.total_paginas);
    } catch (error) {
      console.error('Erro ao buscar os livros:', error);
    }
  };

  useEffect(() => {
    fetchBooks(currentPage, debouncedSearchTerm);
  }, [currentPage, debouncedSearchTerm]);

  const handleOpen = async (book) => {
    try {
      const response = await api.get(`/livros/obter-livros/${book.id}`);
      setSelectedBook(response.data);  // Atualize o livro selecionado com os dados obtidos da API
      setOpen(true);
    } catch (error) {
      console.error('Erro ao buscar o livro:', error);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  const handleMyBooksClick = () => {
    navigate('/mybook');
  };

  const handleQuantityChange = (id, quantity) => {
    setQuantities({
      ...quantities,
      [id]: quantity,
    });
  };

  const handleAddToCart = async (book) => {
    const quantity = quantities[book.id] || 1;
    try {
      const token = localStorage.getItem('token');
      await api.post(
        '/carrinho/adicionar',
        { livro_id: book.id, quantidade: quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (quantity <= 0) {
        throw new Error('Quantidade mínima é 1');
      }

      // Exibir Snackbar de sucesso
      setSnackbar({ open: true, message: `${book.titulo} adicionado ao carrinho`, severity: 'success' });
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);

      const mensagem_erro = error.response.data

      setSnackbar({ open: true, message: mensagem_erro.detail, severity: 'error' });
    }
  };

  // Funções para abrir e fechar o menu de perfil
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const directPurchase = async (book) => {
    try {
      // Fazendo requisição POST para finalizar a venda direta
      await api.post(
        `/venda/venda-direta/${book.id}`,
        { quantidade: 1 },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      // Exibir Snackbar de sucesso
      setSnackbar({ open: true, message: 'Compra realizada com sucesso', severity: 'success' });
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Erro ao realizar a compra. Tente novamente.';
      // Exibir Snackbar de erro
      setSnackbar({ open: true, message: `Erro: ${errorMessage}`, severity: 'error' });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  }

  const isLoggedIn = Boolean(localStorage.getItem('token'));

  return (

    <div>
      <AppBar sx={{ backgroundColor: '#2e8b74', color: 'white', fontWeight: 'bold' }} position="static">
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            <Link to="/home" style={{ textDecoration: 'none', color: 'inherit' }}>
              Livraria Virtual
            </Link>
          </Typography>
          <TextField
            variant="outlined"
            placeholder="Buscar por título ou autor"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ backgroundColor: 'white', borderRadius: '4px', mr: 2 }}
          />
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

      {/* Conteúdo principal e outros componentes... */}
      <Container>
        {/* Lista de livros */}
        <Grid container spacing={3} justifyContent="center">
          {books.map((book) => (
            <Grid item xs={12} sm={6} mt={2} md={3} key={book.id}>
              <Card sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: 3, height: '100%' }}>
                <Box sx={{ position: 'relative', paddingTop: '125%' }}>
                  <CardMedia
                    component="img"
                    image={book.url_imagem === "" ? book.url_imagem : defaultImage} // Usando a URL da imagem da API
                    alt={book.titulo}
                    sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Box>
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Typography variant="h6">{book.titulo}</Typography>
                  <Typography variant="subtitle1" color="textSecondary">
                    {book.autor}
                  </Typography>
                  <Typography variant="h6" color="primary">
                    R$ {parseFloat(book.preco).toFixed(2)}
                  </Typography>

                  {/* Controle de quantidade */}
                  <TextField
                    label="Quantidade"
                    type="number"
                    value={quantities[book.id] || 1}
                    onChange={(e) => handleQuantityChange(book.id, parseInt(e.target.value))}
                    InputProps={{ inputProps: { min: 1 } }}
                    variant="outlined"
                    size="small"
                    sx={{ mt: 2, width: '100px' }}
                  />

                  <Button sx={{ backgroundColor: '#2e8b74', color: 'white', fontWeight: 'bold', mt: 1, '&:hover': { backgroundColor: '#265f5d' } }} onClick={() => handleAddToCart(book)} fullWidth>
                    Adicionar ao Carrinho
                  </Button>

                  <Button sx={{ mt: 1 }} onClick={() => directPurchase(book)} variant="contained" color="secondary" fullWidth>
                    Comprar Agora
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Paginação */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      </Container>

      {/* Diálogo com informações do livro */}
      {
        selectedBook && (
          <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>{selectedBook.titulo}</DialogTitle>
            <DialogContent>
              {/* Informações do livro */}
              <Typography variant="h6">Autor: {selectedBook.autor}</Typography>
              <Typography variant="body1">{selectedBook.descricao}</Typography>
              <Typography variant="h6" color="primary">
                R$ {parseFloat(selectedBook.preco).toFixed(2)}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} color="primary">
                Fechar
              </Button>
            </DialogActions>
          </Dialog>
        )
      }

      {/* Snackbar para mostrar mensagens */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div >
  );
}

export default Home;
