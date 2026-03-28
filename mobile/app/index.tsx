import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useApp } from "../src/providers/app-provider";
import { colors } from "../src/theme/tokens";

export default function IndexRoute() {
  const { ready } = useApp();

  if (!ready) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return <Redirect href="/(app)/(tabs)" />;
}
