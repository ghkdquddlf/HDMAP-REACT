import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Signup() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    organization: ''
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
    if (formData.password !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    console.log('회원가입 시도:', formData);
  };

  return (
    <>
      <div style={styles.container}>
        <div style={styles.content}>
          <div style={styles.formSection}>
            <h2 style={styles.title}>회원가입</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="아이디(이메일)"
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
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="비밀번호 확인"
                style={styles.input}
                required
              />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="이름"
                style={styles.input}
                required
              />
              <input
                type="text"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                placeholder="소속"
                style={styles.input}
                required
              />
              <button type="submit" style={styles.submitButton}>
                회원가입
              </button>
              <div style={styles.links}>
                <span style={styles.text}>이미 계정이 있으신가요?</span>
                <Link to="/login" style={styles.link}>로그인</Link>
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
  },
  content: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem',
  },
  formSection: {
    width: '100%',
    maxWidth: '400px',
    borderRadius: '12px',
    padding: '2rem',
    /*boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',*/
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: '2rem',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    width: '100%',
  },
  input: {
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid #E2E8F0',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    '&:focus': {
      borderColor: '#3B82F6',
    },
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
    marginTop: '1rem',
  },
  links: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '1rem',
  },
  text: {
    color: '#64748B',
    fontSize: '0.9rem',
  },
  link: {
    color: '#0B1C40',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
};

export default Signup; 