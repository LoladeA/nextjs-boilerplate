"use client";

import { FC } from "react";

interface RadarChartProps {
  data: {
    environmentalLoad: number;
    spatialDysregulation: number;
    biologicalMismatch: number;
  };
}

const RadarChart: FC<RadarChartProps> = ({ data }) => {
  return (
    <div className="w-full h-64 bg-gray-100 flex items-center justify-center rounded-md">
      <p className="text-gray-500">
        Radar Chart Placeholder
        <br />
        Environmental Load: {data.environmentalLoad}, Spatial Dysregulation: {data.spatialDysregulation}, Biological Mismatch: {data.biologicalMismatch}
      </p>
    </div>
  );
};

export default RadarChart;
