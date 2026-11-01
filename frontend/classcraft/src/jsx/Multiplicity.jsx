import { useNavigate } from "react-router-dom";

export default function Multiplicity() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: "20px" }}>
      <h1>Multiplicity Exercise</h1>
      <p>Assign the correct multiplicity notation to relationships in a sample class diagram.</p>
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