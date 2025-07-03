import React, { useState, useEffect, useRef } from 'react';

function Footer() {
  const [openSection, setOpenSection] = useState(null);
  const sectionRefs = useRef({});

  const toggleSection = (section) => {
    if (openSection === section) {
      setOpenSection(null);
    } else {
      setOpenSection(section);
    }
  };

  useEffect(() => {
    if (openSection && sectionRefs.current[openSection]) {
      sectionRefs.current[openSection].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [openSection]);

  const sections = [
    { id: 'management', title: '관리기관', content: ['기관 1', '기관 2', '기관 3'] },
    { id: 'participant', title: '참여기관', content: ['참여기관 1', '참여기관 2', '참여기관 3'] },
    { id: 'related', title: '유관기관', content: ['유관기관 1', '유관기관 2', '유관기관 3'] },
    { id: 'sites', title: '관련사이트', content: ['사이트 1', '사이트 2', '사이트 3'] }
  ];

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.accordionContainer}>
          {sections.map((section, index) => (
            <div 
              key={section.id} 
              style={{
                ...styles.section,
                borderLeft: index === 0 ? 'none' : '1px solid #eee'
              }}
            >
              <button
                style={styles.sectionHeader}
                onClick={() => toggleSection(section.id)}
              >
                {section.title}
                <span style={styles.plusIcon}>{openSection === section.id ? '-' : '+'}</span>
              </button>
              {openSection === section.id && (
                <div 
                  ref={el => sectionRefs.current[section.id] = el}
                  style={styles.sectionContent}
                >
                  {section.content.map((item, index) => (
                    <div 
                      key={index} 
                      style={styles.contentItem}
                      onMouseEnter={(e) => e.target.style.color = '#333'}
                      onMouseLeave={(e) => e.target.style.color = '#666'}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div style={styles.bottomInfo}>
          <img src="/Keti.ko.png" alt="KETI Logo" style={styles.logo} />
          <div style={styles.info}>
            <div style={styles.contact}>
              <p>(ㅇㅇㅇㅇㅇ) ㅇㅇㅇ ㅇㅇㅇ ㅇㅇㅇ ㅇㅇㅇ</p>
              <p>대표전화 000-000-0000 (평일 09시~18시)</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    bottom: 0,
    left: 0,
    width: '100%',
    borderTop: '1px solid #E2E8F0',
    padding: '1rem',
    zIndex: 10,
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  accordionContainer: {
    display: 'flex',
    borderBottom: '1px solid #eee',
  },
  section: {
    flex: '1',
    position: 'relative',
  },
  sectionHeader: {
    width: '100%',
    padding: '15px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#333',
    textAlign: 'left'
  },
  plusIcon: {
    fontSize: '18px',
    color: '#666',
  },
  sectionContent: {
    position: 'absolute',
    top: '100%',
    left: '0',
    right: '0',
    padding: '15px 20px',
    backgroundColor: '#f8f8f8',
    borderTop: '1px solid #eee',
    zIndex: 10,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  contentItem: {
    padding: '8px 0',
    color: '#666',
    fontSize: '14px',
    cursor: 'pointer',
  },
  bottomInfo: {
    display: 'flex',
    alignItems: 'center',
    padding: '20px',
  },
  logo: {
    height: '40px',
    marginRight: '20px',
  },
  info: {
    color: '#666',
  },
  contact: {
    fontSize: '13px',
    lineHeight: '1.5',
  },
};

export default Footer; 