
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./jsx/Login";
import Register from "./jsx/Register";
import Dashboard from "./jsx/Dashboard";
import LearnBasics from "./jsx/LearnBasics";
import MyProgress from "./jsx/MyProgress";
import ClassObjects from "./jsx/ClassObjects";
import ClassDiagramConstruction from "./jsx/ClassDiagramConstruction";
import SkillDevelopment from "./jsx/SkillDevelopment";
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
        <Route path="/skill-development" element={<SkillDevelopment />} />
        <Route path="/class-diagram-construction" element={<ClassDiagramConstruction />}/>
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/my-progress" element={<MyProgress />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
