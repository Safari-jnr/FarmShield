import React, { useState, useEffect } from "react";
import { apiFetch, getUser } from "../services/api";

export default function RewardsPage() {
  const [rewards, setRewards] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const user = getUser();
        console.log("=== REWARDS DEBUG ===");
        console.log("Raw user from getUser():", user);
        
        // EMERGENCY FIX: Ensure we have a user ID
        let userId = user?.id;
        if (!userId) {
          // Try to extract from phone or use default
          userId = user?.phone ? parseInt(user.phone.replace(/\D/g, '').slice(-4)) || 1 : 1;
          console.log("Generated userId:", userId);
        }

        // Fetch rewards
        const userRewards = await apiFetch(`/rewards/${userId}`);
        console.log("Rewards API response:", userRewards);
        setRewards(userRewards);
        
        // Fetch leaderboard
        const topFarmers = await apiFetch('/rewards/leaderboard/top');
        setLeaderboard(topFarmers || []);
      } catch (err) {
        console.error("Error fetching rewards:", err);
        setError(`Failed: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div style={{padding: "20px"}}>Loading rewards...</div>;
  if (error) return <div style={{padding: "20px", color: "red"}}>⚠️ {error}</div>;

  const badgeEmojis = {
    "Seedling": "🌱",
    "Sprout": "🌿", 
    "Farmer": "👨‍🌾",
    "Master Farmer": "🏆",
    "Guardian": "🛡️"
  };

  return (
    <div className="page-shell" style={{ padding: "20px", paddingBottom: "80px" }}>
      <h1>🏆 Your Rewards</h1>
      
      {/* Points Card */}
      <div style={{
        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        color: 'white',
        padding: '24px',
        borderRadius: '16px',
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Total Points</div>
        <div style={{ fontSize: '56px', fontWeight: 'bold' }}>{rewards?.points || 0}</div>
        <div style={{ fontSize: '18px', marginTop: '8px' }}>
          {badgeEmojis[rewards?.badge_level] || "🌱"} {rewards?.badge_level || "Seedling"}
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginBottom: '24px'
      }}>
        <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a' }}>
            {rewards?.reports_submitted || 0}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>Reports</div>
        </div>
        <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a' }}>
            {rewards?.check_ins || 0}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>Check-ins</div>
        </div>
      </div>

      {/* Progress to Next Badge */}
      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
        <div style={{ fontWeight: '600', marginBottom: '8px' }}>Next Badge Progress</div>
        <div style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
          {rewards?.points < 100 ? `${100 - rewards.points} pts to Sprout` :
           rewards?.points < 500 ? `${500 - rewards.points} pts to Farmer` :
           rewards?.points < 1000 ? `${1000 - rewards.points} pts to Master` :
           "Max level reached!"}
        </div>
        <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{
            width: `${Math.min((rewards?.points || 0) / 1000 * 100, 100)}%`,
            height: '100%',
            background: '#22c55e',
            borderRadius: '4px'
          }} />
        </div>
      </div>

      {/* Leaderboard */}
      <h2 style={{ marginBottom: '16px' }}>🏅 Top Farmers</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {leaderboard.length === 0 ? (
          <div style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
            No leaderboard data yet
          </div>
        ) : (
          leaderboard.map((farmer, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px',
              background: farmer.phone === rewards?.phone ? '#f0fdf4' : '#f8fafc',
              borderRadius: '12px',
              border: farmer.phone === rewards?.phone ? '2px solid #22c55e' : 'none'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : index === 2 ? '#b45309' : '#e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                marginRight: '12px'
              }}>
                {index + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600' }}>
                  {farmer.name || `Farmer ${index + 1}`}
                  {farmer.phone === rewards?.phone && " (You)"}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {badgeEmojis[farmer.badge_level] || "🌱"} {farmer.badge_level}
                </div>
              </div>
              <div style={{ fontWeight: 'bold', color: '#16a34a' }}>
                {farmer.points} pts
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}