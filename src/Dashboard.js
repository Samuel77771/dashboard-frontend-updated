
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://fastapi-dashboard-1czm.onrender.com/api/dashboard-data');
        if (Array.isArray(response.data)) {
          setData(response.data);
          setFilteredData(response.data);
        } else {
          throw new Error('Unexpected response format');
        }
      } catch (err) {
        console.error("API error:", err);
        setError('Failed to load dashboard data. Ensure the backend is running and returns an array.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    setFilteredData(data.filter(row =>
      row.Description.toLowerCase().includes(value) ||
      String(row.Kits_ID).toLowerCase().includes(value)
    ));
  };

  const handleExport = () => {
    if (!filteredData.length) return;
    const csv = [
      Object.keys(filteredData[0]).join(','),
      ...filteredData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dashboard_data.csv';
    a.click();
  };

  const triggerProduction = async (row) => {
    try {
      const response = await axios.post(`https://fastapi-dashboard-1czm.onrender.com/api/trigger-production/${row.Kits_ID}`);
      alert(response.data.message);
    } catch (err) {
      console.error('Trigger production error:', err);
      alert(`Failed to trigger production for ${row.Kits_ID}`);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Production Dashboard</h2>

      <div className="flex items-center gap-4 mb-4">
        <input
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder="Search Kits ID or Description"
          className="border px-3 py-1 rounded"
        />
        <button onClick={handleExport} className="bg-blue-500 text-white px-4 py-2 rounded">Export CSV</button>
      </div>

      <table className="w-full border-collapse border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Kits ID</th>
            <th className="border p-2">Description</th>
            <th className="border p-2">Net Stock</th>
            <th className="border p-2">Forecast</th>
            <th className="border p-2">Max Producible</th>
            <th className="border p-2">Suggested Production</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="border p-2">{row.Kits_ID}</td>
              <td className="border p-2">{row.Description}</td>
              <td className="border p-2">{row.Net_Stock}</td>
              <td className="border p-2">{row.Forecast}</td>
              <td className="border p-2">{row.Max_Producible}</td>
              <td className="border p-2">{row.Suggested_Production}</td>
              <td className="border p-2">
                <button
                  onClick={() => triggerProduction(row)}
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  Trigger
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;
