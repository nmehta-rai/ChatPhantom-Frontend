import { SignIn } from '@clerk/clerk-react';
import './Login.css';

function Login() {
  return (
    <div className='login-page'>
      <div className='login-left'>
        <h1>Get Started with Us</h1>
        <p>Complete these easy steps to get started.</p>
        <ol className='step-list'>
          <li>Create an account</li>
          <li>Summon your phantom</li>
          <li>Bring your website to life!</li>
        </ol>
      </div>
      <div className='login-right'>
        <SignIn
          appearance={{
            elements: {
              formButtonPrimary: 'cl-button',
              card: 'cl-card',
              headerTitle: 'cl-headerTitle',
              headerSubtitle: 'cl-headerSubtitle',
              socialButtonsBlockButton: 'cl-socialButtonsBlockButton',
              footerActionLink: 'cl-footerActionLink',
              footerActionText: 'cl-footerActionText',
            },
          }}
          redirectUrl='/dashboard'
        />
      </div>
    </div>
  );
}

export default Login;
