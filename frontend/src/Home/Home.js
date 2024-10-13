import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Grid, Card, CardContent, Box, CardMedia, Container, Pagination, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import './Home.css'; // Importando o CSS

// Array de livros com preços e descrições
const books = [
  {
    id: 1,
    title: 'O Senhor dos Anéis',
    author: 'J.R.R. Tolkien',
    price: 'R$ 59,90',
    description: 'Uma aventura épica pela Terra Média em busca do Um Anel.',
  },
  {
    id: 2,
    title: 'Deastahh - O Horizonte Escarlate',
    author: 'Felipe Vitor',
    price: 'R$ 39,90',
    description: 'A jornada dos pioneiros ao centro de um continente.',
  },
  {
    id: 3,
    title: 'Kandic & Levi - Os Senhores da Guerra',
    author: 'Robson de Jesus',
    price: 'R$ 49,90',
    description: 'Uma batalha secreta acontece entre agentes do bem e mal.',
  },
  { id: 4, title: 'A Revolução dos Bichos', author: 'George Orwell', price: 'R$ 29,90', image: 'https://via.placeholder.com/150' },
  { id: 5, title: '1984', author: 'George Orwell', price: 'R$ 34,90', image: 'https://via.placeholder.com/150' },
  { id: 6, title: 'O Pequeno Príncipe', author: 'Antoine de Saint-Exupéry', price: 'R$ 24,90', image: 'https://via.placeholder.com/150' },
  { id: 7, title: 'Moby Dick', author: 'Herman Melville', price: 'R$ 44,90', image: 'https://via.placeholder.com/150' },
  { id: 8, title: 'Dom Quixote', author: 'Miguel de Cervantes', price: 'R$ 54,90', image: 'https://via.placeholder.com/150' },
  { id: 9, title: 'Crime e Castigo', author: 'Fiódor Dostoiévski', price: 'R$ 49,90', image: 'https://via.placeholder.com/150' },
  { id: 10, title: 'Orgulho e Preconceito', author: 'Jane Austen', price: 'R$ 39,90', image: 'https://via.placeholder.com/150' },
];

function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 4; // Definindo 4 livros por página
  const [open, setOpen] = useState(false); // Estado para abrir/fechar o modal
  const [selectedBook, setSelectedBook] = useState(null); // Livro selecionado

  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = books.slice(indexOfFirstBook, indexOfLastBook);

  // Função para abrir o modal com os detalhes do livro
  const handleOpen = (book) => {
    setSelectedBook(book);
    setOpen(true);
  };

  // Função para fechar o modal
  const handleClose = () => {
    setOpen(false);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <div>
      {/* Barra de navegação */}
      <AppBar
        sx={{
          backgroundColor: '#33b998',
          color: 'white',
          fontWeight: 'bold',
        }}
        position="static"
      >
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Livraria Virtual
          </Typography>
          <Button color="inherit" startIcon={<ShoppingCartIcon />}>
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
          {currentBooks.map((book) => (
            <Grid item xs={12} sm={6} md={3} key={book.id}>
              <Card
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: 3,
                  height: '100%', // Para garantir que todos os cards tenham altura consistente
                }}
              >
                {/* Container Box para manter a proporção 16:9 */}
                <Box
                  sx={{
                    position: 'relative',
                    paddingTop: '56.25%', // Proporção 16:9
                  }}
                >
                  <CardMedia
                    component="img"
                    image={book.image}
                    alt={book.title}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover', // Mantém a proporção da imagem sem distorcer
                    }}
                  />
                </Box>

                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography variant="h6">{book.title}</Typography>
                  <Typography variant="subtitle1" color="textSecondary">
                    {book.author}
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {book.price}
                  </Typography>
                  <Button
                    sx={{
                      backgroundColor: '#33b998',
                      color: 'white',
                      fontWeight: 'bold',
                      '&:hover': {
                        backgroundColor: '#2e8b74',
                      },
                      mt: 2,
                    }}
                    variant="contained"
                    fullWidth
                    onClick={() => handleOpen(book)} // Ao clicar, abre o modal com os detalhes
                  >
                    Detalhes
                  </Button>
                </CardContent>
                <Button
                  sx={{
                    backgroundColor: '#33b998',
                    color: 'white',
                    fontWeight: 'bold',
                    '&:hover': {
                      backgroundColor: '#2e8b74',
                    },
                  }}
                  variant="contained"
                  fullWidth
                >
                  Adicionar ao carrinho
                </Button>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Componente de paginação */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={Math.ceil(books.length / booksPerPage)} // Calcula o número total de páginas
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      </Container>

      {/* Pop-up de detalhes */}
      {selectedBook && (
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>{selectedBook.title}</DialogTitle>
          <DialogContent>
            <Typography variant="h6">{selectedBook.author}</Typography>
            <Typography variant="body1">{selectedBook.description}</Typography>
            {selectedBook.image && (
              <Box
                component="img"
                src={selectedBook.image}
                alt={selectedBook.title}
                sx={{ mt: 2, width: '100%', maxHeight: '300px' }}
              />
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
