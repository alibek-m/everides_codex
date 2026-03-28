import Svg, { Circle, Path, Rect } from "react-native-svg";
import { colors } from "../theme/tokens";

export function BikeIllustration({
  width = 160,
  height = 120
}: {
  width?: number;
  height?: number;
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 160 120" fill="none">
      <Circle cx={36} cy={86} r={20} stroke={colors.primaryDeep} strokeWidth={6} />
      <Circle cx={121} cy={86} r={20} stroke={colors.accent} strokeWidth={6} />
      <Path
        d="M48 86L74 40H102L86 67H115"
        stroke={colors.ink}
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M74 40L63 24H40"
        stroke={colors.primary}
        strokeWidth={6}
        strokeLinecap="round"
      />
      <Path
        d="M94 40L109 24"
        stroke={colors.accent}
        strokeWidth={6}
        strokeLinecap="round"
      />
      <Rect
        x={96}
        y={15}
        width={24}
        height={8}
        rx={4}
        fill={colors.warning}
      />
      <Circle cx={63} cy={24} r={8} fill={colors.primary} />
      <Circle cx={109} cy={24} r={8} fill={colors.accent} />
    </Svg>
  );
}
