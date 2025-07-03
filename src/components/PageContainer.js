import React from 'react';
import { FaQuestionCircle } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

function PageContainer({ title, tooltipContent, children }) {
  return (
    <div style={styles.wrapper}>
      <main style={styles.main}>
        <div style={styles.dashboardHeader}>
          <div style={styles.titleWrapper}>
            <h1 style={styles.dashboardTitle}>{title}</h1>
            {tooltipContent && (
              <>
                <FaQuestionCircle 
                  style={styles.questionIcon} 
                  data-tooltip-id={`${title}-tooltip`}
                />
                <Tooltip 
                  id={`${title}-tooltip`}
                  place="right"
                  content={tooltipContent}
                  style={styles.tooltip}
                />
              </>
            )}
          </div>
        </div>
        <div style={styles.contentSection}>
          {children}
        </div>
      </main>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: '100vw',
    overflow: 'hidden',
  },
  main: {
    flex: 1,
    padding: 'clamp(1rem, 2vw, 2rem)',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
  },
  contentSection: {
    backgroundColor: '#F3F8FB',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'visible',
    maxWidth: '100%',
  },
  dashboardHeader: {
    marginBottom: 'clamp(0.5rem, 1vw, 1rem)',
    padding: '0.5rem 0',
  },
  titleWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  dashboardTitle: {
    margin: 0,
    fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
    fontWeight: '600',
    color: '#14274E',
  },
  questionIcon: {
    color: '#64748B',
    fontSize: 'clamp(1rem, 2vw, 1.25rem)',
  },
  tooltip: {
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: '4px',
    padding: '8px 12px',
    fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
    zIndex: 1000,
    maxWidth: '90vw',
  },
};

export default PageContainer; 