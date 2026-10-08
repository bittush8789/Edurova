import type { VideoInfo, VideoAnalysis } from "@/types";

/**
 * Formats video analysis notes into clean GitHub / Notion flavored Markdown.
 */
export function formatNotesToMarkdown(
  videoInfo: VideoInfo,
  analysis: VideoAnalysis
): string {
  const lines: string[] = [];

  lines.push(`# 🎬 ${videoInfo.title}`);
  lines.push(`\n**Channel:** ${videoInfo.channel}  `);
  lines.push(`**Video URL:** [${videoInfo.url}](${videoInfo.url})  `);
  lines.push(`**Generated with:** VideoMind AI Study Assistant  `);
  lines.push(`\n---\n`);

  lines.push(`## 📌 Overview`);
  lines.push(`\n> ${analysis.shortSummary}\n`);
  lines.push(`${analysis.detailedSummary}\n`);

  if (analysis.keyTakeaways && analysis.keyTakeaways.length > 0) {
    lines.push(`## 💡 Key Takeaways`);
    analysis.keyTakeaways.forEach((takeaway) => {
      lines.push(`- [ ] ${takeaway}`);
    });
    lines.push(``);
  }

  if (analysis.importantConcepts && analysis.importantConcepts.length > 0) {
    lines.push(`## 🧠 Core Concepts & Vocabulary`);
    analysis.importantConcepts.forEach((concept) => {
      lines.push(`- **${concept}**`);
    });
    lines.push(``);
  }

  if (analysis.chapters && analysis.chapters.length > 0) {
    lines.push(`## ⏱️ Chapters & Topics`);
    analysis.chapters.forEach((chapter) => {
      lines.push(`### \`[${chapter.timestamp}]\` ${chapter.title}`);
      if (chapter.description) {
        lines.push(`${chapter.description}\n`);
      }
    });
  }

  lines.push(`\n---\n*Study notes exported from VideoMind AI.*`);

  return lines.join("\n");
}
