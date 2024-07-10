import { useEffect, useState } from 'react';
import { indigoDark, slateDark } from '@radix-ui/colors';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Layout } from 'components/Layout';
import Card from 'components/ui/Card';
import { Container } from 'components/ui/Container';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Results() {
  const [resultData, setResultData] = useState([]);

  useEffect(() => {
    setResultData(JSON.parse(sessionStorage.getItem('resultData')));
  }, []);

  if (!resultData?.length > 0) {
    return (
      <Container>
        <div>No stats data received from provider :(</div>
      </Container>
    );
  }

  const chartData = {
    labels: resultData.map((x, index) => `${index}`),
    datasets: [
      {
        label: 'receiveInBytes',
        data: resultData.map((x) => x),
        borderColor: indigoDark.indigo6,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      x: {
        ticks: false,
      },
      y: {
        ticks: {
          color: slateDark.slate11,
          font: {
            family: 'Poppins',
          },
        },
        grid: {
          drawBorder: false,
          color: slateDark.slate4,
        },
      },
    },
    plugins: {
      legend: false,
    },
    elements: {
      line: {
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      point: {
        backgroundColor: indigoDark.indigo9,
        hoverRadius: 6,
        radius: 3,
        hoverBackgroundColor: indigoDark.indigo11,
      },
    },
  };

  return (
    <Layout>
      <Container>
        <Card css={{ width: 640 }}>
          <h2>Highest bytes received</h2>
          <Line data={chartData} options={options} />
        </Card>
      </Container>
    </Layout>
  );
}
