import { absorb } from "./absorb";
import { beads } from "./beads";
import { binary } from "./binary";
import { blink } from "./blink";
import { blob } from "./blob";
import { bloom } from "./bloom";
import { bounce } from "./bounce";
import { bubbles } from "./bubbles";
import { cage } from "./cage";
import { contour } from "./contour";
import { convection } from "./convection";
import { cube } from "./cube";
import { dial } from "./dial";
import { dolly } from "./dolly";
import { drip } from "./drip";
import { eclipse } from "./eclipse";
import { field } from "./field";
import { fireflies } from "./fireflies";
import { focus } from "./focus";
import { fractal } from "./fractal";
import { gas } from "./gas";
import { glitch } from "./glitch";
import { globe } from "./globe";
import { grow } from "./grow";
import { gyro } from "./gyro";
import { halves } from "./halves";
import { harmonic } from "./harmonic";
import { heartbeat } from "./heartbeat";
import { hourglass } from "./hourglass";
import { inside } from "./inside";
import { invert } from "./invert";
import { jelly } from "./jelly";
import { jupiter } from "./jupiter";
import { mirror } from "./mirror";
import { mitosis } from "./mitosis";
import { moire } from "./moire";
import { moons } from "./moons";
import { network } from "./network";
import { phyllotaxis } from "./phyllotaxis";
import { relax } from "./relax";
import { reveal } from "./reveal";
import { ribbon } from "./ribbon";
import { ripple } from "./ripple";
import { rubik } from "./rubik";
import { satellite } from "./satellite";
import { saturn } from "./saturn";
import { shells } from "./shells";
import { snow } from "./snow";
import { sparkle } from "./sparkle";
import { spikes } from "./spikes";
import { spin } from "./spin";
import { spiral } from "./spiral";
import { split } from "./split";
import { squeeze } from "./squeeze";
import { swarm } from "./swarm";
import { terrain } from "./terrain";
import { tessellate } from "./tessellate";
import { tick } from "./tick";
import { trace } from "./trace";
import { twist } from "./twist";
import { unwrap } from "./unwrap";
import { voxel } from "./voxel";
import { wave } from "./wave";
import { wind } from "./wind";

/** Visual modes. To add an orb: create a file in this folder and register it here. */
export const ORB_MODES = {
  globe, rubik, wave, ribbon, ripple, dial, cube,
  network, field, spiral, swarm, eclipse, saturn, moons,
  heartbeat, blob, absorb, spikes, split, twist, cage,
  hourglass, jupiter, sparkle, bloom, bounce,
  voxel, binary, trace, unwrap,
  gyro, satellite, reveal, halves, shells,
  grow, spin, drip, snow, blink,
  phyllotaxis, moire, focus, jelly,
  tick, invert, dolly, glitch, contour,
  relax, mitosis, inside, convection, gas,
  fractal, tessellate, terrain, harmonic, beads,
  mirror, bubbles, wind, fireflies, squeeze,
};

export type OrbMode = keyof typeof ORB_MODES;
