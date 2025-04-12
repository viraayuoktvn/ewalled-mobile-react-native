import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import {
  VictoryBar,
  VictoryChart,
  VictoryGroup,
  VictoryAxis,
  VictoryTheme,
  VictoryLabel,
} from "victory-native";
import { useTheme } from "@/contexts/ThemeContext";
import { useUserContext } from "@/contexts/UserContext";
import {
  BalanceGraphResponse,
  getBalanceGraph,
  getWalletSummary,
} from "@/services/api";

const screenWidth = Dimensions.get("window").width;

const VIEWS = ["quartal", "monthly", "weekly"] as const;
type ViewType = typeof VIEWS[number];
type GraphBarData = BalanceGraphResponse & { label: string };

const quartalLabelMap: Record<string, string> = {
  Q1: "Jan - Mar",
  Q2: "Apr - Jun",
  Q3: "Jul - Sep",
  Q4: "Oct - Dec",
};

const SummaryPage = () => {
  const { isDarkMode } = useTheme();
  const { user, wallet } = useUserContext();

  const [summary, setSummary] = useState({ balance: 0, totalIncome: 0, totalOutcome: 0 });
  const [year, setYear] = useState(new Date().getFullYear());
  const [view, setView] = useState<ViewType>("quartal");
  const [graphData, setGraphData] = useState<GraphBarData[]>([]);

  const fetchSummary = async () => {
    try {
      if (!wallet) return;
      const res = await getWalletSummary(wallet.id);
      if (res?.balance !== undefined) setSummary(res);
    } catch (error) {
      console.error("❌ Error getting summary:", error);
    }
  };

  const fetchGraph = async () => {
    try {
      if (!wallet) return;
      const payload: any = { walletId: wallet.id, view, year };

      if (view === "weekly") {
        const currentMonth = new Date().getMonth() + 1;
        payload.month = currentMonth.toString().padStart(2, "0");
      }

      const res = await getBalanceGraph(payload);
      const result = res.data;

      if (result) {
        const mapped: GraphBarData[] = result.map((d: BalanceGraphResponse) => {
          let label = d.label;
          if (view === "quartal") label = quartalLabelMap[d.label] ?? d.label;
          else if (view === "monthly") label = d.label.slice(0, 3);
          return { ...d, label };
        });
        setGraphData(mapped);
      }
    } catch (error) {
      console.error("❌ Error fetching graph:", error);
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchGraph();
  }, [wallet, view, year]);

  const colors = {
    bg: isDarkMode ? "#121212" : "#ffffff",
    card: isDarkMode ? "#1f1f1f" : "#ffffff",
    text: isDarkMode ? "#ffffff" : "#000000",
    secondary: isDarkMode ? "#c0c0c0" : "#4b5563",
    income: "#0061FF",
    outcome: "#D4D4D4",
    switcher: isDarkMode ? "#2c2c2c" : "#e5e7eb",
  };

  const chartWidth = graphData.length * 130;
  const isScrollable = chartWidth > screenWidth;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} className="p-6">
      <Text style={{ color: colors.text }} className="text-xl font-bold mb-4">
        Balance Overview
      </Text>

      <View className="p-4 rounded-2xl shadow-md mb-4" style={{ backgroundColor: colors.income }}>
        <Text className="text-white font-semibold">Total Balance</Text>
        <Text className="text-2xl font-bold text-white">
          Rp {summary.balance.toLocaleString("id-ID")}
        </Text>
      </View>

      <View className="p-4 rounded-2xl shadow mb-2" style={{ backgroundColor: colors.card }}>
        <Text style={{ color: colors.secondary }} className="font-semibold">Income</Text>
        <Text style={{ color: colors.text }} className="text-xl font-bold">
          Rp {summary.totalIncome.toLocaleString("id-ID")}
        </Text>
      </View>

      <View className="p-4 rounded-2xl shadow mb-4" style={{ backgroundColor: colors.card }}>
        <Text style={{ color: colors.secondary }} className="font-semibold">Outcome</Text>
        <Text style={{ color: colors.text }} className="text-xl font-bold">
          Rp {summary.totalOutcome.toLocaleString("id-ID")}
        </Text>
      </View>

      <View className="flex-row items-center justify-between mb-4 px-1 mt-8">
        <Text style={{ color: colors.text }} className="text-xl font-bold">Balance Graph</Text>
        <View className="flex-row gap-2">
          <View className="flex-row items-center mr-4">
            <View className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: colors.income }} />
            <Text style={{ color: colors.text }} className="text-sm">Income</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: colors.outcome }} />
            <Text style={{ color: colors.text }} className="text-sm">Outcome</Text>
          </View>
        </View>
      </View>

      <View className="rounded-full flex-row p-1 mb-4" style={{ backgroundColor: colors.switcher }}>
        {VIEWS.map((v) => (
          <TouchableOpacity
            key={v}
            onPress={() => setView(v)}
            className={`flex-1 py-2 rounded-full items-center ${view === v ? "bg-blue-600" : ""}`}
          >
            <Text
              className={`text-sm font-semibold ${view === v ? "text-white" : ""}`}
              style={view === v ? {} : { color: colors.text }}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        className="py-3 px-4 rounded-xl mb-4"
        style={{ backgroundColor: colors.switcher }}
        onPress={() => setYear(year === 2024 ? 2025 : 2024)}
      >
        <Text style={{ color: colors.text }} className="text-center font-medium">
          Choose a Year: {year}
        </Text>
      </TouchableOpacity>

      <View className="p-8 rounded-2xl shadow mb-10" style={{ backgroundColor: colors.card }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: isScrollable ? "flex-start" : "center",
          }}
        >
          <VictoryChart
            width={chartWidth}
            height={400}
            theme={VictoryTheme.material}
            domainPadding={{ x: 40 }}
            padding={{ top: 20, bottom: 50, left: 20, right: 20 }}
            domain={{
              y: [0, Math.max(summary.totalIncome, summary.totalOutcome) * 1.2 || 1000000],
            }}
          >
            <VictoryAxis
              tickValues={graphData.map((d) => d.label)}
              style={{
                axis: { stroke: "transparent" },
                ticks: { stroke: "transparent" },
                grid: { stroke: "transparent" },
                tickLabels: { fill: colors.text, fontSize: 13 },
              }}
            />
            <VictoryAxis
              dependentAxis
              tickFormat={() => ""}
              style={{
                axis: { stroke: "transparent" },
                ticks: { stroke: "transparent" },
                grid: { stroke: "transparent" },
                tickLabels: { fill: "transparent" },
              }}
            />
            <VictoryGroup offset={30} style={{ data: { width: 50 } }}>
              <VictoryBar
                data={graphData.map((d) => ({ x: d.label, y: d.income }))}
                style={{ data: { fill: colors.income } }}
                labels={({ datum }) => `Rp ${datum.y.toLocaleString("id-ID")}`}
                labelComponent={<VictoryLabel dy={-8} style={{ fill: colors.text, fontSize: 12 }} />}
              />
              <VictoryBar
                data={graphData.map((d) => ({ x: d.label, y: d.outcome }))}
                style={{ data: { fill: colors.outcome } }}
                labels={({ datum }) => `Rp ${datum.y.toLocaleString("id-ID")}`}
                labelComponent={<VictoryLabel dy={-8} style={{ fill: colors.text, fontSize: 12 }} />}
              />
            </VictoryGroup>
          </VictoryChart>
        </ScrollView>
      </View>
    </ScrollView>
  );
};

export default SummaryPage;