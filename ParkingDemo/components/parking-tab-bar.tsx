import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "expo-router/tabs";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";

const colors = {
  bar: "#101010",
  active: "#1014ee",
  inactive: "#929292",
};

const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: "home-outline",
  lot: "location-outline",
  profile: "person-outline",
};

export function ParkingTabBar({
  state,
  descriptors,
  emitter,
  navigateToTab,
  insets,
}: BottomTabBarProps) {
  const [width, setWidth] = useState(0);
  const tabWidth = width / state.routes.length;
  const center = tabWidth * (state.index + 0.5);
  const shoulder = Math.min(50, Math.max(0, tabWidth / 2 - 10));

  // The dip is part of the bar itself, leaving a real curved cutout.
  const outline = `
    M 8 24
    H ${center - shoulder}
    C ${center - shoulder + 12} 24, ${center - 38} 69, ${center} 69
    C ${center + 38} 69, ${center + shoulder - 12} 24, ${center + shoulder} 24
    H ${width - 8}
    Q ${width} 24, ${width} 32
    V 72
    Q ${width} 104, ${width - 32} 104
    H 32
    Q 0 104, 0 72
    V 32
    Q 0 24, 8 24
    Z
  `;

  return (
    <View
      style={[
        styles.footer,
        {
          paddingBottom: Math.max(insets.bottom, 16),
          paddingLeft: Math.max(insets.left, 24),
          paddingRight: Math.max(insets.right, 24),
        },
      ]}
    >
      <View
        style={styles.bar}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      >
        {width > 0 && (
          <Svg
            width={width}
            height={84}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
            accessible={false}
          >
            <Path d={outline} fill={colors.bar} />
          </Svg>
        )}

        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const { options } = descriptors[route.key];

          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={
                options.tabBarAccessibilityLabel ?? options.title ?? route.name
              }
              testID={`tab-${route.name}`}
              onPress={() => {
                const event = emitter.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!focused && !event.defaultPrevented) {
                  navigateToTab(route.key);
                }
              }}
              onLongPress={() => {
                emitter.emit({ type: "tabLongPress", target: route.key });
              }}
              style={styles.tab}
            >
              {({ pressed }) => (
                <View
                  style={[
                    styles.icon,
                    focused && styles.activeIcon,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name={icons[route.name] ?? "ellipse-outline"}
                    size={27}
                    color={focused ? "#FFFFFF" : colors.inactive}
                  />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    alignItems: "center",
    paddingTop: 0,
    backgroundColor: "transparent",
  },
  bar: {
    width: "100%",
    maxWidth: 440,
    height: 54,
    flexDirection: "row",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    height: 54,
  },
  icon: {
    marginTop: 27,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
  },
  activeIcon: {
    marginTop: 3,
    backgroundColor: colors.active,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.94 }],
  },
});
