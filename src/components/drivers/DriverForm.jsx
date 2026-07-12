import React, { useState } from "react";

export default function DriverForm({ initial = {}, onSave, onCancel }) {
  const [name, setName] = useState(initial.name || "");
  const [license, setLicense] = useState(initial.license || "");
  const [category, setCategory] = useState(initial.category || "B");
  const [expiry, setExpiry] = useState(initial.expiry || "");
  const [status, setStatus] = useState(initial.status || "Available");

  function submit(e) {
    e.preventDefault();

    onSave({
      name,
      license,
      category,
      expiry,
      status,
    });

    setName("");
    setLicense("");
    setCategory("B");
    setExpiry("");
    setStatus("Available");
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: "15px" }}>
      <label>
        Driver Name
        <input
          className="search-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </label>

      <label>
        License Number
        <input
          className="search-input"
          value={license}
          onChange={(e) => setLicense(e.target.value)}
          required
        />
      </label>

      <label>
        Category
        <select
          className="search-input"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option>A</option>
          <option>B</option>
          <option>C1</option>
        </select>
      </label>

      <label>
        Expiry Date
        <input
          className="search-input"
          type="date"
          value={expiry}
          onChange={(e) => setExpiry(e.target.value)}
          required
        />
      </label>

      <label>
        Status
        <select
          className="search-input"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option>Available</option>
          <option>On Trip</option>
          <option>Suspended</option>
        </select>
      </label>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px",
        }}
      >
        <button
          type="button"
          className="btn"
          onClick={onCancel}
          style={{ background: "#888" }}
        >
          Cancel
        </button>

        <button className="btn" type="submit">
          Save Driver
        </button>
      </div>
    </form>
  );
}