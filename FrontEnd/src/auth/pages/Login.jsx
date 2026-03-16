import "../form.auth.scss"
import {Link} from "react-router-dom"
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";


const Login = () => {
  const { loading, handleLogin } = useAuth();
  const navigate = useNavigate()

  const [email, setemail] = useState("")
  const [password, setpassword] = useState("")
  const handleSubmit =async (e) => {
    e.preventDefault();
    await handleLogin({ email, password });
    navigate("/")
  }

  if(loading) 
    return (
  <main>
    <h1>Loading...</h1>
  </main>)


  return (
    <main>
        <div className="form-container">
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
            <div className="input-group">
                <label htmlFor="email">Email</label>
                <input
                onChange={(e) => {setemail(e.target.value)}}
                type="email" id="email" name="email" placeholder="enter your Email" required />

                <label htmlFor="password">Password</label>
                <input
                onChange={(e) => {setpassword(e.target.value)}}
                type="password" id="password" name="password" placeholder="enter your password" required />
            </div>
            <button className='button primary-button' type="submit">Login</button>
             <p>Don't have an Account? <Link to="/register">Register</Link></p>
        </form>
        </div>
    </main>
    
  )
}

export default Login