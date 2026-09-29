import { Jacket, Outfit } from "utils/types";

// What Home shows for today's jacket.
// `temperature` is undefined when the weather didn't load.
export const jacketState = (
  jackets: Jacket[],
  temperature: number | undefined,
  chosen: Outfit["jacket"]
) => {
  // Compared at the whole degrees shown, so "15°" and "up to 15°" agree
  const shown = temperature === undefined ? undefined : Math.round(temperature);
  const suitable =
    shown === undefined
      ? []
      : jackets.filter(({ maxTemperature }) => Number(maxTemperature) >= shown);
  const isSkipped = chosen === false;
  // Jackets that suit the weather (all of them if it didn't load), plus
  // today's pick even if the weather has since warmed up
  const base = temperature === undefined ? jackets : suitable;
  const options =
    chosen && !base.some(({ id }) => id === chosen.id)
      ? [chosen, ...base]
      : base;
  // The chosen jacket, or the only one that suits unless skipped
  const jacket =
    chosen || (!isSkipped && options.length === 1 ? options[0] : undefined);

  return {
    suitable,
    options,
    jacket,
    isSkipped,
    hasCard: Boolean(jacket || isSkipped || options.length > 1),
    // Ask whenever the weather calls for a jacket and today's outfit has no
    // decision yet: even a lone suitable jacket may clash with its colours
    needsChoice: chosen == null && suitable.length > 0,
  };
};
