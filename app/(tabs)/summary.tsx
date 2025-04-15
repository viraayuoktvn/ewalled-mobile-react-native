import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  ActivityIndicator,
} from "react-native";
import {
  VictoryBar,
  VictoryChart,
  VictoryGroup,
  VictoryAxis,
  VictoryTheme,
  VictoryLabel,
} from "victory-native";
import { Picker } from "@react-native-picker/picker";
import { useTheme } from "@/contexts/ThemeContext";
import { useUserContext } from "@/contexts/UserContext";
import {
  BalanceGraphResponse,
  BalanceGraphResult,
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

  const [summary, setSummary] = useState({
    balance: 0,
    totalIncome: 0,
    totalOutcome: 0,
  });
  const [year, setYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [view, setView] = useState<ViewType>("quartal");
  const [graphData, setGraphData] = useState<GraphBarData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);  // Add loading state

  const fetchSummary = async () => {
    try {
      if (!wallet) return;
      setLoading(true);  // Set loading to true when fetching
      const res = await getWalletSummary(wallet.id);
      if (res?.balance !== undefined) setSummary(res);
    } catch (error) {
      console.error("❌ Error getting summary:", error);
    } finally {
      setLoading(false);  // Set loading to false after fetching
    }
  };

  const fetchGraph = async () => {
    try {
      if (!wallet) return;
      setLoading(true);  // Set loading to true when fetching
      const payload: any = { walletId: wallet.id, view, year };

      if (view === "weekly") {
        const currentMonth = new Date().getMonth() + 1;
        payload.month = currentMonth.toString().padStart(2, "0");
      }

      const res: BalanceGraphResult = await getBalanceGraph(payload);
      const result: BalanceGraphResponse[] = res.data;

      if (result) {
        const mapped: GraphBarData[] = result.map((d: BalanceGraphResponse) => {
          let label = d.label;
          if (view === "quartal") label = quartalLabelMap[d.label] ?? d.label;
          else if (view === "monthly") label = d.label.slice(0, 3);
          return { ...d, label };
        });
        setGraphData(mapped);

        const years = result.map((result) => res.year).filter(Boolean);
        const uniqueYears = Array.from(new Set([year, ...years])).sort((a, b) => b - a);
        setAvailableYears(uniqueYears);
      }
    } catch (error) {
      console.error("Error fetching graph:", error);
    } finally {
      setLoading(false);  // Set loading to false after fetching
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
    iconBg: isDarkMode ? "#2c2c2c" : "#e0e0e0",
    iconBgIncomeOutcome: isDarkMode ? "#FFFFFF" : "rgba(0, 97, 255, 0.2)",
  };

  const chartWidth = graphData.length * 130;
  const isScrollable = chartWidth > screenWidth;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} className="p-6">
      <Text style={{ color: colors.text }} className="text-xl font-bold mb-4">
        Balance Overview
      </Text>

      {/* Total Balance */}
      <View className="p-4 rounded-2xl shadow-md mb-4" style={{ backgroundColor: colors.income }}>
        <View className="flex-row items-center mb-2">
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 30,
              backgroundColor: "#FFFFFF",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 8,
            }}
          >
            <Image
              id="img-balance"
              source={require("@/public/images/balance.png")}
              style={{
                width: 20,
                height: 20,
              }}
              resizeMode="contain"
            />
          </View>
          <Text className="text-white text-lg font-semibold">Total Balance</Text>
        </View>
        <Text id="text-balance" className="text-2xl font-bold text-white">
          Rp{summary.balance.toLocaleString("id-ID")}
        </Text>
      </View>

      {/* Income */}
      <View className="p-4 rounded-2xl shadow mb-2" style={{ backgroundColor: colors.card }}>
        <View className="flex-row items-center mb-2">
          <View
              style={{
                width: 35,
                height: 35,
                borderRadius: 30,
                backgroundColor: colors.iconBgIncomeOutcome,
                justifyContent: "center",
                alignItems: "center",
                marginRight: 8,
              }}
            >
              <Image
                id="img-income"
                source={require("@/public/images/income.png")}
                style={{
                  width: 20,
                  height: 20,
                }}
                resizeMode="contain"
              />
            </View>
            <Text className="text-lg font-semibold" style={{ color: colors.text }}>Income</Text>
        </View>
        <Text id="text-income" style={{ color: colors.text }} className="text-xl font-bold">
          Rp{summary.totalIncome.toLocaleString("id-ID")}
        </Text>
      </View>

      {/* Outcome */}
      <View className="p-4 rounded-2xl shadow mb-4" style={{ backgroundColor: colors.card }}>
        <View className="flex-row items-center mb-2">
          <View
            style={{
              width: 35,
              height: 35,
              borderRadius: 30,
              backgroundColor: colors.iconBgIncomeOutcome,
              justifyContent: "center",
              alignItems: "center",
              marginRight: 8,
            }}>
            <Image
              id="img-outcome"
              source={require("@/public/images/outcome.png")}
              style={{
                width: 20,
                height: 20,
              }}
              resizeMode="contain"
            />
          </View>
          <Text className="text-lg font-semibold" style={{ color: colors.text }}>Outcome</Text>
        </View>
        <Text id="text-outcome" style={{ color: colors.text }} className="text-xl font-bold">
          Rp{summary.totalOutcome.toLocaleString("id-ID")}
        </Text>
      </View>

      {/* Graph Switcher */}
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
            id={`switcher-${v}`}
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

      {/* Year Picker */}
      <View className="mb-4">
        <Text style={{ color: colors.text }} className="font-semibold mb-2">
          Choose a Year
        </Text>
        <View
          id="dropdown-year-picker"
          className="mb-6"
          style={{
            backgroundColor: isDarkMode ? "#2c2c2c" : "#f5f5f5",
            borderRadius: 30,
            overflow: 'hidden',
          }}
        >
          <Picker
            id={`dropdown-year-picker-${year}`}
            selectedValue={year}
            onValueChange={(itemValue) => setYear(itemValue)}
            mode="dropdown"
            style={{
              backgroundColor: isDarkMode ? "#2c2c2c" : "#f5f5f5",
              color: isDarkMode ? "white" : "black",
              borderRadius: 30,
              paddingHorizontal: 20
            }}
            dropdownIconColor={isDarkMode ? "#2c2c2c" : "#000000"}
            itemStyle={{
              backgroundColor: isDarkMode ? "#2c2c2c" : "#f5f5f5",
              color: isDarkMode ? "#2c2c2c" : "#000000",
            }}
          >
            {availableYears.map((y) => (
              <Picker.Item key={y} label={`${y}`} value={y} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Graph */}
      <View className="p-8 rounded-2xl shadow mb-10" style={{ backgroundColor: colors.card }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: isScrollable ? "flex-start" : "center",
          }}
        >
          {loading ? ( 
            <View
              style={{
                flex: 1,
                alignItems: "center",    
                height: 400,              
              }}
            >
              <ActivityIndicator size="large" color={colors.income} />
            </View>
          ) : (
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
                 labels={({ datum }) => `Rp${datum.y.toLocaleString("id-ID")}`}
                 labelComponent={<VictoryLabel dy={-8} style={{ fill: colors.text, fontSize: 12 }} />}
               />
               <VictoryBar
                 data={graphData.map((d) => ({ x: d.label, y: d.outcome }))}
                 style={{ data: { fill: colors.outcome } }}
                 labels={({ datum }) => `Rp${datum.y.toLocaleString("id-ID")}`}
                 labelComponent={<VictoryLabel dy={-8} style={{ fill: colors.text, fontSize: 12 }} />}
               />
             </VictoryGroup>
           </VictoryChart>
          )}
        </ScrollView>
      </View>
    </ScrollView>
  );
};

export default SummaryPage;