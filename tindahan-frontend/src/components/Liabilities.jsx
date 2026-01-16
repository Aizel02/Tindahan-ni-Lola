import Tabs from "../components/Tabs";

export default function Liabilities() {
  return (
    <div className="liabilities-page">
      <Header />
      <Tabs />

      <div className="liabilities-section">
        <div className="liabilities-header">
          <input
            type="text"
            placeholder="Search person who owed..."
            className="liabilities-search"
          />
          <button className="add-liability-btn">+ Add Liability</button>
        </div>

        <div className="liabilities-empty">
          No liabilities recorded. Add one to get started!
        </div>
      </div>
    </div>
  );
}
