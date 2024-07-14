import React, { useState, useEffect } from "react";
import { Button } from "../components/Button";
import "../styles/Styles.css";
export const Modal = ({ showModal, modalContent, butonCustom }) => {
  const [modalView, setModalView] = useState(showModal);

  const closeModal = () => {
    setModalView(false);
  };
  useEffect(() => {
    setModalView(showModal);
  }, [showModal]);
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        modalView ? "block" : "hidden"
      }`}
    >
      <div className="bg-gray-500 bg-opacity-75 absolute inset-0"></div>
      <div className="bg-white p-3 rounded-3 drop-shadow-lg relative animated zoomIn">
        {modalContent ? (
          modalContent
        ) : (
          <div className="m-5">
            <h2>Sin contenido.</h2>
          </div>
        )}
        <br />
        {butonCustom ? (
          butonCustom
        ) : (
          <Button onClick={closeModal} text="Cerrar" />
        )}
      </div>
    </div>
  );
};
