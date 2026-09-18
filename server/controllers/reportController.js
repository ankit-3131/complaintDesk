import PDFDocument from 'pdfkit';
import Ticket from '../models/ticket.js';

function msToDuration(ms) {
  if (!ms || ms < 0) return '-';
  const totalMins = Math.round(ms / (60 * 1000));
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
}

export async function monthlyReport(req, res) {
  try {
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const month = parseInt(req.query.month, 10);
    if (!month || month < 1 || month > 12) {
      return res.status(400).json({ message: 'Provide valid query params ?year=YYYY&month=MM (month 1-12)' });
    }

    const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const end = new Date(Date.UTC(year, month, 1, 0, 0, 0));

    // Find tickets created within that month
    const tickets = await Ticket.find({ createdAt: { $gte: start, $lt: end } })
      .populate('citizenId', 'name email')
      .populate('inProgressBy', 'name email')
      .sort({ createdAt: -1 });

    const total = tickets.length;
    const totalResolved = tickets.filter(t => t.status === 'Resolved').length;
    const totalInProgress = tickets.filter(t => t.status === 'In Progress').length;
    const totalOpen = tickets.filter(t => t.status === 'Open').length;

    // Compute average resolve times for resolved tickets
    const resolvedTimes = tickets
      .filter(t => t.status === 'Resolved' && t.resolvedAt && t.createdAt)
      .map(t => new Date(t.resolvedAt).getTime() - new Date(t.createdAt).getTime());

    const avgResolveMs = resolvedTimes.length
      ? Math.round(resolvedTimes.reduce((a, b) => a + b, 0) / resolvedTimes.length)
      : 0;

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthName = monthNames[month - 1];

    // Initialize PDF with bufferPages enabled for clean page numbering
    const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });
    const filename = `monthly-report-${year}-${String(month).padStart(2, '0')}.pdf`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/pdf');

    doc.pipe(res);

    // --- Header Section ---
    doc.fillColor('#0f172a').fontSize(22).font('Helvetica-Bold').text('ComplaintDesk', { align: 'left' });
    doc.fillColor('#64748b').fontSize(10).font('Helvetica').text('CIVIC OPERATIONS & GRIEVANCE REPORT', { align: 'left' });
    doc.moveDown(0.5);

    doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.8);

    // Subheader info
    doc.fillColor('#1e293b').fontSize(14).font('Helvetica-Bold').text(`Monthly Summary: ${monthName} ${year}`);
    doc.fillColor('#64748b').fontSize(9).font('Helvetica').text(`Generated on: ${new Date().toUTCString()}`);
    doc.moveDown(1);

    // --- KPI Metric Cards (Grid) ---
    const statsTop = doc.y;
    const colWidth = 115;
    const cardHeight = 55;

    const metrics = [
      { label: 'Total Tickets', val: String(total), color: '#3b82f6' },
      { label: 'Resolved', val: String(totalResolved), color: '#10b981' },
      { label: 'In Progress', val: String(totalInProgress), color: '#f59e0b' },
      { label: 'Open Issues', val: String(totalOpen), color: '#ef4444' }
    ];

    metrics.forEach((m, idx) => {
      const x = 50 + idx * (colWidth + 10);
      doc.rect(x, statsTop, colWidth, cardHeight).fillAndStroke('#f8fafc', '#e2e8f0');
      doc.fillColor(m.color).fontSize(18).font('Helvetica-Bold').text(m.val, x + 10, statsTop + 10);
      doc.fillColor('#64748b').fontSize(9).font('Helvetica').text(m.label, x + 10, statsTop + 34);
    });

    doc.y = statsTop + cardHeight + 20;

    // Additional metric: avg resolve time
    doc.fillColor('#334155').fontSize(10).font('Helvetica-Bold').text('Performance Metric:');
    doc.fillColor('#475569').fontSize(10).font('Helvetica').text(
      `  • Average Resolution Time: ${avgResolveMs ? msToDuration(avgResolveMs) : 'N/A'}`
    );
    doc.moveDown(1.2);

    // --- Tickets Section Header ---
    doc.fillColor('#0f172a').fontSize(13).font('Helvetica-Bold').text('Incident Details');
    doc.moveDown(0.4);
    doc.strokeColor('#cbd5e1').lineWidth(0.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.6);

    if (tickets.length === 0) {
      doc.fillColor('#94a3b8').fontSize(11).font('Helvetica-Oblique').text('No tickets were submitted during this period.', { align: 'center' });
    } else {
      tickets.forEach((t, idx) => {
        // Check if approaching page bottom
        if (doc.y > doc.page.height - 100) {
          doc.addPage();
        }

        const citizenName = t.citizenId?.name || 'Anonymous';
        const formattedDate = new Date(t.createdAt).toLocaleDateString();

        // Ticket Title & Number
        doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold').text(`${idx + 1}. ${t.title}`);
        
        // Metadata Line
        const metaText = `Category: ${t.category || 'General'}  |  Priority: ${t.priority || 'Low'}  |  Status: ${t.status}  |  Submitted: ${formattedDate} by ${citizenName}`;
        doc.fillColor('#64748b').fontSize(8.5).font('Helvetica').text(`    ${metaText}`);
        
        if (t.description) {
          const cleanDesc = t.description.length > 120 ? t.description.slice(0, 120) + '...' : t.description;
          doc.fillColor('#475569').fontSize(8.5).font('Helvetica-Oblique').text(`    Note: "${cleanDesc}"`);
        }

        doc.moveDown(0.5);
      });
    }

    // --- Safe Page Numbering (Buffered) ---
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      const bottom = doc.page.height - 35;
      doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(50, bottom - 10).lineTo(545, bottom - 10).stroke();
      doc.fillColor('#94a3b8').fontSize(8).font('Helvetica').text(
        `ComplaintDesk Civic Operations Report • Page ${i + 1} of ${range.count}`,
        50,
        bottom,
        { align: 'center', width: 495 }
      );
    }

    doc.end();
  } catch (err) {
    console.error('monthlyReport error', err);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Server error generating report' });
    }
  }
}
