import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const tempEmail = process.env.REACT_APP_TEMP_EMAIL;
    const tempPassword = process.env.REACT_APP_TEMP_PASSWORD;

    if (formData.email === tempEmail && formData.password === tempPassword) {
      login();
      navigate('/history');
      alert('로그인 성공!');
    } else {
      alert('이메일 또는 비밀번호가 일치하지 않습니다.');
    }
  };

  return (
    <>
      <div style={styles.container}>
        <div style={styles.content}>
          <div style={styles.leftSection}>
            <img 
              src="/Mapgif.gif" 
              alt="Map Animation" 
              style={styles.hdmapImage}
            />
          </div>
          <div style={styles.rightSection}>
            <h2 style={styles.title}>사용자 로그인</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="아이디"
                style={styles.input}
                required
              />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="비밀번호"
                style={styles.input}
                required
              />
              <button type="submit" style={styles.submitButton}>
                로그인
              </button>
              <div style={styles.links}>
                <Link to="/signup" style={styles.link}>회원가입</Link>
                <span style={styles.divider}>|</span>
                <Link to="/forgot-password" style={styles.link}>비밀번호 찾기</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  container: {
    minHeight: 'calc(100vh - 200px)',
    display: 'flex',
    flexDirection: 'column',
    padding: '200px 100px',
  },
  content: {
    flex: 1,
    display: 'flex',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
    gap: '4rem',
    backgroundColor: '#F3F8FB',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  leftSection: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px',
    padding: '2rem',
    overflow: 'hidden',
  },
  hdmapImage: {
    width: '100%',
    height: 'auto',
    objectFit: 'cover',
    borderRadius: '8px',
  },
  rightSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '2rem',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: '2rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    width: '100%',
    maxWidth: '400px',
  },
  input: {
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid #E2E8F0',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s ease'
  },
  submitButton: {
    backgroundColor: '#0B1C40',
    color: '#ffffff',
    padding: '0.75rem',
    borderRadius: '6px',
    border: 'none',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    marginTop: '1rem'
  },
  links: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '1rem',
  },
  link: {
    color: '#64748B',
    textDecoration: 'none',
    fontSize: '0.9rem',
    transition: 'color 0.2s ease'
  },
  divider: {
    color: '#E2E8F0',
  },
};

export default Login; 