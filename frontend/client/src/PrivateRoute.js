import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children, adminOnly = false }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // not logged in
  if (!token) {
    return <Navigate to="/login" />;
  }

  // admin page but user is not admin
  if (adminOnly && role !== "admin") {
    alert("Access denied. Admin only.");
    return <Navigate to="/" />;
  }

  return children;
}
