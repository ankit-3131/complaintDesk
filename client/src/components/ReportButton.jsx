import React from 'react';
import axios from 'axios';

export default function ReportButton({ defaultYear, defaultMonth }) {
  const handleDownload = async () => {
    try {
      const year = prompt('Enter year (YYYY):', defaultYear || new Date().getFullYear());
      const month = prompt('Enter month (1-12):', defaultMonth || (new Date().getMonth() + 1));
      if (!year || !month) return;
      const url = `http://localhost:3000/ticket/report/monthly?year=${encodeURIComponent(year)}&month=${encodeURIComponent(month)}`;
      const resp = await axios.get(url, { responseType: 'blob', withCredentials: true });
      const blob = new Blob([resp.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `monthly-report-${year}-${String(month).padStart(2,'0')}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('report download error', err?.response?.data || err.message || err);
      alert('Failed to download report (check console)');
    }
  };

  return (
    <button onClick={handleDownload} className="px-3 py-1 bg-blue-600 text-white rounded">Download Monthly Report</button>
  );
}
