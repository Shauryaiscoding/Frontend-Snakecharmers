import { useMemo, useState } from "react";
import {
  Activity,
  Boxes,
  MapPinned,
  Package,
  PackageX,
  TrendingUp,
  AlertTriangle,
  Search,
  Download,
  Play,
  RotateCcw,
  ArrowRight,
  Database,
  CheckCircle2,
  Clock3,
  Route as RouteIcon,
} from "lucide-react";
import type { ModuleKey } from "../types";
import Panel from "../components/Panel";
import MetricCard from "../components/MetricCard";
import DataTable from "../components/DataTable";
import Warehouse3D from "../components/Warehouse3D";
import guideMarkdown from "../../GUIDE.md?raw";
import GuidePortal from "../components/GuidePortal";
import "../guide.css";
import {
  DemandChart,
  AllocationChart,
  RouteChart,
  TrendChart,
} from "../components/Charts";
import {
  inventory,
  warehouseNodes,
  formatNum,
  demoNotice,
} from "../services/data";

const titles: Record<ModuleKey, { title: string; caption: string; tag: string }> = {
  guide: {
  title: "PROJECT GUIDE",
  caption: "Documentation and instructions for the SnakeCharmers dashboard.",
  tag: "DOCUMENTATION",
  },
  overview: {
    title: "SYSTEM OVERVIEW",
    caption: "WAREHOUSE PERFORMANCE // COMMAND CENTER",
    tag: "MODULE 01",
  },
  warehouse: {
    title: "WAREHOUSE EXPLORER",
    caption: "SPATIAL INVENTORY // NODE TELEMETRY",
    tag: "MODULE 02",
  },
  inventory: {
    title: "SLOTTING & INVENTORY",
    caption: "SKU ALLOCATION // CAPACITY MATRICES",
    tag: "MODULE 03",
  },
  sku: {
    title: "SKU FINDER",
    caption: "ITEM LOOKUP // LOCATION TRACE",
    tag: "MODULE 04",
  },
  outOfStock: {
    title: "OUT-OF-STOCK PRODUCTS",
    caption: "INVENTORY EXCEPTIONS // STOCK AVAILABILITY",
    tag: "MODULE 05",
  },
  simulator: {
    title: "WHAT-IF SIMULATOR",
    caption: "SCENARIO CONTROLS // DEMO CALCULATOR",
    tag: "MODULE 06",
  },
  routes: {
    title: "PICK ROUTES",
    caption: "ROUTE PLANNING // PATH INSPECTION",
    tag: "MODULE 07",
  },
  analytics: {
    title: "ANALYTICS",
    caption: "DISTRIBUTION // VOLUMETRIC FIT",
    tag: "MODULE 08",
  },
  validation: {
    title: "CONSTRAINT VALIDATION",
    caption: "RULE CHECKS // EXCEPTION INSPECTOR",
    tag: "MODULE 09",
  },
  downloads: {
    title: "DOWNLOADS",
    caption: "DATA EXPORT // REPORT CENTER",
    tag: "MODULE 10",
  },
  roi: {
    title: "ADVANCED ROI ANALYSIS",
    caption: "COST MODEL // RETURN ESTIMATES",
    tag: "MODULE 11",
  },
};

function OutOfStockPage() {
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("ALL");

  // Only actual zero-unit products qualify as out of stock.
  const outOfStock = inventory.filter((item) => item.Units <= 0);

  // Low-stock and review products are separate categories.
  const lowStock = inventory.filter(
    (item) => item.Units > 0 && item.Status === "LOW STOCK"
  );

  const reviewStock = inventory.filter(
    (item) => item.Units > 0 && item.Status === "REVIEW"
  );

  const filtered = outOfStock.filter((item) => {
    const matchesSearch =
      item.SKU_ID.toLowerCase().includes(search.toLowerCase()) ||
      item.Description.toLowerCase().includes(search.toLowerCase()) ||
      item.Zone.toLowerCase().includes(search.toLowerCase());

    const matchesPriority =
      priority === "ALL" ||
      (priority === "HIGH" && item.Demand_Class === "A") ||
      (priority === "MEDIUM" && item.Demand_Class === "B") ||
      (priority === "LOW" && item.Demand_Class === "C");

    return matchesSearch && matchesPriority;
  });

  const downloadReport = () => {
    const headers = [
      "SKU_ID",
      "Description",
      "Units",
      "Demand_Class",
      "Zone",
      "Location_ID",
      "Unit_Value",
    ];

    const rows = filtered.map((item) =>
      [
        item.SKU_ID,
        item.Description,
        item.Units,
        item.Demand_Class,
        item.Zone,
        item.Location_ID,
        item.Unit_Value,
      ].join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "out-of-stock-report.csv";
    link.click();

    URL.revokeObjectURL(url);
  };
  return (
    <div className="module-stack">
      <div className="metric-grid">
        <MetricCard
          label="OUT OF STOCK"
          value={formatNum(outOfStock.length)}
          delta="ZERO AVAILABLE UNITS"
          icon={<AlertTriangle size={18} />}
        />
        <MetricCard
          label="LOW STOCK"
          value={formatNum(lowStock.length)}
          delta="CHECK REPLENISHMENT"
          icon={<Package size={18} />}
        />
        <MetricCard
          label="REVIEW REQUIRED"
          value={formatNum(reviewStock.length)}
          delta="MANUAL INSPECTION"
          icon={<Activity size={18} />}
        />
        <MetricCard
          label="A-CLASS STOCKOUTS"
          value={formatNum(
            outOfStock.filter((item) => item.Demand_Class === "A").length
          )}
          delta="HIGH-DEMAND PRODUCTS"
          icon={<AlertTriangle size={18} />}
        />
      </div>

      <Panel
        title="INVENTORY EXCEPTIONS"
        eyebrow="STOCK AVAILABILITY // REPLENISHMENT MONITOR"
        action={
          <button className="action-button" onClick={downloadReport}>
            <Download size={14} />
            EXPORT CSV
          </button>
        }
      >
        <div className="filter-row">
          <input
            className="search-input"
            placeholder="SEARCH SKU / PRODUCT / ZONE..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            className="filter-select"
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
          >
            <option value="ALL">ALL DEMAND CLASSES</option>
            <option value="HIGH">CLASS A</option>
            <option value="MEDIUM">CLASS B</option>
            <option value="LOW">CLASS C</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <PackageX size={34} />
            <h3>NO STOCKOUTS DETECTED</h3>
            <p>
              No products currently have zero units in the available dataset.
              {demoNotice.includes("DEMO")
                ? " The current inventory is synthetic demo data."
                : ""}
            </p>
            <span>
              {inventory.length} INVENTORY RECORDS SCANNED
            </span>
          </div>
        ) : (
          <DataTable
            rows={filtered.map((item) => ({
              SKU_ID: item.SKU_ID,
              Description: item.Description,
              Units: item.Units,
              Demand_Class: item.Demand_Class,
              Zone: item.Zone,
              Location_ID: item.Location_ID,
            }))}
            limit={14}
          />
        )}
      </Panel>
    </div>
  );
}

export default function Dashboard({ active }: { active: ModuleKey }) {
  const [skuQuery, setSkuQuery] = useState("");
  const [zone, setZone] = useState("ALL");
  const [scenarioUnits, setScenarioUnits] = useState(1000);
  const [scenarioDistance, setScenarioDistance] = useState(12);
  const [simulated, setSimulated] = useState(false);

  const filtered = useMemo(
    () =>
      inventory.filter(
        (r) =>
          (zone === "ALL" || r.Zone === zone) &&
          Object.values(r).some((v) =>
            String(v).toLowerCase().includes(skuQuery.toLowerCase())
          )
      ),
    [zone, skuQuery]
  );

  const nodeRows = warehouseNodes.map((n) => ({
    ...n,
    X_m: n.X_m.toFixed(1),
    Y_m: n.Y_m.toFixed(1),
    Z_m: n.Z_m.toFixed(1),
  }));

  const metrics = [
    {
      label: "TOTAL SKU RECORDS",
      value: formatNum(inventory.length),
      delta: "DEMO DATASET",
      icon: <Boxes />,
    },
    {
      label: "WAREHOUSE NODES",
      value: formatNum(warehouseNodes.length),
      delta: "SPATIAL MODEL",
      icon: <MapPinned />,
    },
    {
      label: "ALLOCATED NODES",
      value: formatNum(
        warehouseNodes.filter((n) => n.Allocation_Status === "ALLOCATED").length
      ),
      delta: "ALLOCATION STATUS",
      icon: <Activity />,
    },
    {
      label: "EXCEPTIONS",
      value: formatNum(
        inventory.filter((i) => i.Status !== "ALLOCATED").length
      ),
      delta: "REQUIRES REVIEW",
      icon: <AlertTriangle />,
    },
  ];

  const downloadCsv = () => {
    const rows = filtered;
    const cols = Object.keys(rows[0] ?? {});
    const csv = [
      cols.join(","),
      ...rows.map((r) =>
        cols.map((c) => JSON.stringify((r as any)[c] ?? "")).join(",")
      ),
    ].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "snakecharmers-inventory-demo.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  if (active === "guide") {
    return <GuidePage />;
  }

  return (
    <>
      <div className="page-title">
        <div>
          <div className="eyebrow">
            {titles[active].tag} <span>// [SECURE_VIEW]</span>
          </div>
          <h2>{titles[active].title}</h2>
          <p>{titles[active].caption}</p>
        </div>
        <div className="page-live">
          <span className="pulse-dot" /> SYSTEM NOMINAL
        </div>
      </div>
      <div className="demo-banner">
        <span>ⓘ</span>
        <strong>{demoNotice}</strong>
      </div>

      {active === "overview" && (
        <>
          <div className="metrics-grid">
            {metrics.map((m) => (
              <MetricCard key={m.label} {...m} />
            ))}
          </div>
          <div className="content-grid two-col">
            <Panel title="ALLOCATION MATRIX" eyebrow="WAREHOUSE // NODE STATE">
              <AllocationChart />
            </Panel>
            <Panel title="DEMAND CLASS DISTRIBUTION" eyebrow="INVENTORY // SKU SEGMENTS">
              <DemandChart />
            </Panel>
          </div>
          <div className="content-grid two-col">
            <Panel title="THROUGHPUT TREND" eyebrow="WEEKLY // ILLUSTRATIVE INDEX">
              <TrendChart />
            </Panel>
            <Panel title="SYSTEM EVENT STREAM" eyebrow="EVENT LOG // DEMO">
              <div className="event-list">
                {[
                  ["00:00:01.204", "INFO", "Inventory adapter initialized"],
                  ["00:00:01.512", "SYNC", "Warehouse node map loaded"],
                  ["00:00:02.008", "WARN", "Demo records include review flags"],
                  ["00:00:02.410", "READY", "Frontend visualization online"],
                ].map((e) => (
                  <div className="event" key={e[0]}>
                    <code>{e[0]}</code>
                    <b className={e[1] === "WARN" ? "warn" : ""}>{e[1]}</b>
                    <span>{e[2]}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
          <Panel title="INVENTORY SNAPSHOT" eyebrow="LATEST RECORDS">
            <DataTable rows={inventory.slice(0, 14)} />
          </Panel>
        </>
      )}

      {active === "warehouse" && (
        <>
          <Panel title="AUTONOMOUS WAREHOUSE // 3D SPATIAL MODEL" eyebrow="INTERACTIVE SCENE">
            <Warehouse3D />
          </Panel>
          <div className="content-grid two-col">
            <Panel title="TOP-DOWN NODE PROJECTION" eyebrow="X/Y COORDINATES">
              <div className="floor-map">
                {warehouseNodes.slice(0, 126).map((n) => (
                  <div
                    title={`${n.Location_ID} // ${n.Allocation_Status}`}
                    key={n.Location_ID}
                    className={`floor-node ${
                      n.Allocation_Status === "VACANT" ? "vacant" : ""
                    }`}
                    style={{
                      left: `${4 + (n.X_m / 42) * 90}%`,
                      top: `${5 + (n.Y_m / 25) * 88}%`,
                    }}
                  />
                ))}
              </div>
              <div className="legend">
                <span>
                  <i className="success-dot" /> ALLOCATED
                </span>
                <span>
                  <i className="vacant-dot" /> VACANT
                </span>
              </div>
            </Panel>
            <Panel title="DATA INSPECTOR // RAW GRID" eyebrow="NODE SEARCH">
              <DataTable rows={nodeRows} limit={9} />
            </Panel>
          </div>
        </>
      )}

      {active === "inventory" && (
        <>
          <div className="filter-row">
            <label>
              ZONE FILTER
              <select value={zone} onChange={(e) => setZone(e.target.value)}>
                <option>ALL</option>
                {["A", "B", "C", "D"].map((z) => (
                  <option key={z}>{z}</option>
                ))}
              </select>
            </label>
            <label className="search-filter">
              <Search size={15} />
              <input
                value={skuQuery}
                onChange={(e) => setSkuQuery(e.target.value)}
                placeholder="SEARCH SKU, ZONE, LOCATION..."
              />
            </label>
            <button className="action-button" onClick={downloadCsv}>
              <Download size={15} /> EXPORT CSV
            </button>
          </div>
          <Panel title="INVENTORY MATRIX" eyebrow="SLOTTING // FILTERABLE RECORDS">
            <DataTable rows={filtered} limit={14} />
          </Panel>
          <div className="content-grid two-col">
            <Panel title="DEMAND CLASS DISTRIBUTION" eyebrow="SKU SEGMENTS">
              <DemandChart />
            </Panel>
            <Panel title="NODE ALLOCATION" eyebrow="STORAGE CAPACITY">
              <AllocationChart />
            </Panel>
          </div>
        </>
      )}

      {active === "sku" && (
        <>
          <div className="search-hero">
            <Package size={25} />
            <div>
              <strong>SKU TRACE CONSOLE</strong>
              <p>Search SKU, description, location, demand class, or zone.</p>
            </div>
            <label>
              <Search size={16} />
              <input
                autoFocus
                value={skuQuery}
                onChange={(e) => setSkuQuery(e.target.value)}
                placeholder="ENTER QUERY..."
              />
            </label>
          </div>
          <Panel title="MATCHING SKU RECORDS" eyebrow={`QUERY // ${filtered.length} MATCHES`}>
            <DataTable rows={filtered} limit={14} />
          </Panel>
        </>
      )}

      {active === "outOfStock" && <OutOfStockPage />}

      {active === "simulator" && (
        <>
          <div className="content-grid two-col">
            <Panel title="SCENARIO PARAMETERS" eyebrow="INPUT CONTROLS">
              <div className="control-stack">
                <label>
                  WEEKLY PICK VOLUME{" "}
                  <strong>{scenarioUnits.toLocaleString("en-IN")} units</strong>
                  <input
                    type="range"
                    min="100"
                    max="10000"
                    step="100"
                    value={scenarioUnits}
                    onChange={(e) => {
                      setScenarioUnits(+e.target.value);
                      setSimulated(false);
                    }}
                  />
                </label>
                <label>
                  AVERAGE TRAVEL DISTANCE{" "}
                  <strong>{scenarioDistance} m / pick</strong>
                  <input
                    type="range"
                    min="2"
                    max="40"
                    value={scenarioDistance}
                    onChange={(e) => {
                      setScenarioDistance(+e.target.value);
                      setSimulated(false);
                    }}
                  />
                </label>
                <div className="control-actions">
                  <button
                    className="action-button primary"
                    onClick={() => setSimulated(true)}
                  >
                    <Play size={15} /> RUN DEMO ESTIMATE
                  </button>
                  <button
                    className="action-button"
                    onClick={() => {
                      setScenarioUnits(1000);
                      setScenarioDistance(12);
                      setSimulated(false);
                    }}
                  >
                    <RotateCcw size={15} /> RESET
                  </button>
                </div>
                <p className="hint">
                  Illustrative arithmetic only; not connected to the original
                  optimization solver.
                </p>
              </div>
            </Panel>
            <Panel title="SCENARIO OUTPUT" eyebrow="LOCAL ESTIMATE">
              <div className="scenario-output">
                <div>
                  <span>ESTIMATED TRAVEL / WEEK</span>
                  <strong>
                    {formatNum((scenarioUnits * scenarioDistance) / 1000)} km
                  </strong>
                </div>
                <div>
                  <span>VS. 12 M BASELINE</span>
                  <strong
                    className={
                      scenarioDistance <= 12 ? "positive" : "negative"
                    }
                  >
                    {scenarioDistance <= 12 ? "−" : "+"}
                    {formatNum(
                      Math.abs(
                        (scenarioUnits * (scenarioDistance - 12)) / 1000
                      )
                    )}{" "}
                    km
                  </strong>
                </div>
                <div>
                  <span>SCENARIO STATE</span>
                  <strong>{simulated ? "CALCULATED" : "READY"}</strong>
                </div>
              </div>
              {simulated && (
                <div className="success-message">
                  <CheckCircle2 size={16} /> Local estimate generated. This is
                  not a solver result.
                </div>
              )}
            </Panel>
          </div>
        </>
      )}

      {active === "routes" && (
        <>
          <Panel title="PICK-PATH VISUALIZER" eyebrow="XY PATH // DEMONSTRATION ROUTE">
            <RouteChart />
          </Panel>
          <div className="content-grid two-col">
            <Panel title="ROUTE SUMMARY" eyebrow="DEMO PATH">
              <div className="route-stats">
                <div>
                  <span>WAYPOINTS</span>
                  <b>7</b>
                </div>
                <div>
                  <span>EST. DISTANCE</span>
                  <b>42.8 m</b>
                </div>
                <div>
                  <span>STATUS</span>
                  <b className="warning-text">ILLUSTRATIVE</b>
                </div>
              </div>
            </Panel>
            <Panel title="ROUTE LOG" eyebrow="PATH INSPECTION">
              <div className="event-list">
                {[
                  "START_NODE // A-01",
                  "PICK_POINT // B-03",
                  "PICK_POINT // C-04",
                  "PICK_POINT // D-02",
                  "END_NODE // PACKING",
                ].map((s, i) => (
                  <div className="event" key={s}>
                    <code>WP-{String(i + 1).padStart(2, "0")}</code>
                    <span>{s}</span>
                    <ArrowRight size={13} />
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </>
      )}

      {active === "analytics" && (
        <>
          <div className="content-grid two-col">
            <Panel title="DEMAND DISTRIBUTION" eyebrow="SKU SEGMENTS">
              <DemandChart />
            </Panel>
            <Panel title="ALLOCATION COMPOSITION" eyebrow="NODE STATUS">
              <AllocationChart />
            </Panel>
          </div>
          <div className="content-grid two-col">
            <Panel title="WEEKLY THROUGHPUT INDEX" eyebrow="ILLUSTRATIVE SERIES">
              <TrendChart />
            </Panel>
            <Panel title="VOLUMETRIC FIT // METRIC INSPECTOR" eyebrow="SELECTED DISTRIBUTION">
              <div className="metric-list">
                {[
                  {
                    label: "TOTAL INVENTORY UNITS",
                    value: formatNum(
                      inventory.reduce((s, r) => s + r.Units, 0)
                    ),
                  },
                  {
                    label: "MEAN UNIT VALUE",
                    value: `₹${formatNum(
                      inventory.reduce((s, r) => s + r.Unit_Value, 0) /
                        inventory.length
                    )}`,
                  },
                  {
                    label: "AVG. CAPACITY UTILIZATION",
                    value: `${formatNum(
                      (inventory.reduce(
                        (s, r) => s + r.Units / r.Capacity,
                        0
                      ) /
                        inventory.length) *
                        100
                    )}%`,
                  },
                ].map((m) => (
                  <div key={m.label}>
                    <span>{m.label}</span>
                    <strong>{m.value}</strong>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </>
      )}

      {active === "validation" && (
        <>
          <div className="metrics-grid compact">
            <MetricCard
              label="RECORDS SCANNED"
              value={formatNum(inventory.length)}
              delta="DEMO INPUT"
              icon={<Database />}
            />
            <MetricCard
              label="REVIEW FLAGS"
              value={formatNum(
                inventory.filter((i) => i.Status === "REVIEW").length
              )}
              delta="DEMO RULE"
              icon={<AlertTriangle />}
            />
            <MetricCard
              label="LOW STOCK FLAGS"
              value={formatNum(
                inventory.filter((i) => i.Status === "LOW STOCK").length
              )}
              delta="DEMO RULE"
              icon={<Activity />}
            />
            <MetricCard
              label="CHECK STATUS"
              value="LOCAL"
              delta="NOT SOLVER VALIDATION"
              icon={<CheckCircle2 />}
            />
          </div>
          <Panel title="CONSTRAINT VALIDATION LOG" eyebrow="LOCAL DATA QUALITY CHECKS">
            <DataTable
              rows={inventory
                .filter((i) => i.Status !== "ALLOCATED")
                .map((i) => ({
                  SKU_ID: i.SKU_ID,
                  LOCATION_ID: i.Location_ID,
                  STATUS: i.Status,
                  CHECK:
                    i.Status === "REVIEW"
                      ? "MANUAL REVIEW FLAG"
                      : "LOW STOCK FLAG",
                  SOURCE: "DEMO DATA",
                }))}
              limit={14}
            />
          </Panel>
        </>
      )}

      {active === "downloads" && (
        <>
          <Panel title="EXPORT CENTER" eyebrow="LOCAL DATA EXPORTS">
            <div className="download-grid">
              <div className="download-card">
                <Database />
                <div>
                  <strong>Inventory records</strong>
                  <span>CSV // filtered demo inventory</span>
                </div>
                <button className="action-button" onClick={downloadCsv}>
                  <Download size={14} /> EXPORT
                </button>
              </div>
              <div className="download-card">
                <MapPinned />
                <div>
                  <strong>Warehouse nodes</strong>
                  <span>CSV // demo coordinate data</span>
                </div>
                <button
                  className="action-button"
                  onClick={() => {
                    const cols = Object.keys(warehouseNodes[0]);
                    const csv = [
                      cols.join(","),
                      ...warehouseNodes.map((r) =>
                        cols.map((c) => JSON.stringify((r as any)[c])).join(",")
                      ),
                    ].join("\n");
                    const a = document.createElement("a");
                    a.href = URL.createObjectURL(
                      new Blob([csv], { type: "text/csv" })
                    );
                    a.download = "warehouse-nodes-demo.csv";
                    a.click();
                    URL.revokeObjectURL(a.href);
                  }}
                >
                  <Download size={14} /> EXPORT
                </button>
              </div>
            </div>
            <p className="hint">
              Exports are based on demonstration records until the original
              data source is connected.
            </p>
          </Panel>
        </>
      )}

      {active === "roi" && (
        <>
          <div className="content-grid two-col">
            <Panel title="ROI INPUTS" eyebrow="EDITABLE LOCAL MODEL">
              <div className="control-stack">
                <label>
                  ESTIMATED MONTHLY SAVINGS (₹)<strong>₹25,000</strong>
                  <input
                    type="range"
                    min="0"
                    max="200000"
                    step="5000"
                    defaultValue="25000"
                    id="roi-savings"
                  />
                </label>
                <label>
                  IMPLEMENTATION COST (₹)<strong>₹3,00,000</strong>
                  <input
                    type="range"
                    min="50000"
                    max="2000000"
                    step="50000"
                    defaultValue="300000"
                    id="roi-cost"
                  />
                </label>
                <p className="hint">
                  ROI fields are illustrative; connect the backend's ROI model
                  for authoritative outputs.
                </p>
                </div>
              </Panel>
              <Panel title="ROI SUMMARY" eyebrow="DEMO CALCULATION">
                <div className="scenario-output">
                  <div>
                    <span>ANNUALIZED SAVINGS</span>
                    <strong>₹3,00,000</strong>
                  </div>
                  <div>
                    <span>PAYBACK PERIOD</span>
                    <strong>12 months</strong>
                  </div>
                  <div>
                    <span>MODEL SOURCE</span>
                    <strong>ILLUSTRATIVE</strong>
                  </div>
                </div>
              </Panel>
            </div>
            <Panel title="COST & BENEFIT NOTES" eyebrow="ROI ASSUMPTIONS">
              <div className="event-list">
                {[
                  "Savings are a user-adjustable scenario assumption.",
                  "Implementation cost is an illustrative starting value.",
                  "No actual solver output or financial forecast is represented.",
                ].map((x, i) => (
                  <div className="event" key={i}>
                    <CheckCircle2 size={14} />
                    <span>{x}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </>
        )}

        <footer className="page-footer">
          <span>SNAKECHARMERS // WAREHOUSE INTELLIGENCE</span>
          <span>
            <Clock3 size={12} /> UI SESSION ACTIVE
          </span>
          <span>CPU TEMP: OMITTED</span>
        </footer>
      </>
    );
  }
  function GuidePage() {
  return <GuidePortal markdown={guideMarkdown} />;
}
