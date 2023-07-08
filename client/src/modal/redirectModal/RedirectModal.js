import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { useHistory } from "react-router-dom";

Modal.setAppElement("#root"); // replace '#root' with the id of your app's root element

const TimedRedirectModal = ({ isOpen, message, duration }) => {
  const [isModalOpen, setIsModalOpen] = useState(isOpen);
  const history = useHistory();

  useEffect(() => {
    setIsModalOpen(isOpen);
    if (isOpen) {
      const timer = setTimeout(() => {
        setIsModalOpen(false);
        history.push("/");
      }, duration * 1000);

      return () => clearTimeout(timer); // cleanup on unmount
    }
  }, [isOpen, duration, history]);

  return (
    <Modal isOpen={isModalOpen}>
      <h2>{message}</h2>
    </Modal>
  );
};

export default TimedRedirectModal;
