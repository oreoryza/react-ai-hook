import React, { Component } from "react";
import ChatInput from "../components/ChatInput";
import ChatMessage from "../components/ChatMessage";
import Navbar from "../components/Navbar";
import Load from "../components/Load";
import { queryAI, logout } from "../utils/api";

export default class ChatContainer extends Component {
  state = {
    messages: [],
    loading: false,
    error: null,
    query: "",
  };

  endOfMessagesRef = React.createRef();

  handleQuery = (e) => {
    e.preventDefault();
    this.scrollToBottom();
    const { query } = this.state;
    this.setState({ loading: true, error: null });

    queryAI({ query }, this.props.token)
      .then((res) => {
        this.setState({
          messages: [...this.state.messages, { query, data: res }],
          query: "",
        });
      })
      .catch((err) => {
        this.setState({ error: err.message });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  handleChange = (e) => {
    this.setState({ query: e.target.value });
  };

  // Lifecycle method untuk scroll otomatis ke bawah saat ada pesan baru
  componentDidUpdate(prevProps, prevState) {
    if (prevState.messages !== this.state.messages) {
      this.scrollToBottom();
    }
  }

  scrollToBottom = () => {
    this.endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
  };

  handleLogout = () => {
    this.setState({ loading: true });
    logout(this.props.token)
      .then(() => {
        this.props.setToken(null);
        localStorage.removeItem("token");
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  render() {
    return (
      <div>
        <Navbar logout={this.handleLogout} loading={this.state.loading} />
        <div className="container">
          {this.state.loading && this.state.messages.length === 0 ? (
            <Load />
          ) : (
            this.state.messages.map((message, index) => (
              <ChatMessage
                key={index}
                message={message.data.data}
                query={message.query}
                isLoading={this.state.loading}
                lastArray={index === this.state.messages.length - 1}
                currentQuery={this.state.query}
              />
            ))
          )}
          {/* Elemen referensi untuk scroll otomatis */}
          <div ref={this.endOfMessagesRef} />
        </div>
        <ChatInput
          onSubmit={this.handleQuery}
          onChange={this.handleChange}
          loading={this.state.loading}
          query={this.state.query}
        />
      </div>
    );
  }
}
