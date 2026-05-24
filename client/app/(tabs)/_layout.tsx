import { Tabs } from "expo-router";
import React from "react";
import BottomBar from "@/components/BottomBar";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => (
        <BottomBar 
          activeTab={props.state.routes[props.state.index].name as any} 
          onTabChange={(tab) => props.navigation.navigate(tab)} 
        />
      )}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="favorites" />
      <Tabs.Screen name="cart" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
