const NAV = ".topnav-links";

export const PIP_TOURS = {
  "/dashboard": {
    title: "Dashboard",
    steps: [
      { mood: "happy", text: "Hoo! Hi there! I'm Pip, the owl mage of ClassCraft. I'll show you around." },
      { mood: "normal", text: "ClassCraft teaches you to design UML class diagrams, one step at a time." },
      { target: NAV, mood: "normal", text: "These tabs are your map. You'll mostly go left to right: learn, practice, then build on your own." },
      { target: `${NAV} a[href="/learn-basics"]`, mood: "happy", text: "Learn the Basics comes first. Short lessons on classes, relationships, and the OOP pillars." },
      { target: `${NAV} a[href="/skill-development"]`, mood: "normal", text: "Skill Development is where you practice each skill with guided activities and instant feedback." },
      { target: `${NAV} a[href="/class-diagram-construction"]`, mood: "surprised", text: "Class Diagram Construction is the big one. You build whole diagrams from a scenario, with no hints!" },
      { target: ".summary-grid", mood: "normal", text: "This is your Dashboard. These cards sum up how you're doing. Hover over a number to see where it comes from." },
      { target: ".summary-grid", mood: "thinking", text: "The magic number is 80%. Score at least that on your first try at a scenario and it counts as on target." },
      { target: ".progress-tabs", mood: "normal", text: "Switch these tabs to see each Skill Development activity or each construction scenario." },
      { mood: "happy", text: "That's the tour! Click the owl button in the corner any time and I'll explain whatever page you're on." },
    ],
  },

  "/learn-basics": {
    title: "Learn the Basics",
    steps: [
      { mood: "happy", text: "Welcome to Learn the Basics! This is where every mage starts." },
      { target: ".topic-grid", mood: "normal", text: "Each card is a lesson. They're drawn like UML classes. Sneaky, right? Hoo hoo!" },
      { target: ".topic-grid > :first-child", mood: "normal", text: "Start with Classes and Objects, then go in order. Each lesson builds on the last one." },
      { target: ".topic-grid", mood: "thinking", text: "Lessons have little examples you can drag and click. Nothing here is graded, so experiment freely!" },
      { mood: "happy", text: "When you finish the last lesson, it'll point you to Skill Development. Off you go!" },
    ],
  },

  "/learn-basics/classes-objects": {
    title: "Classes and Objects",
    steps: [
      { mood: "normal", text: "First lesson: a class is the blueprint. An object is a real thing made from it." },
      { target: ".lesson-grid", mood: "thinking", text: "Compare these two cards. Same shape, but one describes and the other has actual values." },
      { target: ".scenario-section", mood: "normal", text: "Scroll down for scenarios that show one class turning into many objects." },
      { target: ".lesson-breadcrumb", mood: "happy", text: "Lost? This trail takes you back to all topics. The links at the bottom go to the next one." },
    ],
  },

  "/learn-basics/class-construction": {
    title: "Class Construction",
    steps: [
      { mood: "normal", text: "A class box has three parts: the name, the attributes, and the methods." },
      { target: ".cc-workspace", mood: "happy", text: "Drag each piece into the right part of the Student class." },
      { target: ".cc-actions", mood: "thinking", text: "When you're done, check your answers. I'll give you a hint for anything in the wrong spot." },
    ],
  },

  "/learn-basics/relationships-multiplicity": {
    title: "Relationships and Multiplicity",
    steps: [
      { mood: "normal", text: "Classes don't live alone. They connect to each other!" },
      { target: ".relationships-grid", mood: "thinking", text: "Four kinds of lines: association, inheritance, aggregation, and composition. Look closely at the arrowheads and diamonds." },
      { target: ".multiplicity-table-wrap", mood: "normal", text: "Multiplicity says how many. 1, 0..1, 1..* and so on, written at each end of a line." },
      { target: ".relationships-example", mood: "happy", text: "Now try it yourself. Place a connector in the example and I'll tell you if it fits." },
    ],
  },

  "/learn-basics/four-oop-pillars": {
    title: "The Four OOP Pillars",
    steps: [
      { mood: "normal", text: "The four pillars hold up all of object-oriented design." },
      { target: ".four-oop-grid", mood: "thinking", text: "Encapsulation, abstraction, inheritance, polymorphism. Each card shows how it looks in a diagram." },
      { target: ".four-oop-example", mood: "happy", text: "In the example, pick a pillar and watch where it appears in the diagram." },
      { mood: "surprised", text: "After this lesson you're ready for Skill Development. Hoo!" },
    ],
  },

  "/skill-development": {
    title: "Skill Development",
    steps: [
      { mood: "happy", text: "Skill Development! Time to practice what you learned." },
      { target: ".experience-grid", mood: "normal", text: "There are four activities, roughly from easiest to hardest. Each card shows how many questions are left." },
      { target: ".experience-grid > :first-child .practice-mode-options", mood: "thinking", text: "Practice focus picks your questions: new ones, all of them, or the ones you scored under 80% on." },
      { target: ".experience-grid > :first-child .practice-button", mood: "normal", text: "Press Practice to start. Every answer is saved, so you can see your progress on the Dashboard." },
      { mood: "happy", text: "Your first try at each scenario is the one that counts toward the 80% target. Take your time!" },
    ],
  },

  "/skill-development/class-diagram-formation": {
    title: "Class Diagram Formation",
    steps: [
      { target: ".cdf-top-header", mood: "normal", text: "Read the scenario first. It tells you what belongs in this class." },
      { target: ".cdf-workspace-layout", mood: "thinking", text: "Drag each piece from the bank into the right compartment. Watch the + and - visibility symbols!" },
      { target: ".cdf-action-bar", mood: "happy", text: "Press Check to get feedback, then move on to the next scenario." },
    ],
  },

  "/skill-development/class-relationships": {
    title: "Class Relationships",
    steps: [
      { target: ".cdf-top-header", mood: "normal", text: "Read how these two classes are connected in the scenario." },
      { target: ".connector-bank", mood: "thinking", text: "Pick a relationship here and drag or tap it into the gap between the classes." },
      { target: ".cdf-action-bar", mood: "happy", text: "Check your answer when you're ready. Hoo!" },
    ],
  },

  "/skill-development/multiplicity": {
    title: "Multiplicity",
    steps: [
      { target: ".cdf-top-header", mood: "normal", text: "Look for words like 'one', 'many', or 'at least one' in the scenario." },
      { target: ".multiplicity-bank", mood: "thinking", text: "Drag the right notation onto each end of the line. Each end gets its own." },
      { target: ".cdf-action-bar", mood: "happy", text: "Then press Check. I believe in you!" },
    ],
  },

  "/skill-development/oop-class-modeling": {
    title: "OOP-Based Class Modeling",
    steps: [
      { target: ".cdf-top-header", mood: "surprised", text: "This one puts it all together! Read the scenario carefully." },
      { target: ".oop-workspace", mood: "thinking", text: "Drag pieces into the classes, connect them with a relationship, and click a visibility symbol to change it." },
      { target: ".cdf-action-bar", mood: "happy", text: "Check when you're done. I'll show you exactly what to fix." },
    ],
  },

  "/class-diagram-construction": {
    title: "Class Diagram Construction",
    steps: [
      { mood: "surprised", text: "The final trial: building class diagrams on your own!" },
      { target: ".cdc-hero-intro", mood: "normal", text: "You get an unfamiliar scenario and model the whole diagram. No hints this time." },
      { target: ".cdc-hint", mood: "thinking", text: "Your diagram is checked against a list of required elements. Aim for 80% or more of them." },
      { target: ".cdc-practice-modes", mood: "normal", text: "Choose which scenarios to practice, same as in Skill Development." },
      { target: ".cdc-start-button", mood: "happy", text: "Press Start when you're ready. Good luck, mage!" },
    ],
  },

  "/class-diagram-construction/scenario": {
    title: "Construction Scenario",
    steps: [
      { target: ".cds-scenario", mood: "normal", text: "Read the scenario. Every noun could be a class, and every verb could be a method or a relationship." },
      { target: ".cds-bank-col", mood: "thinking", text: "Your pieces and tools are here. Place classes, attributes, methods, lines, and multiplicity." },
      { target: ".cds-diagram-col", mood: "normal", text: "Build your diagram here. You can rearrange things as much as you like." },
      { target: ".cds-action-bar", mood: "happy", text: "Submit when you're done. You'll see which elements were missing or wrong." },
    ],
  },
};

export function getPipTour(pathname) {
  const path = pathname.replace(/\/+$/, "") || "/";
  return PIP_TOURS[path] ?? null;
}
