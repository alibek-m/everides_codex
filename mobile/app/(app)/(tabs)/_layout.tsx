import { Tabs } from "expo-router";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { StyleSheet, View } from "react-native";
import { colors } from "../../../src/theme/tokens";

const TabIcon = ({
  kind,
  focused
}: {
  kind: "search" | "favorites" | "trips" | "inbox" | "more";
  focused: boolean;
}) => {
  const stroke = focused ? colors.primary : colors.inkMuted;

  return (
    <View
      style={[
        styles.iconWrap,
        focused && {
          backgroundColor: "#E9EAFF",
          borderColor: "#D5D8FF"
        }
      ]}
    >
      <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
        {kind === "search" ? (
          <>
            <Circle cx={10} cy={10} r={5.5} stroke={stroke} strokeWidth={1.8} />
            <Path d="M14.5 14.5L18 18" stroke={stroke} strokeWidth={1.8} strokeLinecap="round" />
          </>
        ) : null}
        {kind === "favorites" ? (
          <Path
            d="M11 17.2C7.2 14.7 4.8 12.5 4.8 9.6C4.8 7.7 6.2 6.2 8.1 6.2C9.2 6.2 10.2 6.8 11 7.7C11.8 6.8 12.8 6.2 13.9 6.2C15.8 6.2 17.2 7.7 17.2 9.6C17.2 12.5 14.8 14.7 11 17.2Z"
            stroke={stroke}
            strokeWidth={1.8}
            strokeLinejoin="round"
          />
        ) : null}
        {kind === "trips" ? (
          <>
            <Circle cx={5} cy={16} r={2} fill={stroke} />
            <Circle cx={17} cy={6} r={2} fill={stroke} />
            <Path
              d="M6.8 14.8C9 12 10 11.4 12.3 10.9C14.6 10.4 15.4 8.9 16.3 7.6"
              stroke={stroke}
              strokeWidth={1.8}
              strokeLinecap="round"
            />
          </>
        ) : null}
        {kind === "inbox" ? (
          <>
            <Path
              d="M4 6.8C4 5.81 4.81 5 5.8 5H16.2C17.19 5 18 5.81 18 6.8V14.2C18 15.19 17.19 16 16.2 16H9.4L6 18V16H5.8C4.81 16 4 15.19 4 14.2V6.8Z"
              stroke={stroke}
              strokeWidth={1.8}
              strokeLinejoin="round"
            />
            <Path d="M7 9H15" stroke={stroke} strokeWidth={1.8} strokeLinecap="round" />
            <Path d="M7 12H12.5" stroke={stroke} strokeWidth={1.8} strokeLinecap="round" />
          </>
        ) : null}
        {kind === "more" ? (
          <>
            <Rect x={4.5} y={4.5} width={4.2} height={4.2} rx={1.2} stroke={stroke} strokeWidth={1.8} />
            <Rect x={13.3} y={4.5} width={4.2} height={4.2} rx={1.2} stroke={stroke} strokeWidth={1.8} />
            <Rect x={4.5} y={13.3} width={4.2} height={4.2} rx={1.2} stroke={stroke} strokeWidth={1.8} />
            <Rect x={13.3} y={13.3} width={4.2} height={4.2} rx={1.2} stroke={stroke} strokeWidth={1.8} />
          </>
        ) : null}
      </Svg>
    </View>
  );
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: colors.background
        },
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.inkMuted,
        tabBarActiveBackgroundColor: "#F1F2FF",
        tabBarItemStyle: {
          borderRadius: 22,
          marginHorizontal: 4,
          paddingTop: 8,
          paddingBottom: 6
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginTop: 2
        },
        tabBarStyle: {
          position: "absolute",
          left: 14,
          right: 14,
          bottom: 18,
          height: 76,
          paddingBottom: 10,
          paddingTop: 8,
          backgroundColor: "rgba(252, 251, 248, 0.96)",
          borderTopColor: "transparent",
          borderRadius: 28,
          shadowColor: "#1A1730",
          shadowOpacity: 0.12,
          shadowRadius: 22,
          shadowOffset: {
            width: 0,
            height: 10
          },
          elevation: 10
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Search",
          tabBarIcon: ({ focused }) => <TabIcon kind="search" focused={focused} />
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          tabBarIcon: ({ focused }) => <TabIcon kind="favorites" focused={focused} />
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: "Trips",
          tabBarIcon: ({ focused }) => <TabIcon kind="trips" focused={focused} />
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: "Inbox",
          tabBarIcon: ({ focused }) => <TabIcon kind="inbox" focused={focused} />
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ focused }) => <TabIcon kind="more" focused={focused} />
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7F3ED",
    borderWidth: 1,
    borderColor: "#E8E1D7"
  }
});
