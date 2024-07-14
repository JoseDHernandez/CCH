import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import PublicRoute from "./components/Routes/PublicRoute";
import PrivateRoute from "./components/Routes/PrivateRoute";
import { NavBar } from "./components/Navbar";
import "tailwindcss/tailwind.css";
import { UserContextProvider } from "./context/User.context";

// Lazy load components
const Index = lazy(() => import("./pages/Index"));
const Cards = lazy(() => import("./pages/Cards"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Salas = lazy(() => import("./pages/Salas"));
const Rules = lazy(() => import("./pages/Rules"));
const Partida = lazy(() => import("./pages/Partida"));
const User = lazy(() => import("./pages/User"));
const NotFound = lazy(() => import("./pages/NotFound"));

const App = () => {
  return (
    <UserContextProvider>
      <NavBar />
      <div className="containter p-5  min-h-screen">
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<PublicRoute />}>
              <Route index element={<Index />} />
              <Route path="/cards" element={<Cards />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>
            <Route path="/Game" element={<PrivateRoute />}>
              <Route index element={<Salas />} />
              <Route path="/Game/rules" element={<Rules />} />
              <Route path="/Game/party" element={<Partida />} />
              <Route path="/Game/user" element={<User />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
    </UserContextProvider>
  );
};

export default App;
