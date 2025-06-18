// // src/ChartLineGraph.js
// import React from 'react';
// import { Box, Heading } from '@chakra-ui/react';
// import { Line } from 'react-chartjs-2';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title as ChartTitle,
//   Tooltip as ChartTooltip,
//   Legend as ChartLegend,
// } from 'chart.js';

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   ChartTitle,
//   ChartTooltip,
//   ChartLegend
// );

// const data = {
//   labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
//   datasets: [
//     {
//       label: 'PV',
//       data: [2400, 1398, 9800, 3908, 4800, 3800, 4300],
//       borderColor: 'rgba(134, 65, 244, 1)',
//       backgroundColor: 'rgba(134, 65, 244, 0.2)',
//       fill: true,
//     },
//     {
//       label: 'UV',
//       data: [4000, 3000, 2000, 2780, 1890, 2390, 3490],
//       borderColor: 'rgba(75, 192, 192, 1)',
//       backgroundColor: 'rgba(75, 192, 192, 0.2)',
//       fill: true,
//     },
//   ],
// };

// const options = {
//   responsive: true,
//   plugins: {
//     legend: {
//       position: 'top',
//     },
//     title: {
//       display: true,
//       text: 'Monthly Data Overview',
//     },
//   },
// };

// const ChartLineGraph = () => {
//   return (
//     <Box p={5} shadow="md" borderWidth="1px" borderRadius="md" bg="white">
//       <Line data={data} options={options} />
//     </Box>
//   );
// };

// export default ChartLineGraph;
  