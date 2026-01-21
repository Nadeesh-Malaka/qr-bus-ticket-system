import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiDownload, FiCalendar, FiDollarSign, FiTruck, FiTrendingUp } from 'react-icons/fi';
import axios from 'axios';
import '../pages/AdminDashboard.css';

export default function OperatorReports() {
  const { user } = useAuth();
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [summary, setSummary] = useState({
    totalBuses: 0,
    totalBookings: 0,
    totalRevenue: 0,
    avgRevenuePerBus: 0
  });

  useEffect(() => {
    if (user?.user_id) {
      const currentMonth = new Date().getMonth() + 1;
      setSelectedMonth(currentMonth.toString().padStart(2, '0'));
    }
  }, [user]);

  useEffect(() => {
    if (user?.user_id && selectedMonth) {
      fetchMonthlyReport();
    }
  }, [user, selectedMonth, selectedYear]);

  const fetchMonthlyReport = async () => {
    try {
      const response = await axios.get(
        `http://localhost/qrsys/api/get_operator_monthly_report.php?operator_id=${user.user_id}&month=${selectedMonth}&year=${selectedYear}`
      );
      
      if (response.data.success) {
        setReportData(response.data.report);
        calculateSummary(response.data.report);
      } else {
        console.error('Failed to fetch report:', response.data.message);
        setReportData([]);
        calculateSummary([]);
      }
    } catch (error) {
      console.error('Error fetching monthly report:', error);
      setReportData([]);
      calculateSummary([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (data) => {
    const totalBuses = data.length;
    const totalBookings = data.reduce((sum, item) => sum + parseInt(item.total_bookings || 0), 0);
    const totalRevenue = data.reduce((sum, item) => sum + parseFloat(item.total_revenue || 0), 0);
    const avgRevenuePerBus = totalBuses > 0 ? totalRevenue / totalBuses : 0;

    setSummary({
      totalBuses,
      totalBookings,
      totalRevenue,
      avgRevenuePerBus
    });
  };

  const handleExportReport = () => {
    // Convert report to CSV
    const headers = ['Bus Number', 'Route', 'Total Bookings', 'Total Revenue', 'Avg. per Booking'];
    const csvContent = [
      headers.join(','),
      ...reportData.map(row => [
        row.bus_no,
        `"${row.route_name || 'N/A'}"`,
        row.total_bookings,
        row.total_revenue,
        row.avg_per_booking
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `operator_report_${selectedYear}_${selectedMonth}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  if (loading) {
    return (
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Reports</h1>
          <p>Loading report data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Monthly Income Report</h1>
          <p>Business insights and performance metrics</p>
        </div>
        <button 
          className="btn-primary"
          onClick={handleExportReport}
          disabled={reportData.length === 0}
        >
          <FiDownload /> Export Report
        </button>
      </div>

      {/* Date Selector */}
      <div className="dashboard-section">
        <div className="filters-bar">
          <div className="filter-group">
            <label><FiCalendar /> Select Period:</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="form-control"
                style={{ width: '150px' }}
              >
                {months.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="form-control"
                style={{ width: '100px' }}
              >
                {years.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-info">
              <p className="stat-title">Total Buses</p>
              <h2 className="stat-value">{summary.totalBuses}</h2>
            </div>
            <div className="stat-icon" style={{ backgroundColor: '#e3f2fd', color: '#3498db' }}>
              <FiTruck size={32} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-info">
              <p className="stat-title">Total Bookings</p>
              <h2 className="stat-value">{summary.totalBookings}</h2>
            </div>
            <div className="stat-icon" style={{ backgroundColor: '#e8f5e9', color: '#2ecc71' }}>
              <FiCalendar size={32} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-info">
              <p className="stat-title">Total Revenue</p>
              <h2 className="stat-value">Rs. {summary.totalRevenue.toFixed(2)}</h2>
            </div>
            <div className="stat-icon" style={{ backgroundColor: '#fff3e0', color: '#f39c12' }}>
              <FiDollarSign size={32} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-info">
              <p className="stat-title">Avg. per Bus</p>
              <h2 className="stat-value">Rs. {summary.avgRevenuePerBus.toFixed(2)}</h2>
            </div>
            <div className="stat-icon" style={{ backgroundColor: '#f3e5f5', color: '#9b59b6' }}>
              <FiTrendingUp size={32} />
            </div>
          </div>
        </div>
      </div>

      {/* Report Table */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Detailed Report</h2>
          <p>Bus-wise breakdown for {months.find(m => m.value === selectedMonth)?.label} {selectedYear}</p>
        </div>

        {reportData.length === 0 ? (
          <div className="info-card">
            <p>No data available for the selected period.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bus Number</th>
                  <th>Route</th>
                  <th>Total Bookings</th>
                  <th>Total Revenue</th>
                  <th>Avg. per Booking</th>
                  <th>Performance</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((row, index) => {
                  const performance = summary.totalRevenue > 0 
                    ? ((parseFloat(row.total_revenue) / summary.totalRevenue) * 100).toFixed(1)
                    : 0;
                  
                  return (
                    <tr key={index}>
                      <td><strong>{row.bus_no}</strong></td>
                      <td>{row.route_name || 'N/A'}</td>
                      <td>{row.total_bookings}</td>
                      <td>Rs. {parseFloat(row.total_revenue).toFixed(2)}</td>
                      <td>Rs. {parseFloat(row.avg_per_booking).toFixed(2)}</td>
                      <td>
                        <div className="performance-bar">
                          <div 
                            className="performance-fill" 
                            style={{ 
                              width: `${performance}%`,
                              backgroundColor: performance > 20 ? '#2ecc71' : '#f39c12'
                            }}
                          ></div>
                          <span className="performance-text">{performance}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .performance-bar {
          position: relative;
          width: 100%;
          height: 24px;
          background: #ecf0f1;
          border-radius: 12px;
          overflow: hidden;
        }

        .performance-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .performance-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 12px;
          font-weight: 600;
          color: #2c3e50;
        }
      `}</style>
    </div>
  );
}
