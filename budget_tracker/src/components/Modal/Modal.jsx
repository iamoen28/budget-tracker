import React from "react";
import './Modal.css'

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {children}
        <button className="close-button" onClick={onClose}>
            x
        </button>
      </div>
    </div>
  );
}

export default Modal;