import ReportForm from "../components/ReportForm";

export default function ReportPage() {
  return (
    <div className="page-shell">
      <h2 className="page-title">Report a Threat</h2>
      <p className="page-sub">Help keep your community safe.</p>
      <ReportForm />
    </div>
  );
}