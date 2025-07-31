import React, { useState } from 'react';
import '../styles/Authform.css';
import { useSignIn, useSignUp } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    education: '',
    gender: '',
    email: '',
    password: '',
    code: ''
  });

  const { signIn } = useSignIn();
  const { signUp, setActive } = useSignUp();
  const [isVerificationStep, setIsVerificationStep] = useState(false);
  const navigate = useNavigate(); // Added navigate

  const handleToggle = (mode) => {
    setIsLogin(mode === 'login');
    setFormData({
      name: '',
      age: '',
      education: '',
      gender: '',
      email: '',
      password: '',
      code: ''
    });
    setIsVerificationStep(false);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const result = await signIn.create({
          identifier: formData.email,
          password: formData.password,
        });
        await result.attemptFirstFactor({
          strategy: 'password',
          password: formData.password,
        });
        alert('Login successful');
        
        localStorage.setItem('userProfile', JSON.stringify({
        email: formData.email,
      }));

        navigate('/Home');
      } else {
        const result = await signUp.create({
          emailAddress: formData.email,
          password: formData.password,
        });
        await signUp.prepareEmailAddressVerification({
          strategy: 'email_code',
        });
        setIsVerificationStep(true);
        alert('Verification code sent to your email');
      }
    } catch (error) {
      alert(error.errors[0].longMessage);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: formData.code,
      });
      await setActive({ session: result.createdSessionId });
      alert('Signup and verification successful');
      // Save full signup info in localStorage
      localStorage.setItem('userProfile', JSON.stringify({
      name: formData.name,
      age: formData.age,
      education: formData.education,
      gender: formData.gender,
      email: formData.email,
    }));
      navigate('/Home'); 
      setIsVerificationStep(false);
    } catch (error) {
      alert(error.errors[0].longMessage);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-form">
        <h2>{isLogin ? 'Login Form' : 'Signup Form'}</h2>
        <div className="auth-tabs">
          <button
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => handleToggle('login')}
          >
            Login
          </button>
          <button
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => handleToggle('signup')}
          >
            Signup
          </button>
        </div>
        {!isVerificationStep ? (
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <input
                  type="number"
                  name="age"
                  placeholder="Age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="education"
                  placeholder="Education"
                  value={formData.education}
                  onChange={handleChange}
                  required
                />
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="gender-select"
                >
                  <option value="" disabled>Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="others">Others</option>
                </select>
              </>
            )}
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {isLogin && <a href="#" className="forgot-link">Forgot password?</a>}
            <button type="submit" className="submit-btn">
              {isLogin ? 'Login' : 'Signup'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <input
              type="text"
              name="code"
              placeholder="Enter Verification Code"
              value={formData.code}
              onChange={handleChange}
              required
            />
            <button type="submit" className="submit-btn">
              Verify Email
            </button>
          </form>
        )}
        <p className="auth-footer">
          {isLogin ? 'Not a member?' : 'Already have an account?'}{' '}
          <span onClick={() => handleToggle(isLogin ? 'signup' : 'login')} className="footer-link">
            {isLogin ? 'Signup now' : 'Login now'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Auth;
