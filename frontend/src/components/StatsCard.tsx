interface StatsCardProps {
  title: string;
  value: number;
  icon: string;
  gradient: string;
  description?: string;
}

export default function StatsCard({ title, value, icon, gradient, description }: StatsCardProps) {
  return (
    <div className="card-modern p-6 group hover:scale-105 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-r ${gradient} rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200`}>
          <span className="text-white text-xl">{icon}</span>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
            {value}
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}
      </div>
    </div>
  );
}