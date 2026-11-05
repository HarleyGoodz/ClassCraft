// Question prompts, correct answers, and grading data for this activity.
export const RELATIONSHIP_SCENARIOS = [
  {
    id: 1,
    classA: "Student",
    classB: "Course",
    scenario: "A Student enrolls in Courses. A Student can enroll in many courses, and a Course can have many Students. Neither owns the other.",
    options: ["Association", "Inheritance", "Aggregation", "Composition"],
    correctAnswer: "Association",
    explanation: "Association is a simple connection. Neither class is a part of the other."
  },
  {
    id: 2,
    classA: "Dog",
    classB: "Animal",
    scenario: "A Dog is a specific type of Animal. It inherits the traits of the Animal class.",
    options: ["Association", "Inheritance", "Aggregation", "Composition"],
    correctAnswer: "Inheritance",
    explanation: "Inheritance is an 'is-a' relationship."
  },
  {
    id: 3,
    classA: "Department",
    classB: "Professor",
    scenario: "A Department has Professors. If the Department closes, the Professors still exist.",
    options: ["Association", "Inheritance", "Aggregation", "Composition"],
    correctAnswer: "Aggregation",
    explanation: "Aggregation is a weak 'has-a' relationship where the part can exist independently."
  },
  {
    id: 4,
    classA: "Car",
    classB: "Engine",
    scenario: "A Car has an Engine. If the Car is destroyed, the Engine is destroyed with it.",
    options: ["Association", "Inheritance", "Aggregation", "Composition"],
    correctAnswer: "Composition",
    explanation: "Composition is a strong 'has-a' relationship where the part cannot exist without the whole."
  },
  {
    id: 5,
    classA: "Playlist",
    classB: "Song",
    scenario: "A Playlist contains Songs, but Songs can exist without a Playlist and can be added to other Playlists.",
    options: ["Association", "Inheritance", "Aggregation", "Composition"],
    correctAnswer: "Aggregation",
    explanation: "Aggregation is a weak 'has-a' relationship: Songs can exist independently of a Playlist."
  },
  {
    id: 6,
    classA: "Library",
    classB: "Book",
    scenario: "A Library lends Books. A Book can be moved to another Library if the original Library closes.",
    options: ["Association", "Inheritance", "Aggregation", "Composition"],
    correctAnswer: "Aggregation",
    explanation: "Aggregation is a weak 'has-a' relationship: Books can exist and move independently of a Library."
  }
];
