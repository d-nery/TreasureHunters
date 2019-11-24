/**
 * Maps an arbitrary value from our base sizes to the actual game size.
 * @param scene The scene from which the actual game size will be taken.
 * @param v The value to be mapped.
 */
const mapCanvasValueToGameScale = (scene, v) => {
  let baseWidth = 1254;

  return (scene.sys.game.config.width * v) / baseWidth;
};

export { mapCanvasValueToGameScale };
