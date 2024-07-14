import {
  useCallback,
  useState,
  useMemo,
  createContext,
  useContext,
} from "react";

export const UserContext = createContext();

export const useUser = () => {
  const contextUser = useContext(UserContext);
  if (!contextUser) {
    throw new Error("useUser deberia estar dentro de UserContextProvider");
  }
  return contextUser;
};
export function UserContextProvider({ children }) {
  const [isAuthenticated, setAuthenticated] = useState(
    localStorage.getItem("Auth") ?? false
  );
  const [codeParty, setCodeParty] = useState(
    localStorage.getItem("codeParty") ?? false
  );
  const [tokenParty, setTokenParty] = useState(
    localStorage.getItem("tokenParty") ?? false
  );
  const [userData, setUserData] = useState(() => {
    const storedData = localStorage.getItem("userData");
    return storedData ? JSON.parse(storedData) : [];
  });
  const party = useCallback(function (code, token) {
    localStorage.setItem("codeParty", code);
    localStorage.setItem("tokenParty", token);
    setCodeParty(code);
    setTokenParty(token);
  });
  const login = useCallback(function (token, data) {
    localStorage.setItem("Auth", true);
    localStorage.setItem("token", token);
    const datos = JSON.stringify({
      Id: data.Id,
      Nick: data.Nick,
      Email: data.Email,
      Points: data.Puntos,
      Photo: data.Photo,
    });
    setUserData(datos);
    localStorage.setItem("userData", datos);
    setAuthenticated(true);
  }, []);
  const logout = useCallback(function () {
    localStorage.removeItem("Auth");
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    localStorage.removeItem("codeParty");
    localStorage.removeItem("tokenParty");
    localStorage.removeItem("inRoom");
    localStorage.removeItem("inGame");
    localStorage.removeItem("finnish");
    setAuthenticated(false);
    setUserData([]);
  }, []);
  const value = useMemo(
    () => ({
      login,
      logout,
      isAuthenticated,
      userData,
      codeParty,
      party,
      tokenParty,
    }),
    [login, logout, isAuthenticated, userData, codeParty, party, tokenParty]
  );
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
