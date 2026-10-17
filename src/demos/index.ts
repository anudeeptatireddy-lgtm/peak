import type { SceneModule } from '../scenes/types';
import { DEMOS } from './defs';
import { demoModule } from './framework';

export const DEMO_IDS = Object.keys(DEMOS);
export const hasDemo = (id: string) => id in DEMOS;
export const demoFor = (id: string): SceneModule => demoModule(id, DEMOS[id]!);
export const demoSlider = (id: string) => DEMOS[id]?.slider;
