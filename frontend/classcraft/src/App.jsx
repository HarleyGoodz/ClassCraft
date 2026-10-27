
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./jsx/Login";
import Register from "./jsx/Register";
import Dashboard from "./jsx/Dashboard";
import LearnBasics from "./jsx/LearnBasics";
import MyProgress from "./jsx/MyProgress";
import ClassObjects from "./jsx/ClassObjects";
import ClassConstruction from "./jsx/Classconstruction";
import ClassDiagramConstruction from "./jsx/ClassDiagramConstruction";
import SkillDevelopment from "./jsx/SkillDevelopment";
import RelationshipsMultiplicity from "./jsx/RelationshipsMultiplicity";
import FourOopPillars from "./jsx/FourOopPillars";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/learn-basics" element={<LearnBasics />} />
        <Route path="/learn-basics/classes-objects" element={<ClassObjects />} />
        <Route
          path="/learn-basics/relationships-multiplicity"
          element={<RelationshipsMultiplicity />}
        />
        <Route
          path="/learn-basics/four-oop-pillars"
          element={<FourOopPillars />}
        />
        <Route path="/skill-development" element={<SkillDevelopment />} />
        <Route path="/learn-basics/class-construction" element={<ClassConstruction />} />
        <Route path="/class-diagram-construction" element={<ClassDiagramConstruction />}/>
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/my-progress" element={<MyProgress />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
