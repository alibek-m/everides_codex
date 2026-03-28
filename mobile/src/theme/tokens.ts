export const colors = {
  background: "#F7F5F1",
  backgroundMuted: "#ECE7DD",
  surface: "#FFFFFF",
  surfaceSecondary: "#F2EFEB",
  ink: "#17141F",
  inkMuted: "#645E72",
  line: "#DDD5CC",
  primary: "#4D4AE8",
  primaryDeep: "#2F2AA7",
  accent: "#0FAF9A",
  accentSoft: "#D9F6F0",
  warning: "#FF8A4C",
  danger: "#D44B5E",
  star: "#F2A900",
  shadow: "rgba(20, 12, 38, 0.12)"
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  xxl: 36
};

export const radius = {
  sm: 12,
  md: 18,
  lg: 24,
  pill: 999
};

export const typography = {
  display: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "800" as const,
    letterSpacing: -1.2
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700" as const,
    letterSpacing: -0.5
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500" as const
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700" as const,
    letterSpacing: 0.2
  }
};

export const shadows = {
  card: {
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 10
    },
    elevation: 4
  }
};
