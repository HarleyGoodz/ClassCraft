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
  {
    id: 7,
    classA: "Doctor",
    classB: "Patient",
    scenario: "A Doctor treats Patients. A Doctor can treat many Patients, and a Patient can see many Doctors. Neither owns the other.",
    options: ["Association", "Inheritance", "Aggregation", "Composition"],
    correctAnswer: "Association",
    checkQuestions: {
      Association: "Is one of these classes a part of the other?",
      Inheritance: "Is a Doctor a kind of Patient?",
      Aggregation: "Is a Doctor made up of Patients?",
      Composition: "Are Patients destroyed when a Doctor retires?",
    },
  },
  {
    id: 8,
    classA: "SavingsAccount",
    classB: "Account",
    scenario: "A SavingsAccount is a specific type of Account. It inherits the account number and balance of the Account class.",
    options: ["Association", "Inheritance", "Aggregation", "Composition"],
    correctAnswer: "Inheritance",
    checkQuestions: {
      Association: "Is a SavingsAccount just linked to an Account?",
      Inheritance: "Is a SavingsAccount a kind of Account?",
      Aggregation: "Does an Account have a SavingsAccount inside it?",
      Composition: "Is a SavingsAccount a part of an Account?",
    },
  },
  {
    id: 9,
    classA: "Company",
    classB: "Employee",
    scenario: "A Company has Employees. If the Company shuts down, the Employees still exist and can work somewhere else.",
    options: ["Association", "Inheritance", "Aggregation", "Composition"],
    correctAnswer: "Aggregation",
    checkQuestions: {
      Association: "Is an Employee a part of a Company?",
      Inheritance: "Is an Employee a kind of Company?",
      Aggregation: "Can the Employees exist if the Company shuts down?",
      Composition: "Are the Employees destroyed when the Company shuts down?",
    },
  },
  {
    id: 10,
    classA: "Hotel",
    classB: "Room",
    scenario: "A Hotel has Rooms. If the Hotel building is demolished, its Rooms are destroyed with it.",
    options: ["Association", "Inheritance", "Aggregation", "Composition"],
    correctAnswer: "Composition",
    checkQuestions: {
      Association: "Is a Room a part of a Hotel?",
      Inheritance: "Is a Room a kind of Hotel?",
      Aggregation: "Can the Rooms exist if the Hotel is demolished?",
      Composition: "Are the Rooms destroyed when the Hotel is demolished?",
    },
  },
  {
    id: 11,
    classA: "Driver",
    classB: "Vehicle",
    scenario: "A Driver drives Vehicles. A Driver can drive different Vehicles, and a Vehicle can be driven by different Drivers. Neither owns the other.",
    options: ["Association", "Inheritance", "Aggregation", "Composition"],
    correctAnswer: "Association",
    checkQuestions: {
      Association: "Is one of these classes a part of the other?",
      Inheritance: "Is a Driver a kind of Vehicle?",
      Aggregation: "Is a Driver made up of Vehicles?",
      Composition: "Are Vehicles destroyed when a Driver stops driving?",
    },
  },
  {
    id: 12,
    classA: "Manager",
    classB: "Employee",
    scenario: "A Manager is a specific type of Employee. It inherits the employee ID and salary of the Employee class.",
    options: ["Association", "Inheritance", "Aggregation", "Composition"],
    correctAnswer: "Inheritance",
    checkQuestions: {
      Association: "Is a Manager just linked to an Employee?",
      Inheritance: "Is a Manager a kind of Employee?",
      Aggregation: "Does an Employee have a Manager inside it?",
      Composition: "Is a Manager a part of an Employee?",
    },
  },
  {
    id: 13,
    classA: "ShoppingCart",
    classB: "Product",
    scenario: "A ShoppingCart holds Products, but Products still exist in the store if the cart is emptied or abandoned.",
    options: ["Association", "Inheritance", "Aggregation", "Composition"],
    correctAnswer: "Aggregation",
    checkQuestions: {
      Association: "Is a Product a part of a ShoppingCart?",
      Inheritance: "Is a Product a kind of ShoppingCart?",
      Aggregation: "Can Products exist without a ShoppingCart?",
      Composition: "Are Products destroyed when the ShoppingCart is emptied?",
    },
  },
  {
    id: 14,
    classA: "Order",
    classB: "OrderItem",
    scenario: "An Order has OrderItems, one for each dish ordered. If the Order is deleted, its OrderItems are deleted with it.",
    options: ["Association", "Inheritance", "Aggregation", "Composition"],
    correctAnswer: "Composition",
    checkQuestions: {
      Association: "Is an OrderItem a part of an Order?",
      Inheritance: "Is an OrderItem a kind of Order?",
      Aggregation: "Can the OrderItems exist if the Order is deleted?",
      Composition: "Are the OrderItems deleted when the Order is deleted?",
    },
  },
  {
    id: 15,
    classA: "Cashier",
    classB: "Customer",
    scenario: "A Cashier serves Customers. A Cashier serves many Customers, and a Customer can be served by different Cashiers. Neither owns the other.",
    options: ["Association", "Inheritance", "Aggregation", "Composition"],
    correctAnswer: "Association",
    checkQuestions: {
      Association: "Is one of these classes a part of the other?",
      Inheritance: "Is a Cashier a kind of Customer?",
      Aggregation: "Is a Cashier made up of Customers?",
      Composition: "Are Customers destroyed when a Cashier's shift ends?",
    },
  },
  {
    id: 16,
    classA: "Truck",
    classB: "Vehicle",
    scenario: "A Truck is a specific type of Vehicle. It inherits the plate number and color of the Vehicle class.",
    options: ["Association", "Inheritance", "Aggregation", "Composition"],
    correctAnswer: "Inheritance",
    checkQuestions: {
      Association: "Is a Truck just linked to a Vehicle?",
      Inheritance: "Is a Truck a kind of Vehicle?",
      Aggregation: "Does a Vehicle have a Truck inside it?",
      Composition: "Is a Truck a part of a Vehicle?",
    },
  },
  {
    id: 17,
    classA: "ParkingLot",
    classB: "Vehicle",
    scenario: "A ParkingLot holds Vehicles. If the ParkingLot closes, the Vehicles still exist and can park somewhere else.",
    options: ["Association", "Inheritance", "Aggregation", "Composition"],
    correctAnswer: "Aggregation",
    checkQuestions: {
      Association: "Is a Vehicle a part of a ParkingLot?",
      Inheritance: "Is a Vehicle a kind of ParkingLot?",
      Aggregation: "Can the Vehicles exist if the ParkingLot closes?",
      Composition: "Are the Vehicles destroyed when the ParkingLot closes?",
    },
  },
  {
    id: 18,
    classA: "School",
    classB: "Classroom",
    scenario: "A School has Classrooms. If the School building is demolished, its Classrooms are destroyed with it.",
    options: ["Association", "Inheritance", "Aggregation", "Composition"],
    correctAnswer: "Composition",
    checkQuestions: {
      Association: "Is a Classroom a part of a School?",
      Inheritance: "Is a Classroom a kind of School?",
      Aggregation: "Can the Classrooms exist if the School is demolished?",
      Composition: "Are the Classrooms destroyed when the School is demolished?",
    },
  },
  {
    id: 19,
    classA: "Trainer",
    classB: "Member",
    scenario: "A Trainer coaches gym Members. A Trainer can coach many Members, and a Member can work with different Trainers. Neither owns the other.",
    options: ["Association", "Inheritance", "Aggregation", "Composition"],
    correctAnswer: "Association",
    checkQuestions: {
      Association: "Is one of these classes a part of the other?",
      Inheritance: "Is a Trainer a kind of Member?",
      Aggregation: "Is a Trainer made up of Members?",
      Composition: "Are Members destroyed when a Trainer leaves the gym?",
    },
  },
  {
    id: 20,
    classA: "ElectricBill",
    classB: "Bill",
    scenario: "An ElectricBill is a specific type of Bill. It inherits the amount due and due date of the Bill class.",
    options: ["Association", "Inheritance", "Aggregation", "Composition"],
    correctAnswer: "Inheritance",
    checkQuestions: {
      Association: "Is an ElectricBill just linked to a Bill?",
      Inheritance: "Is an ElectricBill a kind of Bill?",
      Aggregation: "Does a Bill have an ElectricBill inside it?",
      Composition: "Is an ElectricBill a part of a Bill?",
    },
  },
  {
    id: 21,
    classA: "RentalAgency",
    classB: "Car",
    scenario: "A RentalAgency has Cars. If the RentalAgency closes, the Cars still exist and can be sold to another agency.",
    options: ["Association", "Inheritance", "Aggregation", "Composition"],
    correctAnswer: "Aggregation",
    checkQuestions: {
      Association: "Is a Car a part of a RentalAgency?",
      Inheritance: "Is a Car a kind of RentalAgency?",
      Aggregation: "Can the Cars exist if the RentalAgency closes?",
      Composition: "Are the Cars destroyed when the RentalAgency closes?",
    },
  },
  {
    id: 22,
    classA: "Account",
    classB: "Transaction",
    scenario: "An Account has Transactions that record each deposit and withdrawal. If the Account is deleted, its Transactions are deleted with it.",
    options: ["Association", "Inheritance", "Aggregation", "Composition"],
    correctAnswer: "Composition",
    checkQuestions: {
      Association: "Is a Transaction a part of an Account?",
      Inheritance: "Is a Transaction a kind of Account?",
      Aggregation: "Can the Transactions exist if the Account is deleted?",
      Composition: "Are the Transactions deleted when the Account is deleted?",
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