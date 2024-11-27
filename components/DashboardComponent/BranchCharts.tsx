"use client";

// }

// interface CustomTooltipProps {
//   active?: boolean;
//   payload?: Array<{ value: number }>;
//   label?: string;
// }

export default function BranchCharts() {


//   const groupSalesData = [
//     { name: "YİYECEK", value: salesData.food },
//     { name: "İÇECEK", value: salesData.drinks },
//     { name: "İND. MENÜ", value: salesData.discountMenu },
//   ];

//   const revenueChartData = [
//     { name: "Açık Çekler", value: revenueData.openChecks },
//     { name: "Kapalı Çekler", value: revenueData.closedChecks },
//     { name: "Toplam Ciro", value: revenueData.total },
//   ];

//   const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
//     if (active && payload && payload.length) {
//       return (
//         <div className="bg-background/95 border border-border p-2 rounded-lg shadow-lg backdrop-blur-sm">
//           <p className="text-sm font-medium">{label}</p>
//           <p className="text-sm text-muted-foreground">
//             {formatCurrency(payload[0].value)}
//           </p>
//         </div>
//       );
//     }
//     return null;
//   };

//   const commonXAxisProps: XAxisProps = {
//     tick: { fontSize: 12 },
//     axisLine: { stroke: 'hsl(var(--border))' },
//     tickLine: { stroke: 'hsl(var(--border))' }
//   };

//   const commonYAxisProps: YAxisProps = {
//     tick: { fontSize: 12 },
//     axisLine: { stroke: 'hsl(var(--border))' },
//     tickLine: { stroke: 'hsl(var(--border))' }
//   };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-6 hover:shadow-lg transition-all duration-300">
          <h3 className="text-lg font-semibold mb-4">TOPLAM CİRO ANALİZİ</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  {...commonXAxisProps}
                  dataKey="name"
                  interval={0}
                />
                <YAxis 
                  {...commonYAxisProps}
                  tickFormatter={(value) => `${value.toLocaleString()} ₺`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="value" 
                  fill="hsl(var(--chart-1))"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-6 hover:shadow-lg transition-all duration-300">
          <h3 className="text-lg font-semibold mb-4">GRUP SATIŞ DAĞILIMI</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={groupSalesData} 
                layout="vertical"
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  {...commonXAxisProps}
                  type="number"
                  tickFormatter={(value) => `${value.toLocaleString()} ₺`}
                />
                <YAxis 
                  {...commonYAxisProps}
                  type="category" 
                  dataKey="name"
                  width={80}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="value" 
                  fill="hsl(var(--chart-2))"
                  radius={[0, 4, 4, 0]}
                  maxBarSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div> */}
    </div>
  );
}