// Question prompts, correct answers, and grading data for this activity.
export const MULTIPLICITY_SCENARIOS = [
  {
    id: 1,
    classA: "Student",
    classB: "Course",
    scenario: "A Student can enroll in many courses. A Course can have many students.",
    correctA: "0..*", 
    correctB: "0..*", 
    explanation: "Both ends are '0..*' (or '*') because a student can take zero or many courses, and a course can have zero or many students."
  },
  {
    id: 2,
    classA: "Department",
    classB: "Manager",
    scenario: "A Department has exactly one Manager. A Manager manages exactly one Department.",
    correctA: "1", 
    correctB: "1", 
    explanation: "Both ends are '1' because it is a strict one-to-one relationship."
  },
  {
    id: 3,
    classA: "Customer",
    classB: "Order",
    scenario: "A Customer can place many orders (or none if they are new). Every Order must belong to exactly one Customer.",
    correctA: "1", 
    correctB: "0..*", 
    explanation: "A customer is exactly '1', but they can have '0..*' orders. Every order has exactly 1 customer."
  },
  {
    id: 4,
    classA: "Car",
    classB: "LicensePlate",
    scenario: "A Car has exactly one License Plate. A License Plate belongs to exactly one Car.",
    correctA: "1",
    correctB: "1",
    explanation: "Both are '1' because a car has one plate, and a plate belongs to one car."
  },
  {
    id: 5,
    classA: "Teacher",
    classB: "Student",
    scenario: "A Teacher teaches one or many Students. A Student is taught by exactly one Teacher.",
    correctA: "1", // Teacher end
    correctB: "1..*", // Student end
    explanation: "A teacher is '1', but they must teach at least one student ('1..*')."
  },
  {
    id: 6,
    classA: "Person",
    classB: "Passport",
    scenario: "A Person can have zero or one Passport. A Passport belongs to exactly one Person.",
    correctA: "1",
    correctB: "0..1",
    explanation: "A passport belongs to exactly '1' person. A person can have '0..1' passports (they might not have one).",
  },
  {
    id: 7,
    classA: "Company",
    classB: "Employee",
    scenario: "A Company employs zero or many Employees. An Employee works for exactly one Company.",
    correctA: "1",
    correctB: "0..*",
    explanation: "A company is '1'. Employees are '0..*' because a company can have zero employees (just started) or many.",
  },
  {
    id: 8,
    classA: "Team",
    classB: "Player",
    scenario: "A Team has one or many Players. A Player belongs to zero or one Team (free agent).",
    correctA: "0..1",
    correctB: "1..*",
    explanation: "A team has '1..*' players. A player can be a free agent, so they belong to '0..1' teams.",
  },
  {
    id: 9,
    classA: "Author",
    classB: "Book",
    scenario: "An Author can write zero or many Books. A Book must be written by one or many Authors.",
    correctA: "1..*",
    correctB: "0..*",
    explanation: "An author can write '0..*' books. A book must have at least '1..*' authors.",
  },
  {
    id: 10,
    classA: "Patient",
    classB: "Doctor",
    scenario: "A Patient can visit one or many Doctors. A Doctor can treat zero or many Patients.",
    correctA: "0..*",
    correctB: "1..*",
    explanation: "A patient visits '1..*' doctors. A doctor treats '0..*' patients.",
  },
  {
    id: 11,
    classA: "ShoppingCart",
    classB: "Item",
    scenario: "A ShoppingCart contains zero or many Items. An Item is placed in exactly one ShoppingCart.",
    correctA: "1",
    correctB: "0..*",
    explanation: "An item is in exactly '1' cart. A cart can have '0..*' items (it might be empty).",
  },
  {
    id: 12,
    classA: "Country",
    classB: "CapitalCity",
    scenario: "A Country has exactly one CapitalCity. A CapitalCity is the capital of exactly one Country.",
    correctA: "1",
    correctB: "1",
    explanation: "It is a strict one-to-one relationship. Both ends are '1'.",
  },
];
