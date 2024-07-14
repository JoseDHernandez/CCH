import { useContext, useState } from "react";
import { createContext } from "react";
import { logrosUserRequest } from "../api/users.api";
import {
  getCardsBlackRequest,
  deleteCardRequest,
  createCardsBlackRequest,
} from "../api/cards.api";
export const CardContext = createContext();
export const useCards = () => {
  const context = useContext(CardContext);
  if (!context) {
    throw new Error("useCards deberia estar dentro de CardContextProvider");
  }
  return context;
};
export const CardContextProvider = ({ children }) => {
  const [cards, setCards] = useState([]);
  async function loadCards() {
    const response = await getCardsBlackRequest();
    setCards(response.data);
  }
  const deleteCard = async (id) => {
    try {
      const response = await deleteCardRequest(id);
      setCards(cards.filter((cards) => cards.id !== id));
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };
  const createCard = async (values) => {
    try {
      const response = await createCardsBlackRequest(values);
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <CardContext.Provider
      value={{
        cards,
        loadCards,
        deleteCard,
        createCard,
      }}
    >
      {children}
    </CardContext.Provider>
  );
};
