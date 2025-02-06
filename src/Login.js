import { SignIn } from '@clerk/clerk-react';
import './Login.css';

function Login() {
  return (
    <div className='login-page'>
      <div className='login-left'>
        <h1>Get Started with Us</h1>
        <p>Complete these easy steps to register your account.</p>
        <ol className='step-list'>
          <li>Sign up your account</li>
          <li>Set up your workspace</li>
          <li>Set up your profile</li>
        </ol>
      </div>
      <div className='login-right'>
        <SignIn redirectUrl='/dashboard' />
      </div>
    </div>
  );
}

export default Login;
