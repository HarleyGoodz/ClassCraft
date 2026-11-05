// Learning examples and their structured content for this lesson.
export const PILLARS = [
  {
    name: "Encapsulation",
    summary: "Keep an object's data and the methods that use it together.",
    example:
      "A BankAccount keeps its balance private and provides deposit() and withdraw() methods to update it safely.",
  },
  {
    name: "Abstraction",
    summary: "Show the important operations while hiding implementation details.",
    example:
      "A user calls pay() without needing to know the internal steps used to process the payment.",
  },
  {
    name: "Inheritance",
    summary: "Create a specialized class from a more general parent class.",
    example:
      "GraduateStudent inherits common identity and enrollment behavior from Student, then adds graduate-specific details.",
  },
  {
    name: "Polymorphism",
    summary: "Use one common operation with different behavior for different object types.",
    example:
      "Different Shape classes can implement area() in their own way, while the program calls area() on any Shape.",
  }
];

export const SCENARIOS = [
  {
    title: "Online learning platform",
    intro:
      "A platform offers video lessons and quizzes. Both are learning resources, but opening each one behaves differently.",
    parent: "LearningResource",
    parentStereotype: "«abstract»",
    attributes: ["- title: String", "- completed: boolean"],
    parentMethods: ["+ open()", "+ markComplete()"],
    childOne: "VideoLesson",
    childOneMethod: "+ open() plays video",
    childTwo: "Quiz",
    childTwoMethod: "+ open() starts quiz",
    pillars: [
      {
        pillar: "Abstraction",
        description:
          "LearningResource defines what every resource can do without specifying how it opens.",
      },
      {
        pillar: "Encapsulation",
        description:
          "Resource details, such as title and completion state, belong inside the class.",
      },
      {
        pillar: "Inheritance",
        description:
          "VideoLesson and Quiz are specialized LearningResource classes.",
      },
      {
        pillar: "Polymorphism",
        description:
          "Calling open() plays a video or starts a quiz depending on the resource.",
      },
    ],
  },
  {
    title: "Smart home system",
    intro:
      "A smart home controls different devices. A Light and Thermostat share common device behavior, but respond to commands in their own way.",
    parent: "SmartDevice",
    parentStereotype: "«abstract»",
    attributes: ["- deviceId: String", "- isOn: boolean"],
    parentMethods: ["+ turnOn()", "+ turnOff()"],
    childOne: "Light",
    childOneMethod: "+ turnOn() lights room",
    childTwo: "Thermostat",
    childTwoMethod: "+ turnOn() starts heating",
    pillars: [
      {
        pillar: "Abstraction",
        description:
          "SmartDevice describes shared controls without exposing each device's inner workings.",
      },
      {
        pillar: "Encapsulation",
        description:
          "Each device manages its own state, such as whether it is on.",
      },
      {
        pillar: "Inheritance",
        description:
          "Light and Thermostat reuse common SmartDevice behavior.",
      },
      {
        pillar: "Polymorphism",
        description:
          "turnOn() lights a room or starts heating, depending on the device.",
      },
    ],
  }
];
