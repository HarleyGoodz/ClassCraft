/*
 * TopicPager.jsx: the Previous and Next links at the bottom of each lesson.
 * Purpose: lets learners move between Learn the Basics topics without going back to the list.
 * What it does: finds the current topic in LEARN_BASICS_TOPICS, links to its neighbours, and
 * opens the new page at the top.
 */
import { Link } from "react-router-dom";
import { LEARN_BASICS_TOPICS } from "../utils/learnBasicsTopics";

// Previous and next links at the end of a lesson. The first lesson goes back to the
// topic list, and the last one leads on to Skill Development.
export default function TopicPager({ current }) {
  const index = LEARN_BASICS_TOPICS.findIndex((topic) => topic.key === current);
  const previous = LEARN_BASICS_TOPICS[index - 1];
  const next = LEARN_BASICS_TOPICS[index + 1];

  // The links sit at the bottom of long pages, so the new page must open at the top.
  const scrollToTop = () => window.scrollTo(0, 0);

  return (
    <nav className="topic-pager" aria-label="Lesson navigation">
      <Link
        to={previous ? `/learn-basics/${previous.key}` : "/learn-basics"}
        className="topic-step topic-step--previous"
        onClick={scrollToTop}
      >
        <span className="topic-step-arrow" aria-hidden="true">←</span>
        <span className="topic-step-text">
          <span className="topic-step-kicker">{previous ? "Previous topic" : "Back to"}</span>
          <span className="topic-step-name">{previous ? previous.label : "All topics"}</span>
        </span>
      </Link>

      <Link
        to={next ? `/learn-basics/${next.key}` : "/skill-development"}
        className="topic-step topic-step--next"
        onClick={scrollToTop}
      >
        <span className="topic-step-text">
          <span className="topic-step-kicker">{next ? "Next topic" : "Next up"}</span>
          <span className="topic-step-name">{next ? next.label : "Skill Development"}</span>
        </span>
        <span className="topic-step-arrow" aria-hidden="true">→</span>
      </Link>
    </nav>
  );
}
