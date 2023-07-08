import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { useHistory } from "react-router-dom";

Modal.setAppElement("#root"); // replace '#root' with the id of your app's root element

const TimedRedirectModal = ({ isOpen, message, duration, networkStatus }) => {
  const [isModalOpen, setIsModalOpen] = useState(isOpen);
  const [countdown, setCountdown] = useState(duration);
  const history = useHistory();

  useEffect(() => {
    setIsModalOpen(isOpen);
    setCountdown(duration);
    if (isOpen) {
      const timer = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown <= 1) {
            setIsModalOpen(false);
            history.push("/");
            return 0;
          }
          return prevCountdown - 1;
        });
      }, 1000);

      return () => clearInterval(timer); // cleanup on unmount
    }
  }, [isOpen, duration, history]);

  return (
    <Modal
      isOpen={isModalOpen}
      style={{
        content: {
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        },
      }}
    >
      {networkStatus ? (
        <>
          <h2>{message}</h2>
          <p>Redirecting in {countdown} seconds...</p>
        </>
      ) : (
        <>
          <h2>Network Issue Detected</h2>
          <p>
            Your internet connection appears to be unstable. Please check your
            connection.
          </p>
        </>
      )}
    </Modal>
  );
};

export default TimedRedirectModal;
