import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Grid, Card, CardContent, Box, CardMedia, Container, Pagination, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useNavigate } from 'react-router-dom'; // Importe o hook para navegação
import axios from 'axios';
import './Home.css'; // Importando o CSS

function Home() {
  const [currentPage, setCurrentPage] = useState(1); // Página atual
  const [totalPages, setTotalPages] = useState(0); // Total de páginas
  const [books, setBooks] = useState([]); // Livros da página atual
  const [open, setOpen] = useState(false); // Estado para abrir/fechar o modal
  const [selectedBook, setSelectedBook] = useState(null); // Livro selecionado
  const [searchTerm, setSearchTerm] = useState(''); // Termo de busca
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(''); // Termo de busca com debounce
  const [quantities, setQuantities] = useState({}); // Estado para armazenar as quantidades dos livros
  const booksPerPage = 4; // Número de livros por página
  const navigate = useNavigate(); // Hook para navegação

  // Função de debouncing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 700); // 500ms de debounce

    return () => {
      clearTimeout(handler); // Limpa o timeout na desmontagem ou quando o searchTerm mudar
    };
  }, [searchTerm]);

  // Função para buscar os livros da API com base na página e no termo de busca
  const fetchBooks = async (pagina, busca = '') => {
    try {
      const response = await axios.get(`http://0.0.0.0:9000/livros/?quantidade=${booksPerPage}&pagina=${pagina}&busca=${busca}`);
      setBooks(response.data.data); // Define os livros da página atual
      setTotalPages(response.data.total_paginas); // Define o total de páginas com base no backend
    } catch (error) {
      console.error('Erro ao buscar os livros:', error);
    }
  };

  // Buscar livros sempre que a página atual ou o termo de busca (com debounce) for alterado
  useEffect(() => {
    fetchBooks(currentPage, debouncedSearchTerm);
  }, [currentPage, debouncedSearchTerm]);

  // Função para abrir o modal com os detalhes do livro
  const handleOpen = (book) => {
    setSelectedBook(book);
    setOpen(true);
  };

  // Função para fechar o modal
  const handleClose = () => {
    setOpen(false);
  };

  // Função para mudar de página
  const handlePageChange = (event, value) => {
    setCurrentPage(value); // Atualiza a página atual com o valor da paginação
  };

  // Função para redirecionar para a tela do carrinho
  const handleCartClick = () => {
    navigate('/cart'); // Navega para a página de detalhes do carrinho
  };

  // Função para controlar a quantidade de cada livro
  const handleQuantityChange = (id, quantity) => {
    setQuantities({
      ...quantities,
      [id]: quantity, // Atualiza a quantidade do livro com base no ID
    });
  };

  // Função para adicionar o livro ao carrinho
  const handleAddToCart = async (book) => {
    const quantity = quantities[book.id] || 1; // Verifica a quantidade selecionada ou 1 por padrão
    if (quantity > 0) {
      try {
        const token = localStorage.getItem('token');
        await axios.post(
          'http://0.0.0.0:9000/carrinho/adicionar',
          { livro_id: book.id, quantidade: quantity },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert(`${book.titulo} adicionado ao carrinho!`);
      } catch (error) {
        console.error('Erro ao adicionar ao carrinho:', error);

        if (error.message)
          alert(error.message);
        else
          alert(error)
      }
    } else {
      alert(`A quantidade de ${book.titulo} deve ser maior que zero.`);
    }
  };

  return (
    <div>
      {/* Barra de navegação */}
      <AppBar sx={{ backgroundColor: '#2e8b74', color: 'white', fontWeight: 'bold' }} position="static">
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Livraria Virtual
          </Typography>
          <TextField
            variant="outlined"
            placeholder="Buscar por título ou autor"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} // Atualiza o termo de busca
            sx={{ backgroundColor: 'white', borderRadius: '4px' }}
          />
          <Button color="inherit" startIcon={<ShoppingCartIcon />} onClick={handleCartClick}>
            Carrinho
          </Button>
        </Toolbar>
      </AppBar>

      {/* Conteúdo principal */}
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
                    R$ {book.preco}
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

                  <Button sx={{ backgroundColor: '#2e8b74', color: 'white', fontWeight: 'bold', '&:hover': { backgroundColor: '#215f50' }, mt: 2 }} variant="contained" fullWidth onClick={() => handleOpen(book)}>
                    Detalhes
                  </Button>
                </CardContent>
                <Button
                  sx={{ backgroundColor: '#2e8b74', color: 'white', fontWeight: 'bold', '&:hover': { backgroundColor: '#215f50' } }}
                  variant="contained"
                  fullWidth
                  onClick={() => handleAddToCart(book)} // Adiciona ao carrinho com a quantidade selecionada
                >
                  Adicionar ao Carrinho
                </Button>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Componente de paginação */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} color="primary" />
        </Box>
      </Container>

      {/* Pop-up de detalhes */}
      {selectedBook && (
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>{selectedBook.titulo}</DialogTitle>
          <DialogContent>
            <Typography variant="h6">{selectedBook.autor}</Typography>
            <Typography variant="body1">{selectedBook.descricao}</Typography>
            {selectedBook.url_imagem && (
              <Box component="img" src={selectedBook.url_imagem} alt={selectedBook.titulo} sx={{ mt: 2, width: '100%', maxHeight: '300px' }} />
            )}
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
