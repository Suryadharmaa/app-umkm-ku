import Svg, { Circle, Defs, Line, LinearGradient, Path, Rect, Stop } from "react-native-svg";

export type BrandIconName = "home" | "guide" | "money" | "services" | "capital" | "permit" | "academy" | "book" | "bell" | "scan" | "eye" | "eye-off" | "transfer" | "arrow" | "activity" | "share";

export function BantuUsahaMark({ size = 35 }: { size?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 40 40" fill="none"><Defs><LinearGradient id="markBlue" x1="5" y1="3" x2="33" y2="37" gradientUnits="userSpaceOnUse"><Stop stopColor="#69CBE7" /><Stop offset="1" stopColor="#2D6EAE" /></LinearGradient><LinearGradient id="markGold" x1="10" y1="6" x2="27" y2="24" gradientUnits="userSpaceOnUse"><Stop stopColor="#FFD45C" /><Stop offset="1" stopColor="#F29C2B" /></LinearGradient></Defs><Path d="M6 15.5 16.9 4.6c1-1 2.7-1 3.7 0l4.8 4.8c1 1 1 2.7 0 3.7L14.5 24c-1 1-2.7 1-3.7 0L6 19.2c-1-1-1-2.7 0-3.7Z" fill="url(#markGold)" /><Path d="m15.4 28.1 10.9-10.9c1-1 2.7-1 3.7 0l4.8 4.8c1 1 1 2.7 0 3.7L23.9 36.6c-1 1-2.7 1-3.7 0l-4.8-4.8c-1-1-1-2.7 0-3.7Z" fill="url(#markBlue)" /><Path d="m18.6 15.4 6 6-8.2 8.2-6-6 8.2-8.2Z" fill="#143A66" fillOpacity=".28" /></Svg>;
}

export function BrandIcon({ name, size = 24, color = "#1D4E79" }: { name: BrandIconName; size?: number; color?: string }) {
  const common = { stroke: color, strokeWidth: 1.9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const content = (() => {
    switch (name) {
      case "home": return <><Path {...common} d="m4 11 8-7 8 7v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8Z" /><Path {...common} d="M9 20v-5h6v5" /></>;
      case "guide": return <><Rect {...common} x="5" y="3" width="14" height="18" rx="2" /><Path {...common} d="M8 8h8M8 12h8M8 16h4" /><Path {...common} d="m3 8 1 1 2-2" /></>;
      case "money": return <><Rect {...common} x="3" y="6" width="18" height="13" rx="3" /><Path {...common} d="M3 10h18M16 15h2" /><Circle {...common} cx="8" cy="15" r="1.2" /></>;
      case "services": return <><Rect {...common} x="4" y="4" width="6" height="6" rx="1" /><Rect {...common} x="14" y="4" width="6" height="6" rx="1" /><Rect {...common} x="4" y="14" width="6" height="6" rx="1" /><Rect {...common} x="14" y="14" width="6" height="6" rx="1" /></>;
      case "capital": return <><Path {...common} d="M3 8h18M5 8v11m4-11v11m6-11v11m4-11v11M3 19h18" /><Path {...common} d="m12 3 9 4H3l9-4Z" /></>;
      case "permit": return <><Path {...common} d="M6 3h9l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" /><Path {...common} d="M14 3v5h5M8 13l2 2 4-4" /></>;
      case "academy": return <><Path {...common} d="m2 9 10-5 10 5-10 5L2 9Z" /><Path {...common} d="M6 12v4c3.2 2.7 8.8 2.7 12 0v-4M20 10v5" /></>;
      case "book": return <><Path {...common} d="M4 5.5A3.5 3.5 0 0 1 7.5 2H12v17H7.5A3.5 3.5 0 0 0 4 22V5.5Z" /><Path {...common} d="M20 5.5A3.5 3.5 0 0 0 16.5 2H12v17h4.5A3.5 3.5 0 0 1 20 22V5.5Z" /></>;
      case "bell": return <><Path {...common} d="M18 16H6l1.5-2.2V10a4.5 4.5 0 0 1 9 0v3.8L18 16Z" /><Path {...common} d="M10 19h4" /></>;
      case "scan": return <><Path {...common} d="M4 9V5a1 1 0 0 1 1-1h4M15 4h4a1 1 0 0 1 1 1v4M20 15v4a1 1 0 0 1-1 1h-4M9 20H5a1 1 0 0 1-1-1v-4" /><Path {...common} d="M8 12h8" /></>;
      case "eye": return <><Path {...common} d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z" /><Circle {...common} cx="12" cy="12" r="2.2" /></>;
      case "eye-off": return <><Path {...common} d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z" /><Circle {...common} cx="12" cy="12" r="2.2" /><Path {...common} d="M4 4 20 20" /></>;
      case "transfer": return <><Path {...common} d="M4 8h12m-3-3 3 3-3 3M20 16H8m3 3-3-3 3-3" /></>;
      case "arrow": return <Path {...common} d="M5 12h14m-5-5 5 5-5 5" />;
      case "activity": return <Path {...common} d="M3 14h3l2-7 4 12 3-7h6" />;
      case "share": return <><Circle {...common} cx="18" cy="5" r="2.2" /><Circle {...common} cx="6" cy="12" r="2.2" /><Circle {...common} cx="18" cy="19" r="2.2" /><Path {...common} d="m8 11 7.8-4.7M8 13l7.8 4.7" /></>;
    }
  })();
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">{content}</Svg>;
}

export function FinancePattern() {
  return <Svg width="100%" height="100%" viewBox="0 0 360 170" fill="none" preserveAspectRatio="none"><Defs><LinearGradient id="patternGlow" x1="242" y1="2" x2="357" y2="170" gradientUnits="userSpaceOnUse"><Stop stopColor="#7ACFE2" stopOpacity=".65" /><Stop offset="1" stopColor="#7ACFE2" stopOpacity="0" /></LinearGradient></Defs><Circle cx="310" cy="37" r="110" fill="url(#patternGlow)" /><Path d="M242 14c23 14 35 34 35 61 0 38 28 59 58 66" stroke="#B9EEFA" strokeOpacity=".42" strokeWidth="1.5" /><Path d="M227 35c20 12 31 29 31 52 0 33 25 50 56 57" stroke="#B9EEFA" strokeOpacity=".24" strokeWidth="1.5" /><Circle cx="317" cy="95" r="5" fill="#FFE17A" fillOpacity=".8" /><Circle cx="278" cy="49" r="3" fill="#FFFFFF" fillOpacity=".56" /></Svg>;
}

export function ActivityBars({ values }: { values: number[] }) {
  const peak = Math.max(...values, 1);
  const labels = ["S1", "S2", "S3", "S4"];
  return <Svg width="100%" height={118} viewBox="0 0 304 118" fill="none"><Line x1="24" y1="20" x2="300" y2="20" stroke="#DDE7E5" strokeDasharray="2 3" /><Line x1="24" y1="51" x2="300" y2="51" stroke="#DDE7E5" strokeDasharray="2 3" /><Line x1="24" y1="82" x2="300" y2="82" stroke="#DDE7E5" strokeDasharray="2 3" />{values.map((value, index) => { const height = value ? Math.max((value / peak) * 58, 8) : 4; const x = 48 + index * 68; return <Rect key={index} x={x} y={82 - height} width="20" height={height} rx="7" fill={value ? "#34C7A4" : "#DDE7E5"} />; })}{labels.map((label, index) => <Path key={label} d="" />)}</Svg>;
}

export function GrowthIllustration() {
  return <Svg width={116} height={88} viewBox="0 0 116 88" fill="none"><Defs><LinearGradient id="illTop" x1="28" y1="4" x2="98" y2="68" gradientUnits="userSpaceOnUse"><Stop stopColor="#86D9ED" /><Stop offset="1" stopColor="#2D6EAE" /></LinearGradient></Defs><Circle cx="78" cy="25" r="18" fill="#FFD45C" /><Path d="M48 46c0-12 10-21 22-21h6c12 0 22 9 22 21v23H48V46Z" fill="url(#illTop)" /><Circle cx="73" cy="29" r="7" fill="#F2B19A" /><Path d="M66 28c0-5 4-9 8-9s8 4 8 9c-2-2-4-3-8-3s-6 1-8 3Z" fill="#213A56" /><Path d="M55 69V54c0-4 3-7 7-7h23c4 0 7 3 7 7v15H55Z" fill="#FFFFFF" fillOpacity=".94" /><Path d="M64 57h18M64 62h12" stroke="#2D6EAE" strokeWidth="2" strokeLinecap="round" /><Path d="M21 70c7-15 15-23 26-27" stroke="#FFE17A" strokeWidth="4" strokeLinecap="round" /><Circle cx="21" cy="70" r="6" fill="#34C7A4" /></Svg>;
}
