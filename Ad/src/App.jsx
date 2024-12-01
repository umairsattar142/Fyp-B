import './App.css';
import { BrowserRouter,Routes,Route } from 'react-router-dom';
import Home from './pages/home';
import Login from './pages/login';
import Product from './pages/product';

function App() {

  return (
    <BrowserRouter >
    <Routes>
      <Route path='/' element={<Login/>}/>
      <Route path='/rarefinds' element={<Home/>}/>
      <Route path='/item/:id' element={<Product/>}/>
    </Routes>
    </BrowserRouter>
  );
}

export default App;
