import { Jacket, Outfit } from "utils/types";

// What Home shows for today's jacket.
// `temperature` is undefined when the weather didn't load.
export const jacketState = (
  jackets: Jacket[],
  temperature: number | undefined,
  chosen: Outfit["jacket"]
) => {
  const suitable =
    temperature === undefined
      ? []
      : jackets.filter(({ maxTemperature }) => maxTemperature >= temperature);
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
    // Only prompt when the weather says more than one jacket suits
    needsChoice: chosen == null && suitable.length > 1,
  };
};
