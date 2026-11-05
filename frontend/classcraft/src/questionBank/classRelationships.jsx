// Question prompts, correct answers, and grading data for this activity.
//
// Feedback rules:
//   - A WRONG pick never names or describes the correct answer.
//     It explains what the learner's OWN choice means, then asks one short question
//     (checkQuestions) that makes them check that choice against the scenario.
//   - A CORRECT pick just confirms the choice and what it means.
//
// The page shows getRelationshipFeedback(scenario, selectedOption).
// correctAnswer is only used for grading. Never show it on screen.

// What each relationship means (one short sentence each)
export const RELATIONSHIP_MEANING = {
  Association: "a simple link where neither class is part of the other.",
  Inheritance: "an \"is a\" link where one class is a kind of the other.",
  Aggregation: "a \"has a\" link where the parts can exist on their own.",
  Composition: "a \"has a\" link where the parts cannot exist without the whole.",
};

export const RELATIONSHIP_SCENARIOS = [
  {
    id: 1,
    classA: "Student",
    classB: "Course",
    scenario: "A Student enrolls in Courses. A Student can enroll in many courses, and a Course can have many Students. Neither owns the other.",
    options: ["Association", "Inheritance", "Aggregation", "Composition"],
    correctAnswer: "Association",
    // one question per relationship: it tests THAT relationship against the scenario
    checkQuestions: {
      Association: "Is one of these classes a part of the other?",
      Inheritance: "Is a Student a kind of Course?",
      Aggregation: "Is a Course made up of Students?",
      Composition: "Are Students destroyed when a Course ends?",
    },
  },
  {
    id: 2,
    classA: "Dog",
    classB: "Animal",
    scenario: "A Dog is a specific type of Animal. It inherits the traits of the Animal class.",
    options: ["Association", "Inheritance", "Aggregation", "Composition"],
    correctAnswer: "Inheritance",
    checkQuestions: {
      Association: "Is a Dog just linked to an Animal?",
      Inheritance: "Is a Dog a kind of Animal?",
      Aggregation: "Does an Animal have a Dog inside it?",
      Composition: "Is a Dog a part of an Animal?",
    },
  },
  {
    id: 3,
    classA: "Department",
    classB: "Professor",
    scenario: "A Department has Professors. If the Department closes, the Professors still exist.",
    options: ["Association", "Inheritance", "Aggregation", "Composition"],
    correctAnswer: "Aggregation",
    checkQuestions: {
      Association: "Is a Professor a part of a Department?",
      Inheritance: "Is a Professor a kind of Department?",
      Aggregation: "Can the Professors exist if the Department closes?",
      Composition: "Are the Professors destroyed when the Department closes?",
    },
  },
  {
    id: 4,
    classA: "Car",
    classB: "Engine",
    scenario: "A Car has an Engine. If the Car is destroyed, the Engine is destroyed with it.",
    options: ["Association", "Inheritance", "Aggregation", "Composition"],
    correctAnswer: "Composition",
    checkQuestions: {
      Association: "Is an Engine a part of a Car?",
      Inheritance: "Is an Engine a kind of Car?",
      Aggregation: "Can the Engine exist if the Car is destroyed?",
      Composition: "Is the Engine destroyed when the Car is destroyed?",
    },
  },
  {
    id: 5,
    classA: "Playlist",
    classB: "Song",
    scenario: "A Playlist contains Songs, but Songs can exist without a Playlist and can be added to other Playlists.",
    options: ["Association", "Inheritance", "Aggregation", "Composition"],
    correctAnswer: "Aggregation",
    checkQuestions: {
      Association: "Is a Song a part of a Playlist?",
      Inheritance: "Is a Song a kind of Playlist?",
      Aggregation: "Can Songs exist without a Playlist?",
      Composition: "Are Songs destroyed when the Playlist is deleted?",
    },
  },
  {
    id: 6,
    classA: "Library",
    classB: "Book",
    scenario: "A Library lends Books. A Book can be moved to another Library if the original Library closes.",
    options: ["Association", "Inheritance", "Aggregation", "Composition"],
    correctAnswer: "Aggregation",
    checkQuestions: {
      Association: "Is a Book a part of a Library?",
      Inheritance: "Is a Book a kind of Library?",
      Aggregation: "Can a Book exist if its Library closes?",
      Composition: "Are Books destroyed when the Library closes?",
    },
  },
];

// Used when a scenario has no checkQuestions of its own
// (for example, questions that were loaded from the backend)
function fallbackQuestion(relationship, scenario) {
  const a = scenario.classA;
  const b = scenario.classB;
  switch (relationship) {
    case "Association":
      return `Is a ${a} or a ${b} a part of the other?`;
    case "Inheritance":
      return `Is a ${a} a kind of ${b}, or a ${b} a kind of ${a}?`;
    case "Aggregation":
      return `If a ${a} or a ${b} is removed, can the other still exist?`;
    case "Composition":
      return "If one of them is destroyed, is the other destroyed too?";
    default:
      return "Re-read the scenario and look for the clue.";
  }
}

/**
 * Returns { correct, title, message } for the option the learner picked.
 *
 * Wrong example (Department / Professor, learner picked Composition):
 *   "Not quite."
 *   "Composition is a "has a" link where the parts cannot exist without the whole.
 *    Check the scenario: Are the Professors destroyed when the Department closes?"
 *
 * It never reveals the correct answer.
 */
export function getRelationshipFeedback(scenario, selectedOption) {
  const meaning = RELATIONSHIP_MEANING[selectedOption] ?? "";

  if (selectedOption === scenario.correctAnswer) {
    return {
      correct: true,
      title: "Correct!",
      message: `${selectedOption} is ${meaning}`,
    };
  }

  const check =
    scenario.checkQuestions?.[selectedOption] ?? fallbackQuestion(selectedOption, scenario);

  return {
    correct: false,
    title: "Not quite.",
    message: `${selectedOption} is ${meaning} Check the scenario: ${check}`,
  };
}