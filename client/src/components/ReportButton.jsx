import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export default function ReportButton({ defaultYear, defaultMonth }) {
  const [isOpen, setIsOpen] = useState(false);
  const [year, setYear] = useState(defaultYear || new Date().getFullYear());
  const [month, setMonth] = useState(defaultMonth || (new Date().getMonth() + 1));
  const [loading, setLoading] = useState(false);

  const months = [
    { num: 1, name: 'January' },
    { num: 2, name: 'February' },
    { num: 3, name: 'March' },
    { num: 4, name: 'April' },
    { num: 5, name: 'May' },
    { num: 6, name: 'June' },
    { num: 7, name: 'July' },
    { num: 8, name: 'August' },
    { num: 9, name: 'September' },
    { num: 10, name: 'October' },
    { num: 11, name: 'November' },
    { num: 12, name: 'December' }
  ];

  const currentYear = new Date().getFullYear();
  const availableYears = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

  const handleDownload = async () => {
    setLoading(true);
    const toastId = toast.loading('Generating PDF report...');
    try {
      const token = localStorage.getItem('token');
      const headers = {
        Accept: 'application/pdf',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const url = `${BACKEND_URL}/ticket/report/monthly?year=${encodeURIComponent(year)}&month=${encodeURIComponent(month)}`;
      const resp = await axios.get(url, {
        responseType: 'blob',
        withCredentials: true,
        headers
      });

      const blob = new Blob([resp.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `monthly-report-${year}-${String(month).padStart(2, '0')}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success('Monthly report downloaded!', { id: toastId });
      setIsOpen(false);
    } catch (err) {
      console.error('report download error', err);
      let errorMsg = 'Failed to generate report';
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const json = JSON.parse(text);
          errorMsg = json.message || errorMsg;
        } catch (_) {}
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }
      toast.error(errorMsg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-600/25 hover:shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all"
        title="Download Monthly Grievance PDF Report"
      >
        <PictureAsPdfIcon className="!text-sm text-red-300" />
        <span>Monthly Report</span>
      </button>

      {/* Modal Dialog rendered via Portal to break free from parent stacking context */}
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700/90 shadow-2xl shadow-black/80 p-6 text-slate-100 flex flex-col gap-4 scale-100 animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-sm">
                  <PictureAsPdfIcon className="!text-xl" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">Monthly Operations Report</h3>
                  <p className="text-[11px] text-slate-400">Download formatted PDF overview</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <CloseIcon className="!text-base" />
              </button>
            </div>

            {/* Selectors */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1.5">Select Month</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer"
                >
                  {months.map((m) => (
                    <option key={m.num} value={m.num} className="bg-slate-900 text-slate-100">
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1.5">Select Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer"
                >
                  {availableYears.map((y) => (
                    <option key={y} value={y} className="bg-slate-900 text-slate-100">
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-600/25 disabled:opacity-60 transition-all hover:scale-105 active:scale-95"
              >
                <DownloadIcon className="!text-sm" />
                <span>{loading ? 'Generating...' : 'Download PDF'}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
