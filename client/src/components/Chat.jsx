import React from "react";
import { useState, useEffect, useRef } from "react";
import { socket } from "../api/config";
import { useUser } from "../context/User.context";
import { Button } from "../components/Button";
export const Chat = () => {
  const { tokenParty, userData } = useUser();
  const [chatHistory, setChatHistory] = useState([]);
  const [inputChat, setInputChat] = useState("");
  const [chatSubmit, setChatSubmit] = useState(false);

  const chatContainerRef = useRef(null);

  function downChat() {
    if (chatContainerRef.current) {
      const chatContainer = chatContainerRef.current;
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }
  function chat() {
    setChatSubmit(true);
    let value = inputChat.trim();
    if (inputChat.length >= 250) {
      value = value.substring(0, 250);
    }
    setInputChat("");
    const regex = new RegExp(/^[a-zA-ZÀ-ÿ0-9.,"'\s+]{3,250}$/);
    if (regex.test(value)) {
      socket.emit("client:chat", {
        msg: value,
        nick: userData.Nick,
        photo: userData.Photo,
        token: tokenParty,
      });
    }
    setChatSubmit(false);
  }
  function getChat() {
    socket.on("server:chat", (data) => {
      const { message, nick, photo } = data;
      const newMessage = {
        message: message,
        nick: nick,
        photo: photo,
      };
      setChatHistory((prevChatHistory) => [...prevChatHistory, newMessage]);
    });
  }
  function renderChat() {
    if (chatHistory.length === 0)
      return (
        <div className=" flex items-center justify-center h-full">
          <p className="text-4xl opacity-80">No hay mensajes.</p>
        </div>
      );
    return chatHistory.map((data, index) => (
      <div
        className={`p-2 grid grid-cols-8 grid-rows-2 border-2 border-black rounded-xl mb-2 shadow-md my-1  ${
          index == chatHistory.length - 1 ? " snap-center" : ""
        } ${data.nick === userData.Nick ? "bg-gray-200 " : "bg-white"}`}
        key={index}
      >
        <img
          src={`${data.photo}`}
          className={`w-20 h-20 rounded-lg border-2 row-span-2 ${
            data.nick === userData.Nick
              ? "border-gray-500 col-start-8 row-start-1 ml-3"
              : "border-black"
          }`}
        />
        <h3
          className={`c ${data.nick === userData.Nick ? "col-start-6 " : ""}`}
        >
          {data.nick}
        </h3>
        <p
          className={`border-2  p-2 rounded-md col-span-7 bg-gray-200 whitespace-normal ${
            data.nick === userData.Nick &&
            " border-gray-500 bg-white  text-black"
          }`}
        >
          {data.message}
        </p>
      </div>
    ));
  }
  useEffect(() => {
    getChat();
    downChat();
    return () => {
      socket.off("server:chat");
    };
  }, [chatHistory]);
  return (
    <div className="w-full p-3 bg-white h-96 border-2 border-black rounded-2xl overflow-hidden">
      <div className="h-5/6 overflow-y-scroll snap-y" ref={chatContainerRef}>
        {renderChat()}
      </div>
      <div className="inline">
        <input
          type="text"
          maxlenght="250"
          className="w-5/6 border-black border-2 rounded-lg p-2 text-2xl mr-5"
          value={inputChat}
          onChange={(e) => setInputChat(e.target.value)}
          disabled={chatSubmit}
        />
        <Button text={"Enviar"} Disable={chatSubmit} onClick={() => chat()} />
      </div>
    </div>
  );
};

export default Chat;
