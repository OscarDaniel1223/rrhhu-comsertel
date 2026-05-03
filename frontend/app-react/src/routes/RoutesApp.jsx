// src/App.jsx
import { Routes,Route } from 'react-router-dom';
import LoginForm from '../components/forms/LoginForm';
import Dashboard from '../pages/dashboard';
 
function RoutesApp(){
    return(
        <Routes> 
            <Route path='/' element={<LoginForm/>}/>
            <Route path='/dashboard' element={<Dashboard/>}/>
         
        </Routes>
    );
}

export default RoutesApp;