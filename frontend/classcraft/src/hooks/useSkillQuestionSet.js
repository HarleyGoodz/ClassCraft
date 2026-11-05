import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import { loadLearningAttempts } from "../utils/learningAttempts";
import { getSkillPracticeQuestions } from "../utils/skillQuestionSelection";

export function useSkillQuestionSet(activityKey, questionBank, initialQuestions = null) {
  const hasInitialQuestions = isValidQuestionSet(initialQuestions, questionBank);
  const [questions, setQuestions] = useState(() =>
    hasInitialQuestions ? initialQuestions : []
  );
  const [loading, setLoading] = useState(!hasInitialQuestions);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isValidQuestionSet(initialQuestions, questionBank)) return undefined;

    let active = true;

    async function loadQuestions() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw new Error(authError.message);
        if (!user) throw new Error("Sign in to load your Skill Development questions.");

        const attempts = await loadLearningAttempts();
        if (active) {
          const selectedQuestions = getSkillPracticeQuestions(
            activityKey,
            questionBank,
            attempts
          );
          if (selectedQuestions.length === 0) {
            throw new Error(
              "There are no questions available to practice. Return to Skill Development and choose a practice focus with available scenarios."
            );
          }
          setQuestions(selectedQuestions);
        }
      } catch (loadError) {
        if (active) setError(loadError.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadQuestions();
    return () => {
      active = false;
    };
  }, [activityKey, initialQuestions, questionBank]);

  return { questions, loading, error };
}

function isValidQuestionSet(questions, questionBank) {
  return (
    Array.isArray(questions) &&
    questions.length > 0 &&
    new Set(questions.map((question) => String(question.id))).size === questions.length &&
    questions.every((question) =>
      questionBank.some((bankQuestion) => String(bankQuestion.id) === String(question.id))
    )
  );
}
