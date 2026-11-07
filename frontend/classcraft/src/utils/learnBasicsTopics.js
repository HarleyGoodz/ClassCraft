/*
 * learnBasicsTopics.js: the list of Learn the Basics topics.
 * Purpose: one place for the topic order, so the pages can't disagree about it.
 * What it does: exports each topic's key, label and covers list. LearnBasics and TopicPager
 * both read from it.
 */
// The Learn the Basics topics, in the order learners should take them.
export const LEARN_BASICS_TOPICS = [
  {
    key: "classes-objects",
    label: "Classes and Objects",
    covers: ["class : Blueprint", "object : Instance"],
  },
  {
    key: "class-construction",
    label: "Class Construction",
    covers: ["attributes : List", "methods : List", "visibility : + - #"],
  },
  {
    key: "relationships-multiplicity",
    label: "Relationships and Multiplicity",
    covers: ["association", "inheritance", "aggregation", "composition", "multiplicity : 0..*"],
  },
  {
    key: "four-oop-pillars",
    label: "The Four OOP Pillars",
    covers: ["encapsulation", "abstraction", "inheritance", "polymorphism"],
  },
];
