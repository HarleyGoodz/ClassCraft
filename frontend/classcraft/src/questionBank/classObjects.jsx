// Learning examples and their structured content for this lesson.
export const SCENARIOS = [
  {
    className: "Car",
    attributes: [
      { name: "brand", type: "String" },
      { name: "color", type: "String" },
      { name: "speed", type: "int" },
      { name: "isRunning", type: "boolean" },
    ],
    methods: [
      { name: "start", params: "", returns: "void" },
      { name: "brake", params: "", returns: "void" },
    ],
    objects: [
      { name: "myCar", values: ["Toyota", "red", "0", "false"] },
      { name: "yourCar", values: ["Honda", "blue", "0", "false"] },
    ],
    explain:
      "Car is the blueprint: every car has a brand, a color, a speed, and a running status, and can start and brake. myCar and yourCar are two real cars made from it, each with its own values.",
  },
  {
    className: "Dog",
    attributes: [
      { name: "name", type: "String" },
      { name: "breed", type: "String" },
      { name: "age", type: "int" },
    ],
    methods: [
      { name: "bark", params: "", returns: "void" },
      { name: "eat", params: "food: String", returns: "void" },
    ],
    objects: [
      { name: "bantay", values: ["Bantay", "Aspin", "3"] },
      { name: "bella", values: ["Bella", "Poodle", "1"] },
    ],
    explain:
      "Dog only says that every dog has a name, a breed, and an age, and can bark and eat. bantay and bella are real dogs, each with different values.",
  },
  {
    className: "Phone",
    attributes: [
      { name: "brand", type: "String" },
      { name: "model", type: "String" },
      { name: "batteryLevel", type: "int" },
      { name: "isOn", type: "boolean" },
    ],
    methods: [
      { name: "call", params: "number: String", returns: "void" },
      { name: "charge", params: "", returns: "void" },
    ],
    objects: [
      { name: "phoneA", values: ["Samsung", "Galaxy A15", "80", "true"] },
      { name: "phoneB", values: ["Apple", "iPhone 13", "35", "false"] },
    ],
    explain:
      "Phone lists what every phone has and can do. phoneA and phoneB are two actual phones, so they can have different brands, battery levels, and on/off status.",
  },
  {
    className: "Book",
    attributes: [
      { name: "title", type: "String" },
      { name: "author", type: "String" },
      { name: "pages", type: "int" },
      { name: "price", type: "double" },
    ],
    methods: [
      { name: "open", params: "", returns: "void" },
      { name: "getTitle", params: "", returns: "String" },
    ],
    objects: [
      { name: "book1", values: ["Noli Me Tangere", "Jose Rizal", "439", "250.50"] },
      { name: "book2", values: ["Harry Potter", "J.K. Rowling", "309", "399.00"] },
    ],
    explain:
      "Book is the template: every book has a title, an author, a number of pages, and a price. book1 and book2 are two real books made from that template.",
  },
  {
    className: "BankAccount",
    attributes: [
      { name: "owner", type: "String" },
      { name: "balance", type: "double" },
    ],
    methods: [
      { name: "deposit", params: "amount: double", returns: "void" },
      { name: "withdraw", params: "amount: double", returns: "boolean" },
    ],
    objects: [
      { name: "account1", values: ["Maria", "5000.00"] },
      { name: "account2", values: ["Juan", "12500.00"] },
    ],
    explain:
      "BankAccount says every account has an owner and a balance, and can deposit and withdraw. account1 and account2 are real accounts that each keep their own balance.",
  }
];
