/*
 * App.jsx: the app's list of pages (routes).
 * Purpose: decides which page shows for each URL.
 * What it does: wraps the sign-in pages in AuthLayout, keeps the other pages behind the
 * account checks, and runs DiagramConnectors for the interactive diagram effects.
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./jsx/Login";
import Register from "./jsx/Register";
import Dashboard from "./jsx/Dashboard";
import LearnBasics from "./jsx/LearnBasics";
import ClassObjects from "./jsx/ClassObjects";
import ClassConstruction from "./jsx/Classconstruction";
import ClassDiagramConstruction from "./jsx/ClassDiagramConstruction";
import SkillDevelopment from "./jsx/SkillDevelopment";
import RelationshipsMultiplicity from "./jsx/RelationshipsMultiplicity";
import FourOopPillars from "./jsx/FourOopPillars";
import ClassDiagramFormation from './jsx/ClassDiagramFormation';
import ForgotPassword from './jsx/ForgotPassword';
import ResetPassword from './jsx/ResetPassword';
import CompleteSignup from './jsx/CompleteSignup';
import ContinueWithEmail from './jsx/ContinueWithEmail';
import RequireAccountSetup from './components/RequireAccountSetup';
import AuthLayout from './components/design/AuthLayout';
import DiagramConnectors from './components/design/DiagramConnectors';
import ClassRelationships from './jsx/ClassRelationships';
import Multiplicity from './jsx/Multiplicity';
import ClassDiagramScenarios from "./jsx/ClassDiagramScenarios";
import OOPClassModeling from './jsx/OOPClassModeling';
import "./App.css";


function App() {
  return (
    <BrowserRouter>
      <DiagramConnectors />
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/continue-with-email" element={<ContinueWithEmail />} />
          <Route path="/complete-signup" element={<CompleteSignup />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route element={<RequireAccountSetup />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/learn-basics" element={<LearnBasics />} />
          <Route path="/learn-basics/classes-objects" element={<ClassObjects />} />
          <Route path="/learn-basics/relationships-multiplicity" element={<RelationshipsMultiplicity />} />
          <Route path="/learn-basics/four-oop-pillars" element={<FourOopPillars />} />
          <Route path="/skill-development" element={<SkillDevelopment />} />
          <Route path="/learn-basics/class-construction" element={<ClassConstruction />} />
          <Route path="/class-diagram-construction" element={<ClassDiagramConstruction />}/>
          <Route path="/class-diagram-construction/scenario" element={<ClassDiagramScenarios />} />
          <Route path="/skill-development/class-diagram-formation" element={<ClassDiagramFormation />} />
          <Route path="/skill-development/class-relationships" element={<ClassRelationships />} />
          <Route path="/skill-development/multiplicity" element={<Multiplicity />} />
          <Route path="/skill-development/oop-class-modeling" element={<OOPClassModeling />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
