import React from 'react';

const defaultStyles = {
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    background: 'white',
    borderRadius: '12px',
    padding: '30px 24px',
    minWidth: '300px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
    margin: 0,
    textAlign: 'center',
  },
  modalInput: {
    width: '100%',
    padding: '12px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    '&:focus': {
      borderColor: '#0B1C40',
    },
  },
  modalButtonGroup: {
    display: 'flex',
    gap: '10px',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: '12px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  modalSaveButton: {
    backgroundColor: '#0B1C40',
    color: 'white',
    '&:hover': {
      backgroundColor: '#0a1833',
    },
  },
  modalCancelButton: {
    backgroundColor: '#f1f1f1',
    color: '#333',
    '&:hover': {
      backgroundColor: '#e5e5e5',
    },
  },
};

function InputModal({
  isOpen,
  title,
  inputValue,
  onInputChange,
  onConfirm,
  onCancel,
  placeholder = '',
  confirmText = '확인',
  cancelText = '취소',
  styles = {}
}) {
  if (!isOpen) return null;
  
  const mergedStyles = {
    ...defaultStyles,
    ...styles,
  };

  return (
    <div style={mergedStyles.modalOverlay}>
      <div style={mergedStyles.modalContent}>
        <h4 style={mergedStyles.modalTitle}>{title}</h4>
        <input
          type="text"
          value={inputValue}
          onChange={onInputChange}
          style={mergedStyles.modalInput}
          placeholder={placeholder}
        />
        <div style={mergedStyles.modalButtonGroup}>
          <button
            style={{ ...mergedStyles.modalButton, ...mergedStyles.modalCancelButton }}
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            style={{ ...mergedStyles.modalButton, ...mergedStyles.modalSaveButton }}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default InputModal; 