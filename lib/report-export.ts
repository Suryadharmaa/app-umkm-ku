import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Alert, Platform } from "react-native";

type ReportProfile = { businessName: string; ownerName: string; logoUri: string | null };

function safeFilename(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "laporan";
}

async function makePrintableProfile(profile: ReportProfile): Promise<ReportProfile> {
  if (!profile.logoUri || Platform.OS === "web" || !profile.logoUri.startsWith("file:")) return profile;
  try {
    const extension = profile.logoUri.split(".").pop()?.toLowerCase() ?? "png";
    const mimeType = extension === "jpg" || extension === "jpeg" ? "image/jpeg" : extension === "webp" ? "image/webp" : "image/png";
    const base64 = await FileSystem.readAsStringAsync(profile.logoUri, { encoding: FileSystem.EncodingType.Base64 });
    return { ...profile, logoUri: `data:${mimeType};base64,${base64}` };
  } catch {
    return { ...profile, logoUri: null };
  }
}

function printOnWeb(html: string) {
  const popup = globalThis.open?.("", "_blank", "noopener,noreferrer");
  if (!popup) {
    Alert.alert("Izinkan jendela baru", "Browser memblokir jendela laporan. Izinkan pop-up lalu coba lagi untuk menyimpan PDF.");
    return;
  }
  popup.document.open();
  popup.document.write(html);
  popup.document.close();
  popup.focus();
  globalThis.setTimeout(() => popup.print(), 450);
}

export async function exportFinancialReport({ makeHtml, monthLabel, profile }: { makeHtml: (profile: ReportProfile) => string; monthLabel: string; profile: ReportProfile }) {
  const safeProfile = await makePrintableProfile(profile);
  const html = makeHtml(safeProfile);
  const filename = `umkm-ku-laporan-${safeFilename(monthLabel)}.pdf`;
  if (Platform.OS === "web") {
    printOnWeb(html);
    return { method: "print" as const };
  }
  const { uri } = await Print.printToFileAsync({ html, margins: { top: 20, right: 20, bottom: 20, left: 20 } });
  const destination = `${FileSystem.documentDirectory}${Date.now()}-${filename}`;
  await FileSystem.copyAsync({ from: uri, to: destination });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(destination, { UTI: ".pdf", mimeType: "application/pdf", dialogTitle: "Simpan atau bagikan laporan UMKM KU" });
    return { method: "share" as const, uri: destination };
  }
  Alert.alert("Laporan tersimpan", `File PDF disimpan di penyimpanan aplikasi dengan nama ${filename}.`);
  return { method: "saved" as const, uri: destination };
}
