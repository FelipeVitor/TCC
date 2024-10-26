import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Grid, Card, CardContent, Box, CardMedia, Container, Pagination, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Avatar, Menu, MenuItem, IconButton } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle'; // Ícone de perfil
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Home.css';
import Swal from 'sweetalert2';

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
  const booksPerPage = 4;
  const navigate = useNavigate();

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
      const response = await axios.get(`http://0.0.0.0:9000/livros/?quantidade=${booksPerPage}&pagina=${pagina}&busca=${busca}`);
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
      const response = await axios.get(`http://0.0.0.0:9000/livros/obter-livros/${book.id}`);
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
    if (quantity > 0) {
      try {
        const token = localStorage.getItem('token');
        await axios.post(
          'http://0.0.0.0:9000/carrinho/adicionar',
          { livro_id: book.id, quantidade: quantity },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        Swal.fire({
          title: 'Sucesso',
          text: `${book.titulo} adicionado ao carrinho`,
          icon: 'success',
          confirmButtonText: 'OK'
        });
      } catch (error) {
        console.error('Erro ao adicionar ao carrinho:', error);
        Swal.fire({
          title: 'Erro',
          text: error.message || error,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    } else {
      Swal.fire({
        title: 'Atenção',
        text: `A quantidade de ${book.titulo} deve ser maior que zero.`,
        icon: 'warning',
        confirmButtonText: 'OK'
      });
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
      await axios.post(
        `http://0.0.0.0:9000/venda/venda-direta/${book.id}`,
        { quantidade: 1 },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      Swal.fire({
        title: 'Sucesso',
        text: 'Compra realizada com sucesso',
        icon: 'success',
        confirmButtonText: 'OK'
      });
    } catch (error) {
      if (error.response && error.response.data) {
        Swal.fire({
          title: 'Erro',
          text: `Erro: ${error.response.data.detail}`,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      } else {
        Swal.fire({
          title: 'Erro',
          text: 'Erro ao realizar a compra. Tente novamente.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    }
  };

  return (
    <div>
      <AppBar sx={{ backgroundColor: '#2e8b74', color: 'white', fontWeight: 'bold' }} position="static">
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Livraria Virtual
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
            <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>Perfil</MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); navigate('/mybooks'); }}>Meus Livros</MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); navigate('/mysales'); }}>Minhas Vendas</MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); navigate('/logout'); }}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Conteúdo principal e outros componentes... */}
      <Container>
        <Typography variant="h4" style={{ margin: '20px 0' }} align="center">
          Bem-vindo à Livraria Virtual
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

                  <Button sx={{ backgroundColor: '#2e8b74', color: 'white', fontWeight: 'bold', '&:hover': { backgroundColor: '#265f5d' } }} onClick={() => handleAddToCart(book)} fullWidth>
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
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      </Container>

      {/* Diálogo com informações do livro */}
      {selectedBook && (
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
      )}
    </div>
  );
}

export default Home;
