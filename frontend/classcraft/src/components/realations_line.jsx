export function RelationshipDiagram({ type, leftClass, rightClass }) {
  const isInheritance = type === "Inheritance";
  const isAggregation = type === "Aggregation";
  const isComposition = type === "Composition";
  const hasDiamond = isAggregation || isComposition;

  return (
    <svg
      className="relationship-diagram"
      viewBox="0 0 300 64"
      role="img"
      aria-label={`${type}: ${leftClass} connected to ${rightClass}`}
    >
      <rect
        className="diagram-class"
        x="4"
        y="12"
        width="92"
        height="40"
        rx="5"
      />
      <text className="diagram-label" x="50" y="37">
        {leftClass}
      </text>
      <rect
        className="diagram-class"
        x="204"
        y="12"
        width="92"
        height="40"
        rx="5"
      />
      <text className="diagram-label" x="250" y="37">
        {rightClass}
      </text>
      {isInheritance ? (
        <>
          <line className="diagram-line" x1="96" y1="32" x2="188" y2="32" />
          <polygon
            className="diagram-inheritance-arrow"
            points="204,32 188,23 188,41"
          />
        </>
      ) : hasDiamond ? (
        <>
          <line className="diagram-line" x1="118" y1="32" x2="204" y2="32" />
          <polygon
            className={
              isComposition
                ? "diagram-diamond diagram-diamond--filled"
                : "diagram-diamond"
            }
            points="96,32 107,23 118,32 107,41"
          />
        </>
      ) : (
        <line className="diagram-line" x1="96" y1="32" x2="204" y2="32" />
      )}
    </svg>
  );
}

export function RelationshipConnector({ type }) {
  const isInheritance = type === "Inheritance";
  const isAggregation = type === "Aggregation";
  const isComposition = type === "Composition";
  const hasDiamond = isAggregation || isComposition;

  return (
    <svg
      className="relationship-connector"
      viewBox="0 0 150 40"
      role="img"
      aria-label={`${type} connector`}
    >
      {isInheritance ? (
        <>
          <line className="diagram-line" x1="4" y1="20" x2="128" y2="20" />
          <polygon
            className="diagram-inheritance-arrow"
            points="146,20 128,10 128,30"
          />
        </>
      ) : hasDiamond ? (
        <>
          <line className="diagram-line" x1="26" y1="20" x2="146" y2="20" />
          <polygon
            className={
              isComposition
                ? "diagram-diamond diagram-diamond--filled"
                : "diagram-diamond"
            }
            points="4,20 15,11 26,20 15,29"
          />
        </>
      ) : (
        <line className="diagram-line" x1="4" y1="20" x2="146" y2="20" />
      )}
    </svg>
  );
}
