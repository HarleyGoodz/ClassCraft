/*
 * App.jsx: the app's list of pages (routes).
 * Purpose: decides which page shows for each URL.
 * What it does: wraps the sign-in pages in AuthLayout, keeps the other pages behind the
 * account checks, and runs DiagramConnectors for the interactive diagram effects.
 */

import { useEffect } from "react";
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
import AdminLayout from './jsx/admin/AdminLayout';
import AdminHome from './jsx/admin/AdminHome';
import AdminAccounts from './jsx/admin/AdminAccounts';
import AdminAccountDetail from './jsx/admin/AdminAccountDetail';
import AdminActivities from './jsx/admin/AdminActivities';
import AdminTrends from './jsx/admin/AdminTrends';
import { playHoverSound } from "./utils/soundEffects";
import "./App.css";


function App() {
  useEffect(() => {
    function handlePointerOver(event) {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const control = target.closest(
        'button:not(:disabled):not([aria-disabled="true"]), a[href]:not([aria-disabled="true"]), [role="button"]:not([aria-disabled="true"]), [role="tab"]:not([aria-disabled="true"])'
      );
      if (!control || control.contains(event.relatedTarget)) return;

      playHoverSound();
    }

    document.addEventListener("pointerover", handlePointerOver);
    return () => document.removeEventListener("pointerover", handlePointerOver);
  }, []);

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
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminHome />} />
            <Route path="accounts" element={<AdminAccounts />} />
            <Route path="accounts/:userId" element={<AdminAccountDetail />} />
            <Route path="activities" element={<AdminActivities />} />
            <Route path="trends" element={<AdminTrends />} />
          </Route>
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
