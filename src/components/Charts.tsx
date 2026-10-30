import { useMemo } from "react";
import { inventory, warehouseNodes } from "../services/data";

const panelStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 260,
  padding: 16,
  boxSizing: "border-box",
  color: "#dce8f7",
  overflow: "hidden",
};

const colors = ["#00e5ff", "#8b5cf6", "#00d68f", "#ffb84d", "#ff5577"];

function ThreeDBarChart({
  labels,
  values,
}: {
  labels: string[];
  values: number[];
}) {
  const max = Math.max(...values, 1);

  return (
    <div
      style={{
        ...panelStyle,
        display: "flex",
        alignItems: "end",
        justifyContent: "space-around",
        gap: 12,
        paddingTop: 35,
        perspective: 700,
      }}
    >
      {labels.map((label, i) => {
        const height = Math.max(8, (values[i] / max) * 145);

        return (
          <div
            key={label}
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <strong style={{ color: colors[i % colors.length], fontSize: 12 }}>
              {values[i].toLocaleString("en-IN")}
            </strong>

            <div
              style={{
                width: "65%",
                maxWidth: 62,
                height,
                position: "relative",
                transform: "skewY(-8deg)",
                transformStyle: "preserve-3d",
                background: `linear-gradient(90deg, ${colors[i % colors.length]}55, ${colors[i % colors.length]})`,
                boxShadow: `8px 8px 0 ${colors[i % colors.length]}33, 0 0 20px ${colors[i % colors.length]}22`,
                borderTop: `2px solid ${colors[i % colors.length]}`,
                borderRadius: "4px 4px 0 0",
              }}
            />
            <span
              style={{
                fontSize: 10,
                textAlign: "center",
                color: "#9aabc1",
                overflowWrap: "anywhere",
              }}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ThreeDPieChart({
  labels,
  values,
}: {
  labels: string[];
  values: number[];
}) {
  const total = values.reduce((sum, value) => sum + value, 0);
  let cursor = 0;

  const segments = values.map((value, i) => {
    const start = cursor;
    cursor += total ? (value / total) * 100 : 0;

    return `${colors[i % colors.length]} ${start}% ${cursor}%`;
  });

  const gradient = `conic-gradient(${segments.join(", ")})`;

  return (
    <div
      style={{
        ...panelStyle,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
      }}
    >
      <div
        style={{
          width: 180,
          height: 180,
          flexShrink: 0,
          position: "relative",
          marginTop: -10,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "15px 0 -10px",
            borderRadius: "50%",
            background: gradient,
            filter: "brightness(0.48)",
            transform: "rotateX(58deg)",
            boxShadow: "0 16px 20px #0008",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: gradient,
            transform: "rotateX(58deg)",
            boxShadow: "0 0 22px #00e5ff18",
            border: "1px solid #ffffff22",
          }}
        />
      </div>

      <div style={{ display: "grid", gap: 12, minWidth: 120 }}>
        {labels.map((label, i) => (
          <div
            key={label}
            style={{
              display: "grid",
              gridTemplateColumns: "10px 1fr auto",
              gap: 8,
              alignItems: "center",
              fontSize: 12,
            }}
          >
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: 2,
                background: colors[i % colors.length],
              }}
            />
            <span style={{ color: "#a9b8cc" }}>{label}</span>
            <strong>{values[i].toLocaleString("en-IN")}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DemandChart() {
  const data = useMemo(() => {
    const labels = ["Class A", "Class B", "Class C"];

    return {
      labels,
      values: labels.map((label) =>
        inventory.filter(
          (item) => item.Demand_Class === label.slice(-1),
        ).length,
      ),
    };
  }, []);

  return (
    <ThreeDPieChart labels={data.labels} values={data.values} />
  );
}

export function AllocationChart() {
  const labels = ["Allocated", "Vacant"];

  const values = labels.map((label) =>
    warehouseNodes.filter(
      (node) =>
        node.Allocation_Status ===
        (label === "Allocated" ? "ALLOCATED" : "VACANT"),
    ).length,
  );

  return <ThreeDBarChart labels={labels} values={values} />;
}

export function RouteChart() {
  const points = [
    [15, 75],
    [28, 48],
    [42, 63],
    [57, 28],
    [73, 43],
    [88, 16],
  ];

  const route = points.map(([x, y]) => `${x},${y}`).join(" ");

  return (
    <div style={panelStyle}>
      <svg
        viewBox="0 0 100 100"
        width="100%"
        height="230"
        role="img"
        aria-label="Illustrative three-dimensional warehouse pick route"
      >
        {Array.from({ length: 6 }, (_, i) => (
          <g key={i} stroke="#263b55" strokeWidth=".35">
            <line x1={i * 20} y1="10" x2={i * 20} y2="90" />
            <line x1="5" y1={i * 16 + 10} x2="95" y2={i * 16 + 10} />
          </g>
        ))}

        <polyline
          points={route}
          fill="none"
          stroke="#00e5ff"
          strokeWidth="4"
          opacity=".16"
          transform="translate(0 5)"
        />

        <polyline
          points={route}
          fill="none"
          stroke="#00e5ff"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />

        {points.map(([x, y], i) => (
          <g key={i}>
            <ellipse
              cx={x}
              cy={y + 4}
              rx="3"
              ry="1.3"
              fill="#00e5ff"
              opacity=".25"
            />
            <circle cx={x} cy={y} r="2.5" fill="#00e5ff" />
            <circle
              cx={x}
              cy={y}
              r="4"
              fill="none"
              stroke="#00e5ff"
              strokeWidth=".5"
            />
          </g>
        ))}
      </svg>

      <p style={{ color: "#8fa5bd", fontSize: 11 }}>
        ILLUSTRATIVE ROUTE // NOT CONNECTED TO THE OPTIMIZATION SOLVER
      </p>
    </div>
  );
}

export function TrendChart() {
  const values = [28, 35, 31, 49, 43, 62, 56, 76];

  const points = values
    .map((value, i) => `${8 + i * 12},${90 - value}`)
    .join(" ");

  return (
    <div style={panelStyle}>
      <svg
        viewBox="0 0 100 100"
        width="100%"
        height="220"
        role="img"
        aria-label="Illustrative throughput trend"
      >
        {Array.from({ length: 5 }, (_, i) => (
          <line
            key={i}
            x1="5"
            y1={15 + i * 18}
            x2="96"
            y2={15 + i * 18}
            stroke="#263b55"
            strokeWidth=".4"
          />
        ))}

        <polygon
          points={`8,90 ${points} 92,90`}
          fill="#00e5ff"
          opacity=".12"
        />

        <polyline
          points={points}
          fill="none"
          stroke="#00e5ff"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />

        {values.map((value, i) => (
          <circle
            key={i}
            cx={8 + i * 12}
            cy={90 - value}
            r="1.8"
            fill="#00e5ff"
          />
        ))}
      </svg>

      <p style={{ color: "#8fa5bd", fontSize: 11 }}>
        WEEKLY THROUGHPUT INDEX // ILLUSTRATIVE DEMO DATA
      </p>
    </div>
  );
}