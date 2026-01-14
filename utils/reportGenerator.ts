
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Student, SessionLog, MilestoneRecord } from '../types';
import { getHarareDisplayDate } from './dateUtils';
import { PROMPT_LEVELS } from '../constants';

const LogoImg = "https://i.ibb.co/1ftNnHrx/motionmaxlgo6.png";

const addHeader = (doc: jsPDF, pageWidth: number) => {
  try {
    doc.addImage(LogoImg, 'PNG', 15, 10, 25, 25);
  } catch (e) {}

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(0, 45, 80); // brandNavy
  doc.text("MOTION MAX DAY SERVICES", 45, 18);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text("27 Colnebrook Lane, Harare, Zimbabwe", 45, 23);
  doc.text("Email: admin@motionmax.co.zw | Phone: +263 775 926 454", 45, 27);
  doc.text("Clinical Node :: Secure Archive", 45, 31);

  doc.setDrawColor(200);
  doc.line(15, 40, pageWidth - 15, 40);
};

const addFooter = (doc: jsPDF, pageWidth: number) => {
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${pageCount} | Motion Max Official Clinical Archive | Confidential Document`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
  }
};

export const generateStudentReport = async (student: Student, logs: SessionLog[], milestones: MilestoneRecord[], title: string) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  addHeader(doc, pageWidth);

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text("STUDENT PROGRESS SUMMARY", 15, 50);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Student Name: ${student.fullName}`, 15, 58);
  doc.text(`Student ID: ${student.id}`, 15, 63);
  doc.text(`Classroom: ${student.assignedClass}`, 15, 68);
  doc.text(`Report Period: ${title}`, pageWidth - 15, 58, { align: 'right' });
  doc.text(`Print Date: ${getHarareDisplayDate(new Date().toISOString())}`, pageWidth - 15, 63, { align: 'right' });

  let currentY = 75;

  if (logs.length > 0) {
    doc.setFont("helvetica", "bold").setFontSize(12).text("SESSION DATA & TASK ANALYSIS", 15, currentY);
    currentY += 5;

    logs.forEach((log, lIdx) => {
      if (currentY > 240) { doc.addPage(); currentY = 20; }
      doc.setFontSize(10).setFont("helvetica", "bold").text(`${lIdx + 1}. Activity: ${log.targetBehavior} (${getHarareDisplayDate(log.date)})`, 15, currentY + 5);
      doc.setFont("helvetica", "normal").setFontSize(8).text(`Method: ${log.method} | Independence Score: ${log.independenceScore}%`, 15, currentY + 9);
      
      const head = [['Step', 'Description', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'Result']];
      const body = log.steps.map((s, idx) => [
        (idx + 1).toString(),
        s.description,
        ...s.trials,
        s.trials.includes('+') ? 'PASSED' : 'FAILED'
      ]);

      autoTable(doc, {
        startY: currentY + 12,
        head: head,
        body: body,
        theme: 'striped',
        headStyles: { fillColor: [0, 45, 80], fontSize: 7 },
        bodyStyles: { fontSize: 7 },
        columnStyles: { 1: { cellWidth: 40 }, 12: { fontStyle: 'bold' } },
        margin: { left: 15, right: 15 }
      });

      // @ts-ignore
      currentY = doc.lastAutoTable.finalY + 8;

      if (log.comment) {
        doc.setFont("helvetica", "bold").setFontSize(8).text("Teaching Observation:", 15, currentY);
        const splitComment = doc.splitTextToSize(log.comment, pageWidth - 30);
        doc.setFont("helvetica", "italic").text(splitComment, 15, currentY + 4);
        currentY += (splitComment.length * 4) + 10;
      }
    });
  }

  addFooter(doc, pageWidth);
  doc.save(`${student.lastName}_${student.firstName}_Report.pdf`);
};

export const generateFullStudentHistoryReport = async (student: Student, logs: SessionLog[], milestones: MilestoneRecord[]) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // --- PAGE 1: COVER & LEGEND ---
  addHeader(doc, pageWidth);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 45, 80);
  doc.text("FULL CLINICAL HISTORY", 15, 60);
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`Student Identity: ${student.fullName} (ID: ${student.id})`, 15, 70);
  doc.text(`Classroom Group: ${student.assignedClass}`, 15, 76);
  doc.text(`Archive Depth: ${logs.length} Sessions | ${milestones.length} Assessments`, 15, 82);
  doc.text(`Date of Export: ${getHarareDisplayDate(new Date().toISOString())}`, 15, 88);

  // Symbol Legend Table
  doc.setFont("helvetica", "bold").setFontSize(10).setTextColor(0).text("CLINICAL PROMPT LEGEND", 15, 105);
  autoTable(doc, {
    startY: 110,
    head: [['Symbol', 'Meaning', 'Clinical Description']],
    body: PROMPT_LEVELS.map(p => [p.key, p.label, `Support level applied during trial marking.`]),
    theme: 'grid',
    headStyles: { fillColor: [0, 45, 80], fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    margin: { left: 15, right: 15 }
  });

  // Summary Metrics
  const avgSession = logs.length > 0 ? Math.round(logs.reduce((a, b) => a + b.independenceScore, 0) / logs.length) : 0;
  const avgMilestone = milestones.length > 0 ? Math.round(milestones.reduce((a, b) => a + b.overallPercentage, 0) / milestones.length) : 0;

  // @ts-ignore
  let startY = doc.lastAutoTable.finalY + 15;
  doc.setFillColor(245, 247, 250);
  doc.rect(15, startY, pageWidth - 30, 25, 'F');
  doc.setFont("helvetica", "bold").setFontSize(10).setTextColor(0).text("AGGREGATE PERFORMANCE DATA", 20, startY + 10);
  doc.setFont("helvetica", "normal").setFontSize(9).text(`Average Lesson Independence: ${avgSession}%`, 20, startY + 18);
  doc.text(`Average Milestone Completion: ${avgMilestone}%`, pageWidth / 2, startY + 18);

  // Group Records by Month
  const allRecords = [
    ...logs.map(l => ({ type: 'log' as const, date: l.date, data: l })),
    ...milestones.map(m => ({ type: 'milestone' as const, date: m.timestamp, data: m }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const grouped: Record<string, typeof allRecords> = {};
  allRecords.forEach(rec => {
    const month = new Date(rec.date).toLocaleDateString('en-US', { timeZone: 'Africa/Harare', month: 'long', year: 'numeric' });
    if (!grouped[month]) grouped[month] = [];
    grouped[month].push(rec);
  });

  // --- DATA PAGES ---
  Object.entries(grouped).forEach(([month, items]) => {
    doc.addPage();
    let currentY = 20;
    
    // Month Header
    doc.setFillColor(0, 45, 80);
    doc.rect(0, currentY, pageWidth, 12, 'F');
    doc.setFont("helvetica", "bold").setFontSize(12).setTextColor(255);
    doc.text(month.toUpperCase(), 15, currentY + 8);
    doc.setTextColor(0);
    currentY += 20;

    items.forEach((item, idx) => {
      if (item.type === 'log') {
        const log = item.data as SessionLog;
        if (currentY > 230) { doc.addPage(); currentY = 20; }
        
        doc.setFont("helvetica", "bold").setFontSize(10).text(`${getHarareDisplayDate(log.date)} - LESSON: ${log.targetBehavior.toUpperCase()}`, 15, currentY);
        doc.setFont("helvetica", "normal").setFontSize(8).text(`Method: ${log.method} | Score: ${log.independenceScore}%`, 15, currentY + 4);
        
        // Detailed Task Table
        autoTable(doc, {
          startY: currentY + 6,
          head: [['Step', 'Description', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10']],
          body: log.steps.map((s, sidx) => [(sidx + 1).toString(), s.description, ...s.trials]),
          theme: 'striped',
          headStyles: { fillColor: [100, 116, 139], fontSize: 6 },
          bodyStyles: { fontSize: 6 },
          columnStyles: { 1: { cellWidth: 50 } },
          margin: { left: 15, right: 15 }
        });

        // @ts-ignore
        currentY = doc.lastAutoTable.finalY + 6;

        if (log.comment) {
          doc.setFont("helvetica", "bold").setFontSize(7).text("Observation:", 15, currentY);
          const split = doc.splitTextToSize(log.comment, pageWidth - 40);
          doc.setFont("helvetica", "italic").text(split, 15, currentY + 3);
          currentY += (split.length * 3.5) + 6;
        }

        if (log.programRequests && log.programRequests.length > 0) {
          if (currentY > 240) { doc.addPage(); currentY = 20; }
          autoTable(doc, {
            startY: currentY,
            head: [['Speech Activity', 'Echoic', 'Non-Verbal', 'Independent']],
            body: log.programRequests.map(r => [r.activity, r.echoicTempted.toString(), r.noVerbalTempted.toString(), r.noEchoicNoTempting.toString()]),
            theme: 'grid',
            headStyles: { fillColor: [5, 150, 105], fontSize: 6 },
            bodyStyles: { fontSize: 6 },
            margin: { left: 15, right: 15 }
          });
          // @ts-ignore
          currentY = doc.lastAutoTable.finalY + 10;
        } else {
          currentY += 5;
        }
      } else {
        const m = item.data as MilestoneRecord;
        if (currentY > 230) { doc.addPage(); currentY = 20; }
        
        doc.setFillColor(240, 253, 244);
        doc.rect(15, currentY - 4, pageWidth - 30, 10, 'F');
        doc.setFont("helvetica", "bold").setFontSize(10).setTextColor(5, 150, 105);
        doc.text(`${getHarareDisplayDate(m.timestamp)} - ASSESSMENT: ${m.ageCategory}`, 18, currentY + 2);
        doc.setFont("helvetica", "normal").setFontSize(8).text(`Mastery Score: ${m.overallPercentage}%`, pageWidth - 20, currentY + 2, { align: 'right' });
        doc.setTextColor(0);
        currentY += 12;

        m.sections.forEach(section => {
          if (currentY > 240) { doc.addPage(); currentY = 20; }
          doc.setFont("helvetica", "bold").setFontSize(8).text(section.title, 15, currentY);
          autoTable(doc, {
            startY: currentY + 2,
            head: [['Requirement', 'Status']],
            body: section.items.map(i => [i.text, i.checked ? 'MASTERED' : 'PENDING']),
            theme: 'grid',
            headStyles: { fillColor: [5, 150, 105], fontSize: 7 },
            bodyStyles: { fontSize: 7 },
            margin: { left: 15, right: 15 }
          });
          // @ts-ignore
          currentY = doc.lastAutoTable.finalY + 8;
        });

        if (m.redFlags && m.redFlags.some(f => f.checked)) {
          if (currentY > 240) { doc.addPage(); currentY = 20; }
          doc.setFont("helvetica", "bold").setFontSize(8).setTextColor(200, 0, 0).text("RED FLAGS DETECTED:", 15, currentY);
          const flags = m.redFlags.filter(f => f.checked).map(f => f.text).join(", ");
          const splitFlags = doc.splitTextToSize(flags, pageWidth - 40);
          doc.setFont("helvetica", "normal").text(splitFlags, 15, currentY + 4);
          doc.setTextColor(0);
          currentY += (splitFlags.length * 4) + 10;
        }
      }
    });
  });

  addFooter(doc, pageWidth);
  doc.save(`${student.lastName}_History_Archive.pdf`);
};
