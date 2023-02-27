import PropertyComponent from "@/components/PropertyComponent";
import SimulationCanvas from "@/components/SimulationCanvas";
import Head from "next/head";
import { useCallback, useState } from "react";
import constants from "./constants.json";

export default function Home() {
  const [iteration, setIteration] = useState(0);
  const [population, setPopulation] = useState(0);
  const [food, setFood] = useState(0);
  const [birth, setBirth] = useState(0);
  const [death, setDeath] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [minSpeed, setMinSpeed] = useState(0);
  const [maxSpeed, setMaxSpeed] = useState(0);
  const [size, setSize] = useState(0);
  const [minSize, setMinSize] = useState(0);
  const [maxSize, setMaxSize] = useState(0);
  const [sense, setSense] = useState(0);
  const [minSense, setMinSense] = useState(0);
  const [maxSense, setMaxSense] = useState(0);

  const onIteration = useCallback(() => setIteration((v: number) => v + 1), []);
  const onPopulationChange = useCallback((v: number) => setPopulation(v), []);
  const onFoodChange = useCallback((v: number) => setFood(v), []);
  const onBirthChange = useCallback((v: number) => setBirth((c) => c + v), []);
  const onDeathChange = useCallback((v: number) => setDeath((c) => c + v), []);
  const onSpeedChange = useCallback((v: number) => setSpeed(v), []);
  const onMinSpeedChange = useCallback((v: number) => setMinSpeed(v), []);
  const onMaxSpeedChange = useCallback((v: number) => setMaxSpeed(v), []);
  const onSizeChange = useCallback((v: number) => setSize(v), []);
  const onMinSizeChange = useCallback((v: number) => setMinSize(v), []);
  const onMaxSizeChange = useCallback((v: number) => setMaxSize(v), []);
  const onSenseChange = useCallback((v: number) => setSense(v), []);
  const onMinSenseChange = useCallback((v: number) => setMinSense(v), []);
  const onMaxSenseChange = useCallback((v: number) => setMaxSense(v), []);

  return (
    <>
      <Head>
        <title>DEAN | Natural Selection</title>
        <meta name="description" content="A simulation of natural selection" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-col h-screen">
        <nav className="px-8 py-4 flex justify-center items-center text-xl">
          <p className="font-light tracking-[0.5rem] transition-all hover:text-slate-800 cursor-pointer">
            DEAN
          </p>
        </nav>
        <div className="flex flex-col items-center justify-center grow">
          <div className="grid grid-cols-2 gap-8">
            <SimulationCanvas
              onIteration={onIteration}
              onPopulationChange={onPopulationChange}
              onFoodChange={onFoodChange}
              onBirthChange={onBirthChange}
              onDeathChange={onDeathChange}
              onSpeedChange={onSpeedChange}
              onMinSpeedChange={onMinSpeedChange}
              onMaxSpeedChange={onMaxSpeedChange}
              onSizeChange={onSizeChange}
              onMinSizeChange={onMinSizeChange}
              onMaxSizeChange={onMaxSizeChange}
              onSenseChange={onSenseChange}
              onMinSenseChange={onMinSenseChange}
              onMaxSenseChange={onMaxSenseChange}
              initialPopulation={constants.initialPopulation}
              initialFoods={constants.initialFood}
              foodRate={constants.foodProductionRate}
              energyRate={constants.energyConsumptionRate}
              bornThreshold={constants.bornEnergyThreshold}
              bornConsumption={constants.bornEnergyConsumption}
              speedFlucuation={constants.speedFlucuation}
              senseFlucuation={constants.senseFlucuation}
              initialSense={constants.initialSense}
            />
            <div className="uppercase w-full grid grid-flow-col grid-rows-4 grid-cols-2 gap-4 text-right text-2xl">
              <PropertyComponent name="Iteration" value={`${iteration}`} />
              <PropertyComponent
                name="Population"
                value={`${population}/${constants.initialPopulation}`}
                description="current/initial"
              />
              <PropertyComponent
                name="Foods"
                value={`${food}/${constants.initialFood}`}
                description="current/initial"
              />
              <PropertyComponent
                name="Birth/Death"
                value={`${birth}/${death}`}
              />
              <PropertyComponent
                name="Birth/Death Ratio"
                value={(birth / death).toFixed(2)}
              />
              <PropertyComponent
                name="Speed"
                value={`${speed.toFixed(2)}/${minSpeed.toFixed(
                  2
                )}/${maxSpeed.toFixed(2)}`}
                description="avg/min avg/max avg"
              />
              <PropertyComponent
                name="Size"
                value={`${size.toFixed(2)}/${minSize.toFixed(
                  2
                )}/${maxSize.toFixed(2)}`}
                description="avg/min avg/max avg"
              />
              <PropertyComponent
                name="Sense"
                value={`${sense.toFixed(2)}/${minSense.toFixed(
                  2
                )}/${maxSense.toFixed(2)}`}
                description="avg/min avg/max avg"
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
