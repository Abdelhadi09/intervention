import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

// Pages (empty for now)
import Login from "../auth/Login";
import NewDemande from "../user/pages/NewDemande";
import EquipmentDemande from "../user/pages/DemandeEquipement";
import MyDemandes from "../user/pages/MyDemandes";
import ITDashboard from "../it/pages/ITDashboard";
import DemandeReception from "../it/pages/DemandeReparation";

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
        path="/user/demandes/equipment"
        element={
          <ProtectedRoute role="USER">
            <EquipmentDemande />
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
        path="/it/demandes/reparation"
        element={
          <ProtectedRoute role="IT_ADMIN">
            <DemandeReception />
          </ProtectedRoute>
        }
      />

     
    </Routes>

    
  );
}
