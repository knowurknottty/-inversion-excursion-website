import React, { useMemo, useState } from 'react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from 'recharts';
import { format, subDays } from 'date-fns';
import './LearningTrajectory.css';

export interface TrajectoryPoint {
  date: Date;
  expertiseScore: number;
  accuracyRate: number;
  documentsContributed: number;
  correctionRate: number;
  methodologyDiversity: number;
  confidenceCalibration: number;
}

export interface TrajectoryMilestone {
  date: Date;
  type: 'specialization_unlocked' | 'badge_earned' | 'accuracy_threshold' | 'correction_made' | 'methodology_mastered';
  description: string;
  value: number;
}

export interface MethodologyBalance {
  methodology: string;
  currentScore: number;
  previousScore: number;
}

export interface LearningTrajectoryProps {
  data: TrajectoryPoint[];
  milestones: TrajectoryMilestone[];
  methodologyBalance: MethodologyBalance[];
  comparisonData?: TrajectoryPoint[];
  playerName: string;
}

type ChartMetric = 'expertiseScore' | 'accuracyRate' | 'documentsContributed' | 'correctionRate';

const METRIC_CONFIG: Record<ChartMetric, { label: string; color: string; unit: string }> = {
  expertiseScore: { label: 'Expertise Score', color: '#6366f1', unit: 'pts' },
  accuracyRate: { label: 'Accuracy Rate', color: '#10b981', unit: '%' },
  documentsContributed: { label: 'Documents', color: '#f59e0b', unit: '' },
  correctionRate: { label: 'Correction Response', color: '#8b5cf6', unit: '%' }
};

const formatDate = (date: Date) => format(date, 'MMM d');

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  
  return (
    <div className="trajectory-tooltip">
      <div className="trajectory-tooltip__date">{label}</div>
      {payload.map((entry: any, idx: number) => (
        <div key={idx} className="trajectory-tooltip__row">
          <span 
            className="trajectory-tooltip__dot"
            style={{ background: entry.color }}
          />
          <span className="trajectory-tooltip__label">{entry.name}:</span>
          <span className="trajectory-tooltip__value">
            {Math.round(entry.value)}{entry.payload.unit || ''}
          </span>
        </div>
      ))}
    </div>
  );
};

export const LearningTrajectoryChart: React.FC<LearningTrajectoryProps> = ({
  data,
  milestones,
  methodologyBalance,
  comparisonData,
  playerName
}) => {
  const [selectedMetrics, setSelectedMetrics] = useState<ChartMetric[]>(['expertiseScore', 'accuracyRate']);
  const [showMilestones, setShowMilestones] = useState(true);
  const [timeRange, setTimeRange] = useState<'all' | 'month' | 'quarter'>('all');

  const filteredData = useMemo(() => {
    if (timeRange === 'all') return data;
    
    const days = timeRange === 'month' ? 30 : 90;
    const cutoff = subDays(new Date(), days);
    return data.filter(d => d.date >= cutoff);
  }, [data, timeRange]);

  const chartData = useMemo(() => {
    return filteredData.map(point => ({
      date: formatDate(point.date),
      fullDate: point.date,
      ...point,
      // Normalize correction rate for display (0-100)
      correctionRateDisplay: point.correctionRate * 100
    }));
  }, [filteredData]);

  const filteredMilestones = useMemo(() => {
    if (!showMilestones) return [];
    
    return milestones.filter(m => {
      const mDate = new Date(m.date);
      return filteredData.some(d => 
        formatDate(d.date) === formatDate(mDate)
      );
    });
  }, [milestones, filteredData, showMilestones]);

  const toggleMetric = (metric: ChartMetric) => {
    setSelectedMetrics(prev => 
      prev.includes(metric)
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    );
  };

  return (
    <div className="learning-trajectory">
      <div className="learning-trajectory__header">
        <h3 className="learning-trajectory__title">Learning Trajectory</h3>
        <div className="learning-trajectory__controls">
          <div className="trajectory-controls__group">
            <span className="trajectory-controls__label">Time:</span>
            {(['all', 'month', 'quarter'] as const).map(range => (
              <button
                key={range}
                className={`trajectory-control-btn ${timeRange === range ? 'active' : ''}`}
                onClick={() => setTimeRange(range)}
              >
                {range === 'all' ? 'All Time' : range === 'month' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
          
          <label className="trajectory-toggle">
            <input
              type="checkbox"
              checked={showMilestones}
              onChange={(e) => setShowMilestones(e.target.checked)}
            />
            <span>Show Milestones</span>
          </label>
        </div>
      </div>

      <div className="learning-trajectory__metrics">
        {(Object.keys(METRIC_CONFIG) as ChartMetric[]).map(metric => (
          <button
            key={metric}
            className={`trajectory-metric-btn ${selectedMetrics.includes(metric) ? 'active' : ''}`}
            onClick={() => toggleMetric(metric)}
            style={{ '--metric-color': METRIC_CONFIG[metric].color } as React.CSSProperties}
          >
            <span className="trajectory-metric-btn__dot" />
            {METRIC_CONFIG[metric].label}
          </button>
        ))}
      </div>

      <div className="learning-trajectory__chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }>
            <defs>
              {selectedMetrics.map(metric => (
                <linearGradient 
                  key={metric}
                  id={`gradient-${metric}`}
                  x1="0" y1="0" x2="0" y2="1"
                >
                  <stop 
                    offset="5%" 
                    stopColor={METRIC_CONFIG[metric].color} 
                    stopOpacity={0.3}
                  />
                  <stop 
                    offset="95%" 
                    stopColor={METRIC_CONFIG[metric].color} 
                    stopOpacity={0}
                  />
                </linearGradient>
              ))}
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
            <XAxis 
              dataKey="date" 
              stroke="#8888a0"
              tick={{ fill: '#8888a0', fontSize: 12 }}
              tickLine={{ stroke: '#2a2a3a' }}
            />
            <YAxis 
              yAxisId="left"
              stroke="#8888a0"
              tick={{ fill: '#8888a0', fontSize: 12 }}
              tickLine={{ stroke: '#2a2a3a' }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="#8888a0"
              tick={{ fill: '#8888a0', fontSize: 12 }}
              tickLine={{ stroke: '#2a2a3a' }}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => <span style={{ color: '#e8e8f0' }}>{value}</span>}
            />

            {selectedMetrics.includes('expertiseScore') && (
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="expertiseScore"
                name="Expertise Score"
                stroke={METRIC_CONFIG.expertiseScore.color}
                fillOpacity={1}
                fill={`url(#gradient-expertiseScore)`}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            )}

            {selectedMetrics.includes('accuracyRate') && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="accuracyRate"
                name="Accuracy %"
                stroke={METRIC_CONFIG.accuracyRate.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            )}

            {selectedMetrics.includes('documentsContributed') && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="documentsContributed"
                name="Documents"
                stroke={METRIC_CONFIG.documentsContributed.color}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            )}

            {selectedMetrics.includes('correctionRate') && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="correctionRateDisplay"
                name="Correction Response %"
                stroke={METRIC_CONFIG.correctionRate.color}
                strokeWidth={2}
                dot={false}
              />
            )}

            {showMilestones && filteredMilestones.map((milestone, idx) => {
              const dataPoint = chartData.find(d => 
                formatDate(d.fullDate) === formatDate(new Date(milestone.date))
              );
              if (!dataPoint) return null;
              
              return (
                <ReferenceDot
                  key={idx}
                  x={formatDate(new Date(milestone.date))}
                  y={dataPoint.expertiseScore}
                  r={6}
                  fill="#f59e0b"
                  stroke="#fff"
                  strokeWidth={2}
                  label={{
                    value: '🏆',
                    position: 'top',
                    fill: '#f59e0b',
                    fontSize: 14
                  }}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="learning-trajectory__secondary">
        <MethodologyRadar data={methodologyBalance} />
        <TrajectorySummary data={data[data.length - 1]} playerName={playerName} />
      </div>
    </div>
  );
};

const MethodologyRadar: React.FC<{ data: MethodologyBalance[] }> = ({ data }) => {
  const radarData = useMemo(() => {
    return data.map(d => ({
      methodology: d.methodology.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      current: d.currentScore,
      previous: d.previousScore,
      fullMark: 100
    }));
  }, [data]);

  return (
    <div className="methodology-radar">
      <h4 className="methodology-radar__title">Methodology Balance</h4>
      <ResponsiveContainer width="100%" height={250}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
          <PolarGrid stroke="#2a2a3a" />
          <PolarAngleAxis 
            dataKey="methodology" 
            tick={{ fill: '#8888a0', fontSize: 11 }}
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]} 
            tick={false}
            axisLine={false}
          />
          
          <Radar
            name="Previous Period"
            dataKey="previous"
            stroke="#8888a0"
            fill="#8888a0"
            fillOpacity={0.1}
            strokeDasharray="4 4"
          />
          
          <Radar
            name="Current"
            dataKey="current"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.3}
          />
          
          <Legend 
            wrapperStyle={{ paddingTop: '10px' }}
            formatter={(value) => <span style={{ color: '#e8e8f0', fontSize: 12 }}>{value}</span>}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

const TrajectorySummary: React.FC<{ data: TrajectoryPoint; playerName: string }> = ({ 
  data, 
  playerName 
}) => {
  return (
    <div className="trajectory-summary">
      <h4 className="trajectory-summary__title">Current Standing</h4>
      
      <div className="trajectory-summary__stats">
        <div className="trajectory-stat">
          <span className="trajectory-stat__value">{Math.round(data.expertiseScore)}</span>
          <span className="trajectory-stat__label">Expertise Score</span>
        </div>
        
        <div className="trajectory-stat">
          <span className="trajectory-stat__value">{Math.round(data.accuracyRate)}%</span>
          <span className="trajectory-stat__label">Accuracy</span>
        </div>
        
        <div className="trajectory-stat">
          <span className="trajectory-stat__value">{Math.round(data.correctionRate * 100)}%</span>
          <span className="trajectory-stat__label">Response Rate</span>
        </div>
        
        <div className="trajectory-stat">
          <span className="trajectory-stat__value">{data.methodologyDiversity}</span>
          <span className="trajectory-stat__label">Methodologies</span>
        </div>
      </div>
      
      <div className="trajectory-summary__insight">
        <p>
          {playerName} shows <strong>
          {data.correctionRate > 0.7 ? 'exceptional' : 
           data.correctionRate > 0.5 ? 'strong' : 'developing'}
          </strong>{' '}
          epistemic flexibility, responding to evidence 
          {Math.round(data.correctionRate * 100)}% of the time.
        </p>
      </div>
    </div>
  );
};

export default LearningTrajectoryChart;
