const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// Returns a message if the address can't receive mail, otherwise "".
// If the check itself can't run, signup continues: the confirmation email still
// has to be clicked before the account works.
export async function findEmailProblem(email) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/email-check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) return "";

    const result = await response.json();
    return result.valid === false ? result.error : "";
  } catch {
    return "";
  }
}
