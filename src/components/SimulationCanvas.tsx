import React, { useRef, useEffect } from "react";

interface Positioned {
  x: number;
  y: number;
}

interface Entity extends Positioned {
  direction: number;
  energy: number;
  speed: number;
  size: number;
  sense: number;
  target: Food | null;
}

interface Food extends Positioned {}

interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

const getColorBetween = (colorA: Color, colorB: Color, value: number) => {
  if (value === 0) return colorA;
  else if (value === 1) return colorB;
  return {
    r: Math.floor(colorA.r + (colorB.r - colorA.r) * value),
    g: Math.floor(colorA.g + (colorB.g - colorA.g) * value),
    b: Math.floor(colorA.b + (colorB.b - colorA.b) * value),
    a: colorA.a + (colorB.a - colorA.a) * value,
  };
};

const colorToString = (color: Color) =>
  `rgba(${color.r.toFixed(0)}, ${color.g.toFixed(0)}, ${color.b.toFixed(
    0
  )}, ${color.a.toFixed(1)})`;

const entityRadius = 10;
const foodRadius = 1;

interface Props {
  onIteration: () => void;
  onPopulationChange: (population: number) => void;
  onFoodChange: (food: number) => void;
  onBirthChange: (birth: number) => void;
  onDeathChange: (death: number) => void;
  onSpeedChange: (speed: number) => void;
  onMinSpeedChange: (speed: number) => void;
  onMaxSpeedChange: (speed: number) => void;
  onSizeChange: (size: number) => void;
  onMinSizeChange: (size: number) => void;
  onMaxSizeChange: (size: number) => void;
  onSenseChange: (sense: number) => void;
  onMinSenseChange: (sense: number) => void;
  onMaxSenseChange: (sense: number) => void;
  initialPopulation: number;
  initialFoods: number;
  foodRate: number;
  energyRate: number;
  bornThreshold: number;
  bornConsumption: number;
  speedFlucuation: number;
  senseFlucuation: number;
  initialSense: number;
}

const SimulationCanvas = ({
  onIteration,
  onPopulationChange,
  onFoodChange,
  onBirthChange,
  onDeathChange,
  onSpeedChange,
  onMinSpeedChange,
  onMaxSpeedChange,
  onSizeChange,
  onMinSizeChange,
  onMaxSizeChange,
  onSenseChange,
  onMinSenseChange,
  onMaxSenseChange,
  initialFoods,
  initialPopulation,
  foodRate,
  energyRate,
  bornThreshold,
  bornConsumption,
  speedFlucuation,
  senseFlucuation,
  initialSense,
}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    canvas.width = 750;
    canvas.height = 500;
    const offCanvas = document.createElement("canvas");
    offCanvas.width = canvas.width;
    offCanvas.height = canvas.height;
    const offContext = offCanvas.getContext("2d");
    if (!offContext) return;

    const entities: Entity[] = [];
    const foods: Food[] = [];
    let foodBuffer = 0;
    const deathAnimations: [Positioned, number][] = [];

    const rand = (x: number, y: number): number => {
      return Math.random() * Math.abs(x - y) + Math.min(x, y);
    };

    const getDistance = (posA: Positioned, posB: Positioned): number =>
      ((posB.x - posA.x) ** 2 + (posB.y - posA.y) ** 2) ** 0.5;

    const spawnEntity = (
      x: number = rand(entityRadius, offCanvas.width - entityRadius),
      y: number = rand(entityRadius, offCanvas.height - entityRadius),
      direction: number = rand(-Math.PI, Math.PI),
      energy: number = 1,
      speed: number = 1 + rand(-1 / speedFlucuation, 1 / speedFlucuation),
      size: number = 1,
      sense: number = initialSense *
        (1 + rand(-1 / senseFlucuation, 1 / senseFlucuation)),
      target: null = null
    ): number =>
      entities.push({
        x,
        y,
        direction,
        energy,
        speed: Math.max(0.5, Math.min(2, speed)),
        size: Math.max(0.5, Math.min(2, size)),
        sense: Math.max(0.5, Math.min(2, sense)),
        target,
      });

    for (let i = 0; i < initialPopulation; i++) spawnEntity();

    for (let i = 0; i < initialFoods; i++) {
      foods.push({
        x: rand(foodRadius, offCanvas.width - foodRadius),
        y: rand(foodRadius, offCanvas.height - foodRadius),
      });
    }

    const update = () => {
      if ((foodBuffer += foodRate) >= 1) {
        foodBuffer--;
        foods.push({
          x: rand(foodRadius, offCanvas.width - foodRadius),
          y: rand(foodRadius, offCanvas.height - foodRadius),
        });
      }
      let birth = 0;
      let death = 0;
      for (let i = 0; i < entities.length; i++) {
        const entity = entities[i];
        if (entity.size > 2) entity.size = 2;
        else if (entity.size < 2) entity.size += 0.001;
        entity.x += Math.cos(entity.direction) * entity.speed;
        entity.y += Math.sin(entity.direction) * entity.speed;
        if (
          entity.x < entityRadius ||
          entity.x > offCanvas.width - entityRadius
        ) {
          entity.direction = Math.PI - entity.direction;
        } else if (
          entity.y < entityRadius ||
          entity.y > offCanvas.height - entityRadius
        ) {
          entity.direction = 2 * Math.PI - entity.direction;
        } else {
          if (entity.target && !foods.includes(entity.target))
            entity.target = null;
          if (entity.target) {
            entity.direction = Math.atan2(
              entity.target.y - entity.y,
              entity.target.x - entity.x
            );
          } else {
            entity.direction += rand(-1, 1) / Math.PI;
          }
        }
        for (let j = 0; j < foods.length; j++) {
          const food = foods[j];
          if (
            getDistance(entity, food) <=
            entityRadius * entity.size + foodRadius
          ) {
            entity.energy++;
            foods.splice(j, 1);
            j--;
          }
        }

        if (!entity.target) {
          let closestDistance: number = Number.MAX_VALUE;
          let closestFood: Food | null = null;
          for (let j = 0; j < foods.length; j++) {
            const food = foods[j];
            const distance = getDistance(entity, food);
            const lowerBound = entityRadius * entity.size + foodRadius;
            const upperBound =
              lowerBound + entity.sense * entityRadius * entity.size;
            if (
              distance > lowerBound &&
              distance <= upperBound &&
              distance < closestDistance
            ) {
              closestDistance = distance;
              closestFood = food;
            }
          }
          if (closestFood) entity.target = closestFood;
        }
        if (entity.energy > bornThreshold) {
          birth++;
          entity.energy -= bornConsumption;
          spawnEntity(
            entity.x,
            entity.y,
            undefined,
            1,
            entity.speed *
              (1 + rand(-1 / speedFlucuation, 1 / speedFlucuation)),
            0.1,
            entity.sense * (1 + rand(-1 / senseFlucuation, 1 / senseFlucuation))
          );
        }
        entity.energy -=
          energyRate * (entity.size ** 3 * entity.speed ** 2 + entity.sense);
        if (entity.energy < 0) {
          death++;
          deathAnimations.push([entities[i], 0]);
          entities.splice(i, 1);
          i--;
        }
      }
      onIteration();
      onPopulationChange(entities.length);
      onFoodChange(foods.length);
      onBirthChange(birth);
      onDeathChange(death);
      onSpeedChange(
        entities.length
          ? entities.reduce((a, v) => a + v.speed, 0) / entities.length
          : 0
      );
      onMinSpeedChange(
        entities.length >= 2
          ? entities
              .map((v) => v.speed)
              .sort((a, b) => a - b)
              .filter((_, i, a) => i < Math.floor(a.length / 2))
              .reduce((a, v) => a + v, 0) /
              (entities.length / 2)
          : 0
      );
      onMaxSpeedChange(
        entities.length
          ? entities
              .map((v) => v.speed)
              .sort((a, b) => b - a)
              .filter((_, i, a) => i < Math.floor(a.length / 2))
              .reduce((a, v) => a + v, 0) /
              (entities.length / 2)
          : 0
      );
      onSizeChange(
        entities.length
          ? entities.reduce((a, v) => a + v.size, 0) / entities.length
          : 0
      );
      onMinSizeChange(
        entities.length >= 2
          ? entities
              .map((v) => v.size)
              .sort((a, b) => a - b)
              .filter((_, i, a) => i < Math.floor(a.length / 2))
              .reduce((a, v) => a + v, 0) /
              (entities.length / 2)
          : 0
      );
      onMaxSizeChange(
        entities.length
          ? entities
              .map((v) => v.size)
              .sort((a, b) => b - a)
              .filter((_, i, a) => i < Math.floor(a.length / 2))
              .reduce((a, v) => a + v, 0) /
              (entities.length / 2)
          : 0
      );
      onSenseChange(
        entities.length
          ? entities.reduce((a, v) => a + v.sense, 0) / entities.length
          : 0
      );
      onMinSenseChange(
        entities.length >= 2
          ? entities
              .map((v) => v.sense)
              .sort((a, b) => a - b)
              .filter((_, i, a) => i < Math.floor(a.length / 2))
              .reduce((a, v) => a + v, 0) /
              (entities.length / 2)
          : 0
      );
      onMaxSenseChange(
        entities.length
          ? entities
              .map((v) => v.sense)
              .sort((a, b) => b - a)
              .filter((_, i, a) => i < Math.floor(a.length / 2))
              .reduce((a, v) => a + v, 0) /
              (entities.length / 2)
          : 0
      );
    };

    const render = () => {
      offContext.clearRect(0, 0, offCanvas.width, offCanvas.height);
      foods.forEach((food) => {
        offContext.beginPath();
        offContext.arc(food.x, food.y, foodRadius, 0, 2 * Math.PI);
        offContext.fillStyle = "rgba(255, 255, 255, 1)";
        offContext.fill();
      });
      entities.forEach((entity) => {
        offContext.beginPath();
        offContext.arc(
          entity.x,
          entity.y,
          entityRadius * entity.size,
          0,
          2 * Math.PI
        );
        offContext.fillStyle = colorToString(
          getColorBetween(
            { r: 0, g: 255, b: 0, a: 1 },
            { r: 255, g: 0, b: 0, a: 1 },
            1 - Math.max(0, Math.min(1, entity.energy))
          )
        );
        offContext.fill();
      });

      for (let i = 0; i < deathAnimations.length; i++) {
        offContext.beginPath();
        offContext.arc(
          deathAnimations[i][0].x,
          deathAnimations[i][0].y,
          deathAnimations[i][1] * 10,
          0,
          2 * Math.PI
        );
        offContext.strokeStyle = "rgba(255, 255, 255, 1)";
        offContext.stroke();
        deathAnimations[i][1]++;
        if (deathAnimations[i][1] > 10) {
          deathAnimations.splice(i, 1);
          i--;
        }
      }
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(offCanvas, 0, 0);
    };

    const intervalId = setInterval(() => {
      update();
      render();
    }, 1);

    return () => clearInterval(intervalId);
  }, [
    bornConsumption,
    bornThreshold,
    energyRate,
    foodRate,
    initialFoods,
    initialPopulation,
    initialSense,
    onBirthChange,
    onDeathChange,
    onFoodChange,
    onIteration,
    onMaxSenseChange,
    onMaxSizeChange,
    onMaxSpeedChange,
    onMinSenseChange,
    onMinSizeChange,
    onMinSpeedChange,
    onPopulationChange,
    onSenseChange,
    onSizeChange,
    onSpeedChange,
    senseFlucuation,
    speedFlucuation,
  ]);

  return (
    <canvas
      ref={canvasRef}
      width={750}
      height={500}
      className="bg-black rounded-2xl shadow-2xl"
    />
  );
};

export default SimulationCanvas;
