/**
 * Selection bounds type used across the application
 */
// oxlint-disable-next-line typescript/consistent-type-definitions -- serialized into eve's JsonObject, which needs a type alias's implicit index signature
export type SelectionBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};
