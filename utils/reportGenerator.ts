
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Student, SessionLog, MilestoneRecord } from '../types';

const LogoImg = "https://i.ibb.co/1ftNnHrx/motionmaxlgo6.png";

export const generateStudentReport = async (student: Student, logs: SessionLog[], milestones: MilestoneRecord[], title: string) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // --- Header Section ---
  try {
    doc.addImage(LogoImg, 'PNG', 15, 10, 25, 25);
  } catch (e) {
    console.error("Logo failed to load for PDF", e);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(0, 45, 80); // brandNavy
  doc.text("MOTION MAX DAY SERVICES", 45, 18);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text("27 Colnebrook Lane, Harare, Zimbabwe", 45, 23);
  doc.text("Email: admin@motionmax.co.zw | Phone: +263 775 926 454", 45, 27);
  doc.text("Behavioral Specialists for Special Education", 45, 31);

  doc.setDrawColor(200);
  doc.line(15, 40, pageWidth - 15, 40);

  // --- Student Info Block ---
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
  doc.text(`Print Date: ${new Date().toLocaleDateString()}`, pageWidth - 15, 63, { align: 'right' });

  let currentY = 75;

  // --- Clinical Sessions Table ---
  if (logs.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("SESSION DATA & TASK ANALYSIS", 15, currentY);
    currentY += 5;

    logs.forEach((log, lIdx) => {
      if (currentY > 240) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`${lIdx + 1}. Activity: ${log.targetBehavior} (${new Date(log.date).toLocaleDateString()})`, 15, currentY + 5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(`Method: ${log.method} | Independence Score: ${log.independenceScore}%`, 15, currentY + 9);
      
      const head = [['Step', 'Description', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'Result']];
      const body = log.steps.map((s, idx) => {
        const isPassed = s.trials.includes('+');
        return [
          (idx + 1).toString(),
          s.description,
          ...s.trials,
          isPassed ? 'PASSED' : 'FAILED'
        ];
      });

      autoTable(doc, {
        startY: currentY + 12,
        head: head,
        body: body,
        theme: 'striped',
        headStyles: { fillColor: [0, 45, 80], fontSize: 7 },
        bodyStyles: { fontSize: 7 },
        columnStyles: {
          1: { cellWidth: 40 },
          12: { fontStyle: 'bold' }
        },
        margin: { left: 15, right: 15 }
      });

      // @ts-ignore
      currentY = doc.lastAutoTable.finalY + 8;

      if (log.comment) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.text("Teaching Observation:", 15, currentY);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        const splitComment = doc.splitTextToSize(log.comment, pageWidth - 30);
        doc.text(splitComment, 15, currentY + 4);
        currentY += (splitComment.length * 4) + 10;
      }

      // --- Speech Section within Log ---
      if (log.programRequests && log.programRequests.length > 0) {
        if (currentY > 240) { doc.addPage(); currentY = 20; }
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text("Speech & Sound Monitoring", 15, currentY);
        
        autoTable(doc, {
          startY: currentY + 4,
          head: [['Activity', 'Echoic', 'Non-Verbal', 'Independent']],
          body: log.programRequests.map(r => [
            r.activity,
            r.echoicTempted.toString(),
            r.noVerbalTempted.toString(),
            r.noEchoicNoTempting.toString()
          ]),
          theme: 'grid',
          headStyles: { fillColor: [5, 150, 105], fontSize: 7 },
          bodyStyles: { fontSize: 7 },
          margin: { left: 15, right: 15 }
        });
        
        // @ts-ignore
        currentY = doc.lastAutoTable.finalY + 8;

        if (log.speechComment) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.text("Speech Observation:", 15, currentY);
          doc.setFont("helvetica", "italic");
          doc.setFontSize(8);
          const splitSpeechComment = doc.splitTextToSize(log.speechComment, pageWidth - 30);
          doc.text(splitSpeechComment, 15, currentY + 4);
          currentY += (splitSpeechComment.length * 4) + 10;
        }
      }
      
      currentY += 5; // Spacing between logs
    });
  }

  // --- Milestones Section ---
  if (milestones.length > 0) {
    if (currentY > 230) { doc.addPage(); currentY = 20; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("GROWTH MILESTONE ASSESSMENTS", 15, currentY);
    currentY += 8;

    autoTable(doc, {
      startY: currentY,
      head: [['Date', 'Category', 'Developmental Score']],
      body: milestones.map(m => [
        new Date(m.timestamp).toLocaleDateString(),
        m.ageCategory,
        `${m.overallPercentage}%`
      ]),
      theme: 'grid',
      headStyles: { fillColor: [5, 150, 105] },
      margin: { left: 15, right: 15 }
    });
  }

  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${pageCount} | Motion Max Official Secure Document`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
  }

  doc.save(`${student.lastName}_${student.firstName}_Report.pdf`);
};
