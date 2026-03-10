import React from "react";

function WhatsApp() {
  const openWhatsApp = () => {
    window.open("https://web.whatsapp.com", "_blank");
  };

  return (
    <button onClick={openWhatsApp}>
      Open WhatsApp
    </button>
  );
}

export default WhatsApp;