import React, { useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import SearchBar from "../components/common/SearchBar";
import DriverTable from "../components/drivers/DriverTable";
import DriverForm from "../components/drivers/DriverForm";

const seedDrivers = Array.from({ length: 20 }).map((_, i) => ({
  name: `Driver ${i + 1}`,
  license: `LIC-${3000 + i}`,
  category: ["C1", "B", "A"][i % 3],
  expiry: `2027-${String((i % 12) + 1).padStart(2, "0")}-15`,
  status:
    i % 8 === 0
      ? "Suspended"
      : i % 6 === 0
      ? "On Trip"
      : "Available",
}));

export default function Drivers() {
  const [q, setQ] = useState("");
  const [drivers, setDrivers] = useState(seedDrivers);
  const [showForm, setShowForm] = useState(false);

  const filtered = drivers.filter(
    (d) =>
      d.name.toLowerCase().includes(q.toLowerCase()) ||
      d.license.toLowerCase().includes(q.toLowerCase())
  );

  function handleSave(driver) {
    setDrivers([...drivers, driver]);
    setShowForm(false);
  }

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h2>Drivers</h2>
          <div className="muted">
            Manage driver records, licenses and statuses
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <SearchBar
            value={q}
            onChange={setQ}
            placeholder="Search drivers or license"
          />

          <button
            className="btn"
            onClick={() => setShowForm(true)}
          >
            Add Driver
          </button>
        </div>
      </div>

      {showForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="card"
            style={{
              width: 500,
              background: "#fff",
              padding: 25,
              borderRadius: 10,
            }}
          >
            <h3>Add Driver</h3>

            <DriverForm
              onSave={handleSave}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      <div className="panel card">
        <DriverTable data={filtered} />
      </div>
    </DashboardLayout>
  );
}