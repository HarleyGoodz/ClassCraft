import { useEffect, useRef, useState } from "react";
import { supabase } from "../utils/supabase";
import {
  getCachedLearningAttempts,
  loadLearningAttempts,
  recordLearningAttempt,
} from "../utils/learningAttempts";

export function useLearningAttemptTracking(initialAttempts = []) {
  const [trackingError, setTrackingError] = useState("");
  const [attempts, setAttempts] = useState(initialAttempts);
  const [priorAttempts, setPriorAttempts] = useState(initialAttempts);
  const recordedAttemptIds = useRef(new Set());

  useEffect(() => {
    let active = true;

    async function refreshAttempts() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw new Error(error.message);
        const userId = data.session?.user?.id;
        if (userId) {
          const cachedAttempts = getCachedLearningAttempts(userId);
          setAttempts((current) => mergeAttempts(cachedAttempts, current));
          setPriorAttempts((current) =>
            mergeAttempts(
              cachedAttempts.filter((attempt) => !recordedAttemptIds.current.has(attempt.id)),
              current
            )
          );
        }

        const loadedAttempts = await loadLearningAttempts();
        if (active) {
          setAttempts((current) => mergeAttempts(loadedAttempts, current));
          setPriorAttempts((current) =>
            mergeAttempts(
              loadedAttempts.filter((attempt) => !recordedAttemptIds.current.has(attempt.id)),
              current
            )
          );
        }
      } catch (error) {
        if (!active) return;
        console.error("Could not load previous learning attempts:", error);
        setTrackingError(`Previous progress could not be loaded: ${error.message}`);
      }
    }

    refreshAttempts();
    return () => {
      active = false;
    };
  }, []);

  const recordAttempt = async (attempt) => {
    try {
      const savedAttempt = await recordLearningAttempt(attempt);
      recordedAttemptIds.current.add(savedAttempt.id);
      setAttempts((previous) => [...previous, savedAttempt]);
      setTrackingError("");
      return savedAttempt;
    } catch (error) {
      console.error("Could not save learning attempt:", error);
      setTrackingError(`Progress could not be saved: ${error.message}`);
      return null;
    }
  };

  return { attempts, priorAttempts, recordAttempt, trackingError };
}

function mergeAttempts(...attemptLists) {
  const attemptsById = new Map();
  attemptLists.flat().forEach((attempt, index) => {
    const key = attempt.id ?? `${attempt.activityKey}:${attempt.scenarioKey}:${attempt.attemptNumber ?? index}`;
    attemptsById.set(key, attempt);
  });
  return [...attemptsById.values()];
}
