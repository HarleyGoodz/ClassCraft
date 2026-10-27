function UmlClass({
  x,
  y,
  width,
  title,
  stereotype,
  attributes = [],
  methods = [],
  highlighted = false,
  highlightAttributes = false,
  highlightMethods = false,
}) {
  const titleHeight = stereotype ? 58 : 42;
  const attributeHeight = attributes.length ? attributes.length * 25 + 12 : 0;
  const methodHeight = methods.length ? methods.length * 25 + 12 : 0;
  const height = titleHeight + attributeHeight + methodHeight;
  const attributeDivider = y + titleHeight + attributeHeight;

  return (
    <g>
      <rect
        className={`uml-class-outline${highlighted ? " is-highlighted" : ""}`}
        x={x}
        y={y}
        width={width}
        height={height}
        rx="4"
      />
      {stereotype && (
        <text className="uml-stereotype" x={x + width / 2} y={y + 17}>
          {stereotype}
        </text>
      )}
      <text
        className="uml-class-title"
        x={x + width / 2}
        y={y + (stereotype ? 40 : 27)}
      >
        {title}
      </text>
      {attributes.length > 0 && (
        <>
          <line
            className="uml-divider"
            x1={x}
            y1={y + titleHeight}
            x2={x + width}
            y2={y + titleHeight}
          />
          {attributes.map((attribute, index) => (
            <text
              className={`uml-member${highlightAttributes ? " is-highlighted" : ""}`}
              key={attribute}
              x={x + 12}
              y={y + titleHeight + 24 + index * 25}
            >
              {attribute}
            </text>
          ))}
        </>
      )}
      {methods.length > 0 && (
        <>
          {(attributes.length > 0 || stereotype) && (
            <line
              className="uml-divider"
              x1={x}
              y1={attributeDivider}
              x2={x + width}
              y2={attributeDivider}
            />
          )}
          {methods.map((method, index) => (
            <text
              className={`uml-member${highlightMethods ? " is-highlighted" : ""}`}
              key={method}
              x={x + 12}
              y={attributeDivider + 24 + index * 25}
            >
              {method}
            </text>
          ))}
        </>
      )}
    </g>
  );
}

export function PillarDiagram({ type }) {
  return (
    <svg
      className="four-oop-diagram"
      viewBox="0 0 420 220"
      role="img"
      aria-label={`${type} UML class diagram`}
    >
      {type === "Encapsulation" && (
        <UmlClass
          x={65}
          y={28}
          width={290}
          title="BankAccount"
          attributes={["- balance: double"]}
          methods={["+ deposit(amount)", "+ withdraw(amount)"]}
        />
      )}
      {type === "Abstraction" && (
        <>
          <UmlClass
            x={80}
            y={24}
            width={260}
            title="PaymentMethod"
            stereotype="«interface»"
            methods={["+ pay(amount)"]}
          />
          <text className="uml-note" x="210" y="158">
            Payment details are hidden
          </text>
        </>
      )}
      {type === "Inheritance" && (
        <>
          <UmlClass
            x={130}
            y={12}
            width={160}
            title="Student"
            methods={["+ enroll()"]}
          />
          <line className="uml-connector" x1="210" y1="110" x2="210" y2="122" />
          <polygon
            className="uml-generalization"
            points="210,92 198,110 222,110"
          />
          <UmlClass
            x={110}
            y={122}
            width={200}
            title="GraduateStudent"
            methods={["+ submitThesis()"]}
          />
        </>
      )}
      {type === "Polymorphism" && (
        <>
          <UmlClass
            x={140}
            y={8}
            width={140}
            title="Shape"
            methods={["+ area()"]}
          />
          <line className="uml-connector" x1="105" y1="120" x2="105" y2="112" />
          <line className="uml-connector" x1="315" y1="120" x2="315" y2="112" />
          <line className="uml-connector" x1="105" y1="112" x2="315" y2="112" />
          <line className="uml-connector" x1="210" y1="108" x2="210" y2="112" />
          <polygon
            className="uml-generalization"
            points="210,88 198,108 222,108"
          />
          <UmlClass
            x={30}
            y={120}
            width={150}
            title="Circle"
            methods={["+ area()"]}
          />
          <UmlClass
            x={240}
            y={120}
            width={150}
            title="Rectangle"
            methods={["+ area()"]}
          />
        </>
      )}
    </svg>
  );
}

export function ScenarioDiagram({ scenario, selectedPillar }) {
  const childrenHighlighted = ["Inheritance", "Polymorphism"].includes(
    selectedPillar,
  );

  return (
    <svg
      className="scenario-diagram"
      viewBox="0 0 620 345"
      role="img"
      aria-label={`${scenario.parent} abstract class inherited by ${scenario.childOne} and ${scenario.childTwo}`}
    >
      <UmlClass
        x={190}
        y={12}
        width={240}
        title={scenario.parent}
        stereotype={scenario.parentStereotype}
        attributes={scenario.attributes}
        methods={scenario.parentMethods}
        highlighted={selectedPillar === "Inheritance"}
        highlightAttributes={selectedPillar === "Encapsulation"}
        highlightMethods={selectedPillar === "Abstraction"}
      />
      <line
        className={`uml-connector${selectedPillar === "Inheritance" ? " is-highlighted" : ""}`}
        x1="310"
        y1="214"
        x2="310"
        y2="235"
      />
      <polygon
        className={`uml-generalization${selectedPillar === "Inheritance" ? " is-highlighted" : ""}`}
        points="310,194 298,214 322,214"
      />
      <line
        className={`uml-connector${childrenHighlighted ? " is-highlighted" : ""}`}
        x1="130"
        y1="235"
        x2="490"
        y2="235"
      />
      <line
        className={`uml-connector${childrenHighlighted ? " is-highlighted" : ""}`}
        x1="130"
        y1="235"
        x2="130"
        y2="255"
      />
      <line
        className={`uml-connector${childrenHighlighted ? " is-highlighted" : ""}`}
        x1="490"
        y1="235"
        x2="490"
        y2="255"
      />
      <UmlClass
        x={30}
        y={255}
        width={200}
        title={scenario.childOne}
        methods={[scenario.childOneMethod]}
        highlighted={selectedPillar === "Inheritance"}
        highlightMethods={selectedPillar === "Polymorphism"}
      />
      <UmlClass
        x={390}
        y={255}
        width={200}
        title={scenario.childTwo}
        methods={[scenario.childTwoMethod]}
        highlighted={selectedPillar === "Inheritance"}
        highlightMethods={selectedPillar === "Polymorphism"}
      />
    </svg>
  );
}
