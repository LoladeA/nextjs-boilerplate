"use client";

import { FC } from "react";

interface UserResponse {
  assessment_step: number;
  question_key: string;
  answer: { response: string | number };
}

interface TrendChartProps {
  responses: UserResponse[];
}

const TrendChart: FC<TrendChartProps> = ({ responses }) => {
  return (
    <div className="w-full h-64 bg-gray-100 flex items-center justify-center rounded-md">
      <p className="text-gray-500">
        Trend Chart Placeholder
        <br />
        Total responses: {responses.length}
      </p>
    </div>
  );
};

export default TrendChart;
