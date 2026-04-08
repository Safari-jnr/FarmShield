import React, { useState, useEffect } from "react";
import { apiFetch, getUser } from "../services/api";

export default function ReportHistory() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      try {
        const user = getUser();
        if (!user?.id) {
          setLoading(false);
          return;
        }
        const data = await apiFetch(`/reports/my-reports?user_id=${user.id}`);
        setReports(data.reports || []);
      } catch (err) {
        console.error("Error fetching reports:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  if (loading) return <div style={{padding: "20px"}}>Loading reports...</div>;

  return (
    <div className="page-shell" style={{ padding: "20px", paddingBottom: "80px" }}>
      <h1>📋 Your Reports</h1>
      {reports.length === 0 ? (
        <div style={{textAlign: "center", color: "#666", marginTop: "40px"}}>
          No reports submitted yet
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {reports.map((report) => (
            <div key={report.id} style={{
              background: '#f8fafc',
              padding: '16px',
              borderRadius: '12px',
              borderLeft: report.verified ? '4px solid #22c55e' : '4px solid #f59e0b'
            }}>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                {report.threat_type === 'bandits' && '⚠️ Bandits'}
                {report.threat_type === 'sick_crops' && '🌾 Sick Crops'}
                {report.threat_type === 'pests' && '🐛 Pests'}
                {report.threat_type === 'dead_animals' && '💀 Dead Animals'}
                {report.threat_type === 'other' && '⚠️ Other'}
                {report.threat_type === 'flood' && '🌊 Flood'}
              </div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                {report.description || "No description"}
              </div>
              {report.photo_url && (
                <img 
                  src={`http://localhost:8000/${report.photo_url}`} 
                  alt="Report" 
                  style={{width: "100%", maxHeight: "200px", objectFit: "cover", borderRadius: "8px", marginBottom: "8px"}}
                />
              )}
              <div style={{ fontSize: '12px', color: '#999' }}>
                {new Date(report.created_at).toLocaleDateString()} • 
                {report.verified ? ' ✅ Verified (+10 pts)' : ' ⏳ Pending'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}