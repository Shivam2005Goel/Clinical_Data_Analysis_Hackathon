import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Premium PDF Report Generator for Clinical Data Analysis
 * Creates beautifully formatted PDF reports with branding and styled tables
 */

const COLORS = {
    primary: [0, 243, 255],      // Neon Cyan
    secondary: [188, 19, 254],   // Neon Purple
    dark: [3, 7, 18],            // Void
    light: [248, 250, 252],      // Slate 50
    success: [16, 185, 129],     // Emerald
    warning: [245, 158, 11],     // Amber
    danger: [239, 68, 68],       // Red
    text: [148, 163, 184],       // Slate 400
    headerBg: [15, 23, 42],      // Slate 900
};

/**
 * Generate a branded PDF header
 */
const addHeader = (doc, title, subtitle = 'Clinical Data Monitoring System') => {
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header background gradient simulation
    doc.setFillColor(...COLORS.headerBg);
    doc.rect(0, 0, pageWidth, 45, 'F');

    // Accent line
    doc.setDrawColor(...COLORS.primary);
    doc.setLineWidth(2);
    doc.line(0, 45, pageWidth, 45);

    // Logo text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(...COLORS.primary);
    doc.text('CDMS', 20, 25);

    // Subtitle
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    doc.text(subtitle, 20, 35);

    // Report title (right aligned)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...COLORS.light);
    doc.text(title, pageWidth - 20, 25, { align: 'right' });

    // Date
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.text);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })}`, pageWidth - 20, 35, { align: 'right' });

    return 55; // Return Y position after header
};

/**
 * Add footer to each page
 */
const addFooter = (doc) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageCount = doc.internal.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        // Footer line
        doc.setDrawColor(...COLORS.primary);
        doc.setLineWidth(0.5);
        doc.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20);

        // Footer text
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.text);
        doc.text('Clinical Data Monitoring System - Confidential', 20, pageHeight - 12);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, pageHeight - 12, { align: 'right' });
    }
};

/**
 * Generate Sites Report PDF
 */
export const generateSitesReportPDF = (sitesData, filename = 'sites_report.pdf') => {
    const doc = new jsPDF();
    const startY = addHeader(doc, 'Site-Level Report');

    // Summary section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...COLORS.light);
    doc.text('Summary', 20, startY + 10);

    const totalSites = sitesData.length;
    const highRiskSites = sitesData.filter(s => s.Risk_Level === 'High').length;
    const avgDQI = sitesData.length > 0
        ? (sitesData.reduce((sum, s) => sum + (s.Avg_DQI || 0), 0) / sitesData.length).toFixed(1)
        : 0;

    // Summary boxes
    doc.setFillColor(...COLORS.headerBg);
    doc.roundedRect(20, startY + 15, 50, 25, 3, 3, 'F');
    doc.roundedRect(80, startY + 15, 50, 25, 3, 3, 'F');
    doc.roundedRect(140, startY + 15, 50, 25, 3, 3, 'F');

    doc.setFontSize(18);
    doc.setTextColor(...COLORS.primary);
    doc.text(String(totalSites), 45, startY + 30, { align: 'center' });
    doc.text(String(highRiskSites), 105, startY + 30, { align: 'center' });
    doc.setTextColor(...COLORS.success);
    doc.text(String(avgDQI), 165, startY + 30, { align: 'center' });

    doc.setFontSize(8);
    doc.setTextColor(...COLORS.text);
    doc.text('Total Sites', 45, startY + 37, { align: 'center' });
    doc.text('High Risk', 105, startY + 37, { align: 'center' });
    doc.text('Avg DQI', 165, startY + 37, { align: 'center' });

    // Table
    const tableColumns = ['Site ID', 'Region', 'Country', 'Risk Level', 'Risk Score', 'Subjects', 'Avg DQI'];
    const tableData = sitesData.map(site => [
        site.Site_ID || '-',
        site.Region || '-',
        site.Country || '-',
        site.Risk_Level || '-',
        site.Risk_Score?.toFixed(1) || '-',
        site.Total_Subjects || '-',
        site.Avg_DQI?.toFixed(1) || '-'
    ]);

    autoTable(doc, {
        startY: startY + 50,
        head: [tableColumns],
        body: tableData,
        theme: 'plain',
        headStyles: {
            fillColor: COLORS.headerBg,
            textColor: COLORS.primary,
            fontStyle: 'bold',
            fontSize: 9
        },
        bodyStyles: {
            fillColor: [15, 23, 42],
            textColor: COLORS.light,
            fontSize: 8
        },
        alternateRowStyles: {
            fillColor: [30, 41, 59]
        },
        styles: {
            cellPadding: 4,
            lineColor: [51, 65, 85],
            lineWidth: 0.1
        },
        columnStyles: {
            3: { // Risk Level column
                cellWidth: 25,
                fontStyle: 'bold'
            }
        },
        didParseCell: (data) => {
            if (data.column.index === 3 && data.section === 'body') {
                const risk = data.cell.raw;
                if (risk === 'High') {
                    data.cell.styles.textColor = COLORS.danger;
                } else if (risk === 'Medium') {
                    data.cell.styles.textColor = COLORS.warning;
                } else if (risk === 'Low') {
                    data.cell.styles.textColor = COLORS.success;
                }
            }
        }
    });

    addFooter(doc);
    doc.save(filename);
};

/**
 * Generate Patients Report PDF
 */
export const generatePatientsReportPDF = (patientsData, filename = 'patients_report.pdf') => {
    const doc = new jsPDF();
    const startY = addHeader(doc, 'Patient-Level Report');

    // Summary
    const totalPatients = patientsData.length;
    const cleanPatients = patientsData.filter(p => p.Clean_Patient_Status === 'Clean').length;
    const cleanPercent = totalPatients > 0 ? ((cleanPatients / totalPatients) * 100).toFixed(1) : 0;

    // Summary boxes
    doc.setFillColor(...COLORS.headerBg);
    doc.roundedRect(20, startY + 5, 55, 25, 3, 3, 'F');
    doc.roundedRect(85, startY + 5, 55, 25, 3, 3, 'F');
    doc.roundedRect(150, startY + 5, 40, 25, 3, 3, 'F');

    doc.setFontSize(18);
    doc.setTextColor(...COLORS.primary);
    doc.text(String(totalPatients), 47, startY + 20, { align: 'center' });
    doc.setTextColor(...COLORS.success);
    doc.text(String(cleanPatients), 112, startY + 20, { align: 'center' });
    doc.text(`${cleanPercent}%`, 170, startY + 20, { align: 'center' });

    doc.setFontSize(8);
    doc.setTextColor(...COLORS.text);
    doc.text('Total Patients', 47, startY + 27, { align: 'center' });
    doc.text('Clean Patients', 112, startY + 27, { align: 'center' });
    doc.text('Clean %', 170, startY + 27, { align: 'center' });

    // Table
    const tableColumns = ['Subject ID', 'Site ID', 'Region', 'Status', 'DQI', 'Open Issues'];
    const tableData = patientsData.slice(0, 100).map(patient => [
        patient.Subject_ID || '-',
        patient.Site_ID || '-',
        patient.Region || '-',
        patient.Clean_Patient_Status || '-',
        patient.Data_Quality_Index || '-',
        patient.total_open_issues || 0
    ]);

    autoTable(doc, {
        startY: startY + 40,
        head: [tableColumns],
        body: tableData,
        theme: 'plain',
        headStyles: {
            fillColor: COLORS.headerBg,
            textColor: COLORS.primary,
            fontStyle: 'bold',
            fontSize: 9
        },
        bodyStyles: {
            fillColor: [15, 23, 42],
            textColor: COLORS.light,
            fontSize: 8
        },
        alternateRowStyles: {
            fillColor: [30, 41, 59]
        },
        styles: {
            cellPadding: 4,
            lineColor: [51, 65, 85],
            lineWidth: 0.1
        },
        didParseCell: (data) => {
            if (data.column.index === 3 && data.section === 'body') {
                const status = data.cell.raw;
                if (status === 'Clean') {
                    data.cell.styles.textColor = COLORS.success;
                } else {
                    data.cell.styles.textColor = COLORS.warning;
                }
            }
        }
    });

    addFooter(doc);
    doc.save(filename);
};

/**
 * Generate Executive Summary PDF
 */
export const generateSummaryReportPDF = (sitesData, patientsData, filename = 'executive_summary.pdf') => {
    const doc = new jsPDF();
    const startY = addHeader(doc, 'Executive Summary');

    // Calculate metrics
    const metrics = {
        totalSites: sitesData.length,
        totalPatients: patientsData.length,
        highRiskSites: sitesData.filter(s => s.Risk_Level === 'High').length,
        mediumRiskSites: sitesData.filter(s => s.Risk_Level === 'Medium').length,
        lowRiskSites: sitesData.filter(s => s.Risk_Level === 'Low').length,
        cleanPatients: patientsData.filter(p => p.Clean_Patient_Status === 'Clean').length,
        avgDQI: sitesData.length > 0
            ? (sitesData.reduce((sum, s) => sum + (s.Avg_DQI || 0), 0) / sitesData.length).toFixed(1)
            : 0
    };

    metrics.cleanPercent = metrics.totalPatients > 0
        ? ((metrics.cleanPatients / metrics.totalPatients) * 100).toFixed(1)
        : 0;

    // Key Metrics Section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...COLORS.light);
    doc.text('Key Performance Indicators', 20, startY + 10);

    // KPI Cards
    const cardY = startY + 20;
    const cards = [
        { label: 'Total Sites', value: metrics.totalSites, color: COLORS.primary },
        { label: 'Total Patients', value: metrics.totalPatients, color: COLORS.primary },
        { label: 'Avg DQI', value: metrics.avgDQI, color: COLORS.success },
        { label: 'Clean Rate', value: `${metrics.cleanPercent}%`, color: COLORS.success }
    ];

    cards.forEach((card, i) => {
        const x = 20 + (i * 45);
        doc.setFillColor(...COLORS.headerBg);
        doc.roundedRect(x, cardY, 40, 30, 3, 3, 'F');

        doc.setFontSize(16);
        doc.setTextColor(...card.color);
        doc.text(String(card.value), x + 20, cardY + 15, { align: 'center' });

        doc.setFontSize(7);
        doc.setTextColor(...COLORS.text);
        doc.text(card.label, x + 20, cardY + 25, { align: 'center' });
    });

    // Risk Distribution
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...COLORS.light);
    doc.text('Risk Distribution', 20, cardY + 50);

    const riskData = [
        ['High Risk Sites', metrics.highRiskSites, 'Immediate attention required'],
        ['Medium Risk Sites', metrics.mediumRiskSites, 'Monitor closely'],
        ['Low Risk Sites', metrics.lowRiskSites, 'Performing well']
    ];

    autoTable(doc, {
        startY: cardY + 55,
        head: [['Category', 'Count', 'Action']],
        body: riskData,
        theme: 'plain',
        headStyles: {
            fillColor: COLORS.headerBg,
            textColor: COLORS.primary,
            fontStyle: 'bold'
        },
        bodyStyles: {
            fillColor: [15, 23, 42],
            textColor: COLORS.light
        },
        columnStyles: {
            0: { cellWidth: 50 },
            1: { cellWidth: 30, halign: 'center' },
            2: { cellWidth: 80 }
        },
        didParseCell: (data) => {
            if (data.column.index === 0 && data.section === 'body') {
                const text = data.cell.raw;
                if (text.includes('High')) {
                    data.cell.styles.textColor = COLORS.danger;
                } else if (text.includes('Medium')) {
                    data.cell.styles.textColor = COLORS.warning;
                } else if (text.includes('Low')) {
                    data.cell.styles.textColor = COLORS.success;
                }
            }
        }
    });

    addFooter(doc);
    doc.save(filename);
};

export default {
    generateSitesReportPDF,
    generatePatientsReportPDF,
    generateSummaryReportPDF
};
