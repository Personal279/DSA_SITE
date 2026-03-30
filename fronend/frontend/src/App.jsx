import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './Components/Home';
import LoginPage from './Components/Login';
import RegisterPage from './Components/Register';
import Problems from './Components/Problems';
import ProtectedRoute from './Components/ProtectedRoute';
import TokenHandler from './Components/TokenHandler';
import AccountPage from './Components/Account';
function App() {
  return (
    <div className='helper'>
      <Router>
        <Routes>
          <Route path="/Home" element={<ProtectedRoute><HomePage/></ProtectedRoute>} />
          <Route path="/" element={<LoginPage/>} />
          <Route path="/Register" element={<RegisterPage/>} />
          <Route path="/token-handler" element={<TokenHandler />}/>
          <Route path="/Problems" element={<ProtectedRoute><Problems/></ProtectedRoute>} />
         <Route path="/Account" element={<AccountPage />}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;



 