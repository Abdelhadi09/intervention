import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

// Pages (empty for now)
import Login from "../auth/Login";
import NewDemande from "../user/pages/NewDemande";
import MyDemandes from "../user/pages/MyDemandes";
import ITDashboard from "../it/pages/ITDashboard";
 import DemandeDetails from "../user/pages/DemandeDetails";
 import ITDemandeDetails from "../it/pages/DemandeDetailsIT";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* USER */}
      <Route
        path="/user/demandes"
        element={
          <ProtectedRoute role="USER">
            <MyDemandes />
          </ProtectedRoute>
        }
      />

      <Route
        path="/user/demandes/new"
        element={
          <ProtectedRoute role="USER">
            <NewDemande />
          </ProtectedRoute>
        }
      />

     

<Route
  path="/user/demandes/:id"
  element={
    <ProtectedRoute role="USER">
      <DemandeDetails />
    </ProtectedRoute>
  }
/>


      {/* IT */}
      <Route
        path="/it/dashboard"
        element={
          <ProtectedRoute role="IT_ADMIN">
            <ITDashboard />
          </ProtectedRoute>
        }
      />

      <Route
  path="/it/demandes/:id"
  element={
    <ProtectedRoute role="IT_ADMIN">
      <ITDemandeDetails />
    </ProtectedRoute>
  }
/>
    </Routes>

    
  );
}
