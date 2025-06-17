import { formatPrice } from "@/lib/formatPrice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface DataCardProps {
  value: number;
  label: string;
  shouldFormat?: boolean;
  icon?: LucideIcon;
  color?: 'blue' | 'emerald' | 'purple' | 'orange';
}

const DataCard = ({ value, label, shouldFormat, icon: Icon, color = 'blue' }: DataCardProps) => {
  const colorClasses = {
    blue: {
      gradient: 'from-blue-500 to-indigo-600',
      bg: 'from-blue-50 to-indigo-50',
      border: 'border-blue-200',
      text: 'text-blue-600'
    },
    emerald: {
      gradient: 'from-emerald-500 to-teal-600',
      bg: 'from-emerald-50 to-teal-50',
      border: 'border-emerald-200',
      text: 'text-emerald-600'
    },
    purple: {
      gradient: 'from-purple-500 to-pink-600',
      bg: 'from-purple-50 to-pink-50',
      border: 'border-purple-200',
      text: 'text-purple-600'
    },
    orange: {
      gradient: 'from-orange-500 to-red-600',
      bg: 'from-orange-50 to-red-50',
      border: 'border-orange-200',
      text: 'text-orange-600'
    }
  };

  const colors = colorClasses[color];

  return (
    <Card className={`bg-gradient-to-br ${colors.bg} border-2 ${colors.border} shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-slate-700">{label}</CardTitle>
        {Icon && (
          <div className={`flex items-center justify-center w-10 h-10 bg-gradient-to-r ${colors.gradient} rounded-lg shadow-md`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        )}
      </CardHeader>
      <CardContent className="pb-6">
        <div className={`text-3xl font-bold ${colors.text} mb-2`}>
          {shouldFormat ? formatPrice(value) : value.toLocaleString()}
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${colors.gradient}`}></div>
          <span className="text-xs text-slate-500 font-medium">Performance metric</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataCard;
