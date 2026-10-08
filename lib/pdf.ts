import PDFDocument from "pdfkit";
import type { VideoInfo, VideoAnalysis, ChatMessage } from "@/types";

interface PDFExportOptions {
  videoInfo: VideoInfo;
  analysis: VideoAnalysis;
  chatHistory?: ChatMessage[];
}

/**
 * Generates a clean study-notes PDF as a Buffer.
 */
export function generatePDF(options: PDFExportOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const { videoInfo, analysis, chatHistory = [] } = options;
    const doc = new PDFDocument({
      margin: 60,
      size: "A4",
      info: {
        Title: `VideoMind AI — ${videoInfo.title}`,
        Author: "VideoMind AI",
        Subject: "Video Study Notes",
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // ─── Color Palette ───
    const C = {
      primary: "#6366f1",
      dark: "#1e1b4b",
      text: "#1f2937",
      muted: "#6b7280",
      light: "#f3f4f6",
      white: "#ffffff",
      accent: "#8b5cf6",
    };

    const pageW = doc.page.width - 120; // usable width

    // ─── Helper: draw a horizontal rule ───
    const hr = (y?: number, color = "#e5e7eb") => {
      doc
        .moveTo(60, y ?? doc.y)
        .lineTo(doc.page.width - 60, y ?? doc.y)
        .strokeColor(color)
        .lineWidth(0.5)
        .stroke();
    };

    // ─── Header Banner ───
    doc.rect(0, 0, doc.page.width, 90).fill(C.dark);
    doc
      .fontSize(26)
      .fillColor(C.white)
      .font("Helvetica-Bold")
      .text("VideoMind AI", 60, 28);
    doc
      .fontSize(10)
      .fillColor("#a5b4fc")
      .font("Helvetica")
      .text("AI-Powered YouTube Learning Assistant", 60, 58);

    doc.y = 110;

    // ─── Video Info Card ───
    doc.roundedRect(60, doc.y, pageW, 80, 6).fill(C.light);
    const cardY = doc.y + 12;

    doc
      .fillColor(C.dark)
      .fontSize(13)
      .font("Helvetica-Bold")
      .text("📹  " + videoInfo.title, 75, cardY, { width: pageW - 30 });

    doc
      .fontSize(9)
      .fillColor(C.muted)
      .font("Helvetica")
      .text(`Channel: ${videoInfo.channel}`, 75, cardY + 22);

    doc
      .fontSize(9)
      .fillColor(C.primary)
      .text(`URL: ${videoInfo.url}`, 75, cardY + 36, {
        link: videoInfo.url,
        underline: true,
      });

    doc
      .fillColor(C.muted)
      .text(
        `Generated: ${new Date().toLocaleDateString("en-US", { dateStyle: "long" })}`,
        75,
        cardY + 50
      );

    doc.y += 100;

    // ─── Section heading helper ───
    const sectionHeading = (title: string, emoji: string) => {
      if (doc.y > doc.page.height - 100) doc.addPage();
      doc.moveDown(1.5);
      doc
        .rect(60, doc.y - 4, pageW, 26)
        .fill("#eef2ff")
        .fillColor(C.primary)
        .fontSize(13)
        .font("Helvetica-Bold")
        .text(`${emoji}  ${title}`, 68, doc.y);
      doc.moveDown(0.8);
      doc.fillColor(C.text).font("Helvetica");
    };

    // ─── Short Summary ───
    sectionHeading("Short Summary", "⚡");
    doc.fontSize(10).fillColor(C.text).font("Helvetica");
    doc.text(analysis.shortSummary, { width: pageW, align: "justify" });

    // ─── Detailed Summary ───
    sectionHeading("Detailed Summary", "📖");
    doc.fontSize(10).fillColor(C.text).font("Helvetica");
    doc.text(analysis.detailedSummary, { width: pageW, align: "justify" });

    // ─── Key Takeaways ───
    sectionHeading("Key Takeaways", "✅");
    analysis.keyTakeaways.forEach((item, i) => {
      if (doc.y > doc.page.height - 80) doc.addPage();
      doc
        .fontSize(10)
        .fillColor(C.primary)
        .font("Helvetica-Bold")
        .text(`${i + 1}.`, 60, doc.y, { continued: true, width: 20 });
      doc
        .fillColor(C.text)
        .font("Helvetica")
        .text("  " + item, { width: pageW - 20 });
      doc.moveDown(0.3);
    });

    // ─── Important Concepts ───
    sectionHeading("Important Concepts", "🧠");
    const cols = 2;
    const colW = Math.floor(pageW / cols) - 10;
    let colX = 60;
    let colY = doc.y;
    let col = 0;

    analysis.importantConcepts.forEach((concept, i) => {
      if (colY > doc.page.height - 80) {
        doc.addPage();
        colY = doc.y;
        col = 0;
        colX = 60;
      }
      doc
        .roundedRect(colX, colY, colW, 24, 4)
        .fill("#f5f3ff")
        .fillColor(C.accent)
        .fontSize(9)
        .font("Helvetica-Bold")
        .text(`• ${concept}`, colX + 8, colY + 7, { width: colW - 16 });

      col++;
      if (col >= cols) {
        col = 0;
        colX = 60;
        colY += 30;
      } else {
        colX += colW + 20;
      }
      void i;
    });
    doc.y = colY + 35;

    // ─── Chapters ───
    sectionHeading("Chapters", "📚");
    analysis.chapters.forEach((chapter, i) => {
      if (doc.y > doc.page.height - 80) doc.addPage();
      const chY = doc.y;
      doc
        .rect(60, chY, 4, 38)
        .fill(C.primary);
      doc
        .fontSize(11)
        .fillColor(C.dark)
        .font("Helvetica-Bold")
        .text(`${String(i + 1).padStart(2, "0")} — ${chapter.title}`, 72, chY);
      doc
        .fontSize(9)
        .fillColor(C.primary)
        .font("Helvetica")
        .text(`⏱ ${chapter.timestamp}`, 72, chY + 16);
      if (chapter.description) {
        doc
          .fillColor(C.muted)
          .text(chapter.description, 72, chY + 28, { width: pageW - 20 });
      }
      doc.moveDown(2.2);
    });

    // ─── Q&A History ───
    if (chatHistory.length > 0) {
      sectionHeading("Questions & Answers", "💬");
      chatHistory.forEach((msg, i) => {
        if (doc.y > doc.page.height - 80) doc.addPage();
        if (msg.role === "user") {
          doc
            .fontSize(10)
            .fillColor(C.primary)
            .font("Helvetica-Bold")
            .text(`Q${Math.ceil((i + 1) / 2)}: ${msg.content}`, { width: pageW });
        } else {
          doc
            .fontSize(10)
            .fillColor(C.text)
            .font("Helvetica")
            .text(msg.content, { width: pageW });
          doc.moveDown(0.8);
          hr();
          doc.moveDown(0.5);
        }
      });
    }

    // ─── Footer on each page ───
    const totalPages = (doc.bufferedPageRange().count || 1);
    for (let p = 0; p < totalPages; p++) {
      doc.switchToPage(p);
      doc
        .fontSize(8)
        .fillColor(C.muted)
        .text(
          `VideoMind AI  •  Page ${p + 1} of ${totalPages}`,
          60,
          doc.page.height - 40,
          { align: "center", width: pageW }
        );
    }

    doc.end();
  });
}
