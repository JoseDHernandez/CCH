import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../../context/User.context";
const PrivateRoute = () => {
  const { isAuthenticated, codeParty } = useUser();

  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }
  if (codeParty.lenght > 0) {
    return <Navigate to={"/Game/party"} />;
  }
  return (
    <>
      <Outlet />
    </>
  );
};

export default PrivateRoute;
