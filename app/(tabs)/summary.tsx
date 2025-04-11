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

type GraphBarData = BalanceGraphResponse & { label: string };

const SummaryPage = () => {
  const { isDarkMode } = useTheme();
  const { user, wallet } = useUserContext();

  const [summary, setSummary] = useState({ balance: 0, totalIncome: 0, totalOutcome: 0 });
  const [year, setYear] = useState(new Date().getFullYear());
  const [graphData, setGraphData] = useState<GraphBarData[]>([]);

  const VIEWS = ["quartal", "monthly", "weekly"] as const;
  type ViewType = typeof VIEWS[number];
  const [view, setView] = useState<ViewType>("quartal");

  useEffect(() => {
    if (!wallet) return;

    const fetchSummary = async () => {
      try {
        const res = await getWalletSummary(wallet.id);
        if (res && res.balance !== undefined) setSummary(res);
      } catch (error) {
        console.error("❌ Error getting summary:", error);
      }
    };

    const fetchGraph = async () => {
      try {
        const payload: any = { walletId: wallet.id, view, year };
        if (view === "weekly") {
          const currentMonth = new Date().getMonth(); // 0-11
          const monthNames = [
            "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
            "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
          ];
          payload.month = monthNames[currentMonth];
          console.log("payload.month: ", payload.month)
        }        

        const res = await getBalanceGraph(payload);
        const result = res.data;

        if (result) {
          const mapped: GraphBarData[] = result.map((d: BalanceGraphResponse) => {
            let label = d.label;
            if (view === "quartal") {
              const map = { Q1: "Jan - Mar", Q2: "Apr - Jun", Q3: "Jul - Sep", Q4: "Oct - Dec" };
              label = map[d.label] ?? d.label;
            } else if (view === "monthly") {
              label = d.label.slice(0, 3);
            }
            return { ...d, label };
          });
          setGraphData(mapped);
        }
      } catch (error) {
        console.error("❌ Error fetching graph:", error);
      }
    };

    fetchSummary();
    fetchGraph();
  }, [wallet, view, year]);

  const bgColor = isDarkMode ? "#121212" : "#ffffff";
  const cardColor = isDarkMode ? "#1f1f1f" : "#ffffff";
  const textColor = isDarkMode ? "#ffffff" : "#000000";
  const secondaryTextColor = isDarkMode ? "#c0c0c0" : "#4b5563";
  const barColorIncome = "#3B82F6";
  const barColorOutcome = "#D1D5DB";

  return (
    <ScrollView style={{ flex: 1, backgroundColor: bgColor }} className="p-6">
      <Text style={{ color: textColor }} className="text-xl font-bold mb-4">
        Balance Overview
      </Text>

      {/* Balance */}
      <View className="p-4 rounded-2xl shadow-md mb-4" style={{ backgroundColor: "#3B82F6" }}>
        <Text className="text-white font-semibold">Total Balance</Text>
        <Text className="text-2xl font-bold text-white">
          Rp {summary.balance.toLocaleString("id-ID")}
        </Text>
      </View>

      {/* Income */}
      <View className="p-4 rounded-2xl shadow mb-2" style={{ backgroundColor: cardColor }}>
        <Text style={{ color: secondaryTextColor }} className="font-semibold">Income</Text>
        <Text style={{ color: textColor }} className="text-xl font-bold">
          Rp {summary.totalIncome.toLocaleString("id-ID")}
        </Text>
      </View>

      {/* Outcome */}
      <View className="p-4 rounded-2xl shadow mb-4" style={{ backgroundColor: cardColor }}>
        <Text style={{ color: secondaryTextColor }} className="font-semibold">Outcome</Text>
        <Text style={{ color: textColor }} className="text-xl font-bold">
          Rp {summary.totalOutcome.toLocaleString("id-ID")}
        </Text>
      </View>

      {/* Section Title */}
      <View className="flex-row items-center justify-between mb-4 px-1 mt-8">
        <Text style={{ color: textColor }} className="text-xl font-bold">Balance Graph</Text>
        <View className="flex-row gap-2">
          <View className="flex-row items-center mr-4">
            <View className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: barColorIncome }} />
            <Text style={{ color: textColor }} className="text-sm">Income</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: barColorOutcome }} />
            <Text style={{ color: textColor }} className="text-sm">Outcome</Text>
          </View>
        </View>
      </View>

      {/* View Switcher */}
      <View className="rounded-full flex-row p-1 mb-4" style={{ backgroundColor: isDarkMode ? "#2c2c2c" : "#e5e7eb" }}>
        {VIEWS.map((v) => (
          <TouchableOpacity
            key={v}
            onPress={() => setView(v)}
            className={`flex-1 py-2 rounded-full items-center ${
              view === v ? "bg-blue-600" : ""
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                view === v ? "text-white" : ""
              }`}
              style={view === v ? {} : { color: textColor }}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Year Picker */}
      <TouchableOpacity
        className="py-3 px-4 rounded-xl mb-4"
        style={{ backgroundColor: isDarkMode ? "#2c2c2c" : "#e5e7eb" }}
        onPress={() => setYear(year === 2024 ? 2025 : 2024)}
      >
        <Text style={{ color: textColor }} className="text-center font-medium">
          Choose a Year: {year}
        </Text>
      </TouchableOpacity>

      {/* Chart Card */}
      <View className="p-8 rounded-2xl shadow mb-10" style={{ backgroundColor: cardColor }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <VictoryChart
            width={graphData.length * 130} // setiap label dikasih lebar 100px
            height={400}
            theme={VictoryTheme.material}
            domainPadding={{ x: 40 }}
            padding={{ top: 20, bottom: 50, left: 60, right: 20 }}
            domain={{
              y: [0, Math.max(summary.totalIncome, summary.totalOutcome) * 1.2 || 1000000],
            }}
          >
            <VictoryAxis
              tickValues={graphData.map((d) => d.label)}
              style={{
                axis: { stroke: textColor },
                ticks: { stroke: "transparent" },
                grid: { stroke: "transparent" },
                tickLabels: { fill: textColor, fontSize: 12 },
              }}
            />
            <VictoryAxis
              dependentAxis
              tickFormat={(x) => `Rp ${x / 1000000}JT`}
              style={{
                axis: { stroke: textColor },
                ticks: { stroke: "transparent" },
                grid: { stroke: "transparent" },
                tickLabels: { fill: textColor, fontSize: 10 },
              }}
            />
            <VictoryGroup offset={30} style={{ data: { width: 20 } }}>
              <VictoryBar
                data={graphData.map((d) => ({ x: d.label, y: d.income }))}
                style={{ data: { fill: barColorIncome } }}
                labels={({ datum }) => `Rp ${datum.y.toLocaleString("id-ID")}`}
                labelComponent={
                  <VictoryLabel dy={-8} style={{ fill: textColor, fontSize: 10 }} />
                }
              />
              <VictoryBar
                data={graphData.map((d) => ({ x: d.label, y: d.outcome }))}
                style={{ data: { fill: barColorOutcome } }}
                labels={({ datum }) => `Rp ${datum.y.toLocaleString("id-ID")}`}
                labelComponent={
                  <VictoryLabel dy={-8} style={{ fill: textColor, fontSize: 10 }} />
                }
              />
            </VictoryGroup>
          </VictoryChart>
        </ScrollView>
      </View>
    </ScrollView>
  );
};

export default SummaryPage;