import type { Diploma } from "@/lib/api/types";

function getTitle(d: Diploma) {
  return d.degree_title ?? d.diploma_title ?? "Diplôme";
}

function getYear(d: Diploma): string {
  if (d.graduation_year) return String(d.graduation_year);
  if (d.graduation_date) return new Date(d.graduation_date).getFullYear().toString();
  return "—";
}

function getMention(m?: string): string {
  const map: Record<string, string> = {
    passable: "Passable",
    assez_bien: "Assez Bien",
    bien: "Bien",
    tres_bien: "Très Bien",
    felicitations: "Félicitations du jury",
  };
  return m ? (map[m] ?? m) : "";
}

export async function generateDiplomaPDF(diploma: Diploma, universityName: string) {
  const { jsPDF } = await import("jspdf");

  const verifyUrl = `${window.location.origin}/verifier/${diploma.id}`;

  // Generate QR code as data URL
  const QRCode = (await import("qrcode")).default;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    width: 200,
    margin: 1,
    color: { dark: "#1e3a5f", light: "#ffffff" },
  });

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = 297;
  const H = 210;

  // ── Background ──────────────────────────────────────────────────────────────
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, W, H, "F");

  // Navy border frame
  doc.setDrawColor(30, 58, 95);
  doc.setLineWidth(3);
  doc.rect(8, 8, W - 16, H - 16);
  doc.setLineWidth(0.8);
  doc.rect(11, 11, W - 22, H - 22);

  // Gold decorative corners
  const gold = [212, 175, 55] as const;
  const cornerSize = 12;
  const corners = [
    [11, 11], [W - 11 - cornerSize, 11],
    [11, H - 11 - cornerSize], [W - 11 - cornerSize, H - 11 - cornerSize],
  ] as const;
  doc.setFillColor(...gold);
  corners.forEach(([x, y]) => doc.rect(x, y, cornerSize, cornerSize, "F"));

  // ── Header band ─────────────────────────────────────────────────────────────
  doc.setFillColor(30, 58, 95);
  doc.rect(11, 11, W - 22, 28, "F");

  doc.setTextColor(212, 175, 55);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("DiploChain", W / 2, 23, { align: "center" });

  doc.setTextColor(200, 220, 255);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Registre Blockchain de Certification des Diplômes — Burkina Faso", W / 2, 32, { align: "center" });

  // ── Title ───────────────────────────────────────────────────────────────────
  doc.setTextColor(30, 58, 95);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("CERTIFICAT DE DIPLÔME", W / 2, 52, { align: "center" });

  // Gold underline
  doc.setDrawColor(...gold);
  doc.setLineWidth(1.2);
  doc.line(90, 55, W - 90, 55);

  // ── "Nous certifions" text ────────────────────────────────────────────────
  doc.setTextColor(80, 80, 80);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("L'établissement soussigné certifie que", W / 2, 65, { align: "center" });

  // ── Student name ─────────────────────────────────────────────────────────
  doc.setTextColor(30, 58, 95);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.text(diploma.student_full_name, W / 2, 80, { align: "center" });

  // Thin line below name
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.4);
  doc.line(60, 83, W - 60, 83);

  // ── Diploma details ────────────────────────────────────────────────────────
  doc.setTextColor(80, 80, 80);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("a obtenu le diplôme de", W / 2, 92, { align: "center" });

  doc.setTextColor(30, 58, 95);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(getTitle(diploma), W / 2, 103, { align: "center" });

  // Field & mention row
  const details: string[] = [];
  if (diploma.field_of_study) details.push(`Filière : ${diploma.field_of_study}`);
  if (diploma.mention) details.push(`Mention : ${getMention(diploma.mention)}`);
  if (details.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(details.join("   |   "), W / 2, 112, { align: "center" });
  }

  // Year & university
  doc.setTextColor(80, 80, 80);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Année d'obtention : ${getYear(diploma)}   |   Établissement : ${universityName}`, W / 2, 122, { align: "center" });

  // ── Gold divider ────────────────────────────────────────────────────────────
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.8);
  doc.line(20, 130, W - 80, 130);

  // ── QR Code ─────────────────────────────────────────────────────────────────
  doc.addImage(qrDataUrl, "PNG", W - 68, 130, 45, 45);
  doc.setTextColor(120, 120, 120);
  doc.setFontSize(6.5);
  doc.text("Scanner pour vérifier", W - 68 + 22.5, 178, { align: "center" });

  // ── Blockchain stamp ────────────────────────────────────────────────────────
  doc.setFillColor(240, 248, 240);
  doc.setDrawColor(34, 139, 34);
  doc.setLineWidth(0.5);
  doc.roundedRect(20, 135, 85, 18, 3, 3, "FD");
  doc.setTextColor(34, 100, 34);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("✓  Signé cryptographiquement (RSA-2048)", 62.5, 142, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("Ancré sur Polygon Blockchain · Vérifiable publiquement", 62.5, 149, { align: "center" });

  // ── Diploma ID ──────────────────────────────────────────────────────────────
  doc.setTextColor(150, 150, 150);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(`ID : ${diploma.id}`, 20, 160);

  // ── Footer ─────────────────────────────────────────────────────────────────
  doc.setFillColor(30, 58, 95);
  doc.rect(11, H - 22, W - 22, 11, "F");
  doc.setTextColor(200, 220, 255);
  doc.setFontSize(7.5);
  doc.text(`Vérification : ${verifyUrl}`, W / 2, H - 15, { align: "center" });

  // ── Save ────────────────────────────────────────────────────────────────────
  const filename = `DiploChain_${diploma.student_full_name.replace(/\s+/g, "_")}_${getYear(diploma)}.pdf`;
  doc.save(filename);
}
