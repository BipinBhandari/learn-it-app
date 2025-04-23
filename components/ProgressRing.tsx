import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface ProgressRingProps {
  progress: number;
  size: number;
  strokeWidth: number;
  color?: string;
  backgroundColor?: string;
}

const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size,
  strokeWidth,
  color = '#3B82F6',
  backgroundColor = '#E5E7EB',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circleCircumference = 2 * Math.PI * radius;
  const strokeDashoffset = circleCircumference - (progress / 100) * circleCircumference;
  
  return (
    <View>
      <Svg width={size} height={size}>
        {/* Background Circle */}
        <Circle
          r={radius}
          cx={size / 2}
          cy={size / 2}
          fill="transparent"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />
        
        {/* Progress Circle */}
        <Circle
          r={radius}
          cx={size / 2}
          cy={size / 2}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circleCircumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90, ${size / 2}, ${size / 2})`}
        />
      </Svg>
    </View>
  );
};

export default ProgressRing;