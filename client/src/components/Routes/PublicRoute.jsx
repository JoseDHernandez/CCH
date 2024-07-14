import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../../context/User.context";
const PublicRoute = () => {
  const { isAuthenticated, codeParty } = useUser();
  if (isAuthenticated) {
    return <Navigate to={"/Game"} />;
  }
  if (codeParty.lenght > 0 && isAuthenticated) {
    return <Navigate to={"/Game/party"} />;
  }
  return (
    <div>
      <Outlet />
    </div>
  );
};

export default PublicRoute;
