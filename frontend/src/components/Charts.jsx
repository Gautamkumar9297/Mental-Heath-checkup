import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Common chart options
const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'index',
  },
};

// Mood Trends Line Chart
export const MoodTrendsChart = ({ data, loading = false }) => {
  if (loading) {
    return (
      <div className="w-full h-64 bg-secondary-50 animate-pulse rounded-lg flex items-center justify-center">
        <div className="text-secondary-400">Loading mood trends...</div>
      </div>
    );
  }

  if (!data || !data.data || !data.data.labels) {
    return (
      <div className="w-full h-64 bg-secondary-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-secondary-400 mb-2">No mood data available</div>
          <div className="text-sm text-secondary-300">Start tracking your mood to see trends</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <Line data={data.data} options={{ ...commonOptions, ...data.options }} />
    </div>
  );
};

// Mood Distribution Doughnut Chart
export const MoodDistributionChart = ({ data, loading = false }) => {
  if (loading) {
    return (
      <div className="w-full h-64 bg-secondary-50 animate-pulse rounded-lg flex items-center justify-center">
        <div className="text-secondary-400">Loading mood distribution...</div>
      </div>
    );
  }

  if (!data || !data.data || !data.data.labels || data.data.labels.length === 0) {
    return (
      <div className="w-full h-64 bg-secondary-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-secondary-400 mb-2">No mood data available</div>
          <div className="text-sm text-secondary-300">Track your mood to see distribution</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <Doughnut data={data.data} options={{ ...commonOptions, ...data.options }} />
    </div>
  );
};

// Emotions Bar Chart
export const EmotionsChart = ({ data, loading = false }) => {
  if (loading) {
    return (
      <div className="w-full h-64 bg-secondary-50 animate-pulse rounded-lg flex items-center justify-center">
        <div className="text-secondary-400">Loading emotions data...</div>
      </div>
    );
  }

  if (!data || !data.data || !data.data.labels || data.data.labels.length === 0) {
    return (
      <div className="w-full h-64 bg-secondary-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-secondary-400 mb-2">No emotions data available</div>
          <div className="text-sm text-secondary-300">Log your emotions to see insights</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <Bar data={data.data} options={{ ...commonOptions, ...data.options }} />
    </div>
  );
};

// Wellness Radar Chart
export const WellnessRadarChart = ({ data, loading = false }) => {
  if (loading) {
    return (
      <div className="w-full h-64 bg-secondary-50 animate-pulse rounded-lg flex items-center justify-center">
        <div className="text-secondary-400">Loading wellness score...</div>
      </div>
    );
  }

  if (!data || !data.data || !data.data.labels) {
    return (
      <div className="w-full h-64 bg-secondary-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-secondary-400 mb-2">Wellness score unavailable</div>
          <div className="text-sm text-secondary-300">Keep using the app to build your wellness profile</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <Radar data={data.data} options={{ ...commonOptions, ...data.options }} />
    </div>
  );
};

// Session Activity Chart
export const SessionActivityChart = ({ data, loading = false }) => {
  if (loading) {
    return (
      <div className="w-full h-64 bg-secondary-50 animate-pulse rounded-lg flex items-center justify-center">
        <div className="text-secondary-400">Loading session activity...</div>
      </div>
    );
  }

  if (!data || !data.data || !data.data.labels) {
    return (
      <div className="w-full h-64 bg-secondary-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-secondary-400 mb-2">No session data available</div>
          <div className="text-sm text-secondary-300">Start chatting or book sessions to see activity</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <Bar data={data.data} options={{ ...commonOptions, ...data.options }} />
    </div>
  );
};

// Chart Container Component
export const ChartCard = ({ 
  title, 
  description, 
  children, 
  actions, 
  loading = false,
  className = "" 
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-lg border border-secondary-100 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-secondary-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-secondary-900">{title}</h3>
            {description && (
              <p className="text-sm text-secondary-600 mt-1">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="w-full h-64 bg-secondary-50 animate-pulse rounded-lg flex items-center justify-center">
            <div className="text-secondary-400">Loading chart...</div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

// Stats Card Component
export const StatsCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral',
  icon: Icon,
  color = 'primary',
  loading = false 
}) => {
  const colorClasses = {
    primary: 'from-primary-500 to-primary-600',
    success: 'from-green-500 to-green-600',
    warning: 'from-yellow-500 to-orange-600',
    danger: 'from-red-500 to-red-600',
    info: 'from-blue-500 to-blue-600'
  };

  const changeClasses = {
    positive: 'text-green-600 bg-green-50',
    negative: 'text-red-600 bg-red-50',
    neutral: 'text-secondary-600 bg-secondary-50'
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-secondary-100 p-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-secondary-200 rounded w-24"></div>
            <div className="h-8 bg-secondary-300 rounded w-16"></div>
            <div className="h-4 bg-secondary-200 rounded w-20"></div>
          </div>
          <div className="w-12 h-12 bg-secondary-200 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-secondary-100 p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-secondary-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-secondary-900">{value}</p>
          {change && (
            <p className={`text-sm font-medium px-2 py-1 rounded-full inline-block mt-2 ${changeClasses[changeType]}`}>
              {change}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        )}
      </div>
    </div>
  );
};

export default {
  MoodTrendsChart,
  MoodDistributionChart,
  EmotionsChart,
  WellnessRadarChart,
  SessionActivityChart,
  ChartCard,
  StatsCard
};