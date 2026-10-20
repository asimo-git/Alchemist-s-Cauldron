import { changeByPercent, getTotal, hasAllIngridients } from '../utils/helpers';
import type { IReaction } from '../utils/types';

export const REACTIONS: IReaction[] = [
  // ---- Ingredients ----
  {
    id: 'bubbling',
    name: 'Bubbling',
    difficulty: 'medium',
    isActive: (index) => hasAllIngridients(index, ['fairy-dust', 'caustic-acid']),
    apply: (v) => ({ ...v, magicPower: changeByPercent(v.magicPower, 50) }),
    sideEffects: { timeDelta: -10 },
  },
  {
    id: 'volatile-mix',
    name: 'Volatile Mix',
    difficulty: 'medium',
    isActive: (index) => hasAllIngridients(index, ['phoenix-feather', 'essence-of-the-void']),
    apply: (v) => v,
    sideEffects: { lives: -1, clearCauldron: true },
  },
  {
    id: 'solar-frost',
    name: 'Solar Frost',
    difficulty: 'medium',
    isActive: (index) => hasAllIngridients(index, ['dragon-tears', 'frost-lotus']),
    apply: (v) => ({ ...v, temperature: 0, density: changeByPercent(v.density, 20) }),
  },
  {
    id: 'rooted-steam',
    name: 'Rooted Steam',
    difficulty: 'medium',
    isActive: (index) => hasAllIngridients(index, ['mandrake-root', 'toad-slime']),
    apply: (v) => ({
      ...v,
      density: changeByPercent(v.density, 25),
      magicPower: changeByPercent(v.magicPower, -10),
    }),
  },
  {
    id: 'ashen-bloom',
    name: 'Ashen Bloom',
    difficulty: 'medium',
    isActive: (index) => hasAllIngridients(index, ['phoenix-feather', 'fairy-dust']),
    apply: (v) => ({
      ...v,
      temperature: v.temperature + 10,
      magicPower: changeByPercent(v.magicPower, 25),
    }),
  },

  // ---- Stats ----
  {
    id: 'annihilation',
    name: 'Annihilation',
    difficulty: 'medium',
    isActive: (index) =>
      index.some((item) => item.temperature > 15) && index.some((item) => item.temperature < -15),
    apply: (v) => ({ ...v, temperature: 0, density: v.density * 2 }),
  },
  {
    id: 'pressure-spike',
    name: 'Pressure Spike',
    difficulty: 'medium',
    isActive: (index) => getTotal(index, 'density') >= 70,
    apply: (v) => ({ ...v, density: 70, magicPower: changeByPercent(v.magicPower, 10) }),
  },
  {
    id: 'magma-flux',
    name: 'Magma Flux',
    difficulty: 'medium',
    isActive: (index) => getTotal(index, 'temperature') >= 60,
    apply: (v) => ({
      ...v,
      magicPower: changeByPercent(v.magicPower, 20),
      density: changeByPercent(v.density, -10),
    }),
  },
  {
    id: 'deep-freeze',
    name: 'Deep Freeze',
    difficulty: 'medium',
    isActive: (index) => getTotal(index, 'temperature') <= -20,
    apply: (v) => ({
      ...v,
      density: changeByPercent(v.density, 15),
      magicPower: changeByPercent(v.magicPower, -15),
    }),
  },
  {
    id: 'arcane-saturation',
    name: 'Arcane Saturation',
    difficulty: 'medium',
    isActive: (index) => getTotal(index, 'magicPower') >= 80,
    apply: (v) => ({ ...v, magicPower: 80, temperature: v.temperature + 5 }),
  },

  // ---- Mix ----
  {
    id: 'steam-burst',
    name: 'Steam Burst',
    difficulty: 'hard',
    isActive: (index) =>
      hasAllIngridients(index, ['dragon-tears', 'caustic-acid']) &&
      getTotal(index, 'temperature') >= 35,
    apply: (v) => ({ ...v, temperature: v.temperature + 10 }),
    sideEffects: { timeDelta: -5 },
  },
  {
    id: 'black-ice',
    name: 'Black Ice',
    difficulty: 'hard',
    isActive: (index) =>
      hasAllIngridients(index, ['frost-lotus', 'essence-of-the-void']) &&
      getTotal(index, 'density') <= 0,
    apply: (v) => ({
      ...v,
      temperature: v.temperature - 10,
      magicPower: changeByPercent(v.magicPower, 20),
    }),
  },
  {
    id: 'heavy-spark',
    name: 'Heavy Spark',
    difficulty: 'hard',
    isActive: (index) =>
      hasAllIngridients(index, ['fairy-dust', 'toad-slime']) && getTotal(index, 'density') >= 40,
    apply: (v) => ({
      ...v,
      density: changeByPercent(v.density, 20),
      magicPower: changeByPercent(v.magicPower, 10),
    }),
  },
  {
    id: 'burning-root',
    name: 'Burning Root',
    difficulty: 'hard',
    isActive: (index) =>
      hasAllIngridients(index, ['mandrake-root', 'phoenix-feather']) &&
      getTotal(index, 'temperature') >= 40,
    apply: (v) => ({
      ...v,
      temperature: v.temperature + 15,
      density: changeByPercent(v.density, -10),
    }),
  },
  {
    id: 'void-resonance',
    name: 'Void Resonance',
    difficulty: 'hard',
    isActive: (index) =>
      hasAllIngridients(index, ['essence-of-the-void', 'dragon-tears']) &&
      getTotal(index, 'magicPower') >= 50,
    apply: (v) => ({
      ...v,
      magicPower: changeByPercent(v.magicPower, 30),
      temperature: v.temperature - 5,
    }),
  },
];
