import { DRIVERS, FLEET_DATA, TRAILERS } from './fleet-data';
import type { MappingsCache } from './mappings';

type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends Record<string, unknown>
    ? DeepReadonly<T[K]>
    : T[K];
};

function buildFallbackMappings(): MappingsCache {
  const drivers = DRIVERS.reduce<MappingsCache['drivers']>((acc, driver) => {
    acc[driver.name] = {
      phone: driver.phone ?? '',
      status: driver.status ?? 'Active',
    };
    return acc;
  }, {});

  const fleets = FLEET_DATA.reduce<MappingsCache['fleets']>((acc, fleet) => {
    acc[fleet.fleetNumber] = {
      rego: fleet.registration ?? fleet.fleetNumber,
      status: fleet.status ?? 'Active',
    };
    return acc;
  }, {});

  const trailers = TRAILERS.reduce<MappingsCache['trailers']>(
    (acc, trailer) => {
      acc[trailer.fleetNumber] = {
        rego: trailer.registration ?? '',
        type: trailer.type ?? '',
        status: trailer.status ?? 'Active',
        location: trailer.location ?? '',
      };
      return acc;
    },
    {}
  );

  return {
    drivers,
    fleets,
    trailers,
  };
}

const FALLBACK_MAPPINGS: DeepReadonly<MappingsCache> = Object.freeze(
  buildFallbackMappings()
);

/**
 * Returns a fresh copy of the static fallback mappings to avoid accidental mutations.
 */
export function getFallbackMappings(): MappingsCache {
  return {
    drivers: Object.fromEntries(
      Object.entries(FALLBACK_MAPPINGS.drivers).map(([key, value]) => [
        key,
        { ...value },
      ])
    ),
    fleets: Object.fromEntries(
      Object.entries(FALLBACK_MAPPINGS.fleets).map(([key, value]) => [
        key,
        { ...value },
      ])
    ),
    trailers: Object.fromEntries(
      Object.entries(FALLBACK_MAPPINGS.trailers).map(([key, value]) => [
        key,
        { ...value },
      ])
    ),
  };
}
