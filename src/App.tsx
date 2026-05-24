import { Simulator } from '@components/young-finance/Simulator';
import Header from '@components/young-finance/Header';

export default function App() {
  return (
    <div className="bg-[#09090b] min-h-screen text-white">
      <Header />
      <Simulator />
    </div>
  );
}
