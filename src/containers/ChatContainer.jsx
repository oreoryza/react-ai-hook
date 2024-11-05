import React, { useEffect, useState, createRef } from "react";
import ChatInput from "../components/ChatInput";
import ChatMessage from "../components/ChatMessage";
import Navbar from "../components/Navbar";
import Load from "../components/Load";
import { queryAI, logout } from "../utils/api";

const  ChatContainer = ({ token, setToken }) => {
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const endOfMessagesRef = createRef();

  const handleQuery = (e) => {
    e.preventDefault();
    scrollToBottom();
    setLoading(true);
    setError(null);

    queryAI({ query }, token)
      .then((res) => {
        setMessages([...messages, { query, data: res }]);
        setQuery("");
      })
      .catch((err) => {
        setError(err.message);
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  // Lifecycle method untuk scroll otomatis ke bawah saat ada pesan baru
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogout = () => {
    setLoading(true);
    logout(token)
      .then(() => {
        setToken(null);
        localStorage.removeItem("token");
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div>
      <Navbar logout={handleLogout} loading={loading} />
      <div className="container">
        {loading && messages.length === 0 ? (
          <Load />
        ) : (
          messages.map((message, index) => (
            <ChatMessage
              key={index}
              message={message.data.data}
              query={message.query}
              isLoading={loading}
              lastArray={index === messages.length - 1}
              currentQuery={query}
            />
          ))
        )}
        {/* Elemen referensi untuk scroll otomatis */}
        <div ref={endOfMessagesRef} />
      </div>
      <ChatInput
        query={query}
        onChange={handleChange}
        onSubmit={handleQuery}
        error={error}
      />
    </div>
  );
}

export default ChatContainer;