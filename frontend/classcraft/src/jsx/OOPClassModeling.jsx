import { useNavigate } from "react-router-dom";

export default function OOPClassModeling() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: "20px" }}>
      <h1>OOP-Based Class Modeling Exercise</h1>
      <p>Build a complete class diagram from a scenario using the four OOP pillars.</p>
      <p>This is where the actual exercise will go.</p>
      
      <button 
        onClick={() => navigate("/skill-development")}
        style={{ marginTop: "20px", padding: "10px 15px", cursor: "pointer" }}
      >
        ← Back to Skill Development
      </button>
    </div>
  );
}