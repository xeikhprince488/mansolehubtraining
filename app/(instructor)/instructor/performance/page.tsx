import { getPerformance } from "@/app/actions/getPerformance";
import Chart from "@/components/performance/Chart";
import DataCard from "@/components/performance/DataCard";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { BarChart3, DollarSign, TrendingUp, Users } from "lucide-react";

const PerformancePage = async () => {
  const { userId } = await  auth();

  if (!userId) {
    return redirect("/sign-in");
  }

  const { data, totalRevenue, totalSales } = await getPerformance(userId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center justify-center w-12 h-12 bg-white/10 rounded-xl">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Performance Analytics</h1>
              <p className="text-blue-100 mt-1">Track your course sales and revenue performance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <DataCard 
            value={totalRevenue} 
            label="Total Revenue" 
            shouldFormat 
            icon={DollarSign}
            color="emerald"
          />
          <DataCard 
            value={totalSales} 
            label="Total Sales" 
            icon={TrendingUp}
            color="blue"
          />
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Revenue Analytics</h2>
                <p className="text-slate-600 text-sm">Monthly revenue breakdown and trends</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <Chart data={data} />
          </div>
        </div>

        {/* Additional Insights */}
        {data && data.length > 0 && (
          <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Performance Insights</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white/50 rounded-lg p-4">
                <div className="text-slate-600">Best Month</div>
                <div className="font-semibold text-slate-800">
                  {data.reduce((max, item) => item.total > max.total ? item : max, data[0])?.name || 'N/A'}
                </div>
              </div>
              <div className="bg-white/50 rounded-lg p-4">
                <div className="text-slate-600">Total Months</div>
                <div className="font-semibold text-slate-800">{data.length}</div>
              </div>
              <div className="bg-white/50 rounded-lg p-4">
                <div className="text-slate-600">Average Monthly</div>
                <div className="font-semibold text-slate-800">
                  ${Math.round(data.reduce((sum, item) => sum + item.total, 0) / data.length)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformancePage