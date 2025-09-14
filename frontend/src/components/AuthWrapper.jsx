import React, { useState } from 'react';
import SignIn from './SignIn';
import SignUp from './SignUp';

const AuthWrapper = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  return isSignUp ? (
    <SignUp onToggle={() => setIsSignUp(false)} />
  ) : (
    <SignIn onToggle={() => setIsSignUp(true)} />
  );
};

export default AuthWrapper;
