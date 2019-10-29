/**
 * 根据线宽生成箭头
 * @param {number} lineWidth 
 */
export const generateArrow = (lineWidth) => {
  let width = (lineWidth * 4) / 3;
  const halfHeight = (lineWidth * 4) / 3;
  const radius = lineWidth * 4;
  return [
    ['M', lineWidth / 2, 0],
    ['L', -width * 1.5, -width * 1.5],
    ['L', -width * 1.5, width * 1.5],
    // ['A', radius, radius, 0, 0, 1, -width / 2, halfHeight],
    ['Z']
  ];
}