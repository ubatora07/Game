const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.resolve('figma json.txt'), 'utf8');
const root = JSON.parse(content);

console.log('=== ROOT FRAME ===');
console.log('Name:', root.name, 'Dimensions:', root.width, 'x', root.height, 'X/Y:', root.x, root.y);

const rootAbsX = root.absoluteRenderBounds ? root.absoluteRenderBounds.x : root.x;
const rootAbsY = root.absoluteRenderBounds ? root.absoluteRenderBounds.y : root.y;

function getRelativeBounds(node) {
  if (node.absoluteRenderBounds) {
    return {
      relX: Math.round(node.absoluteRenderBounds.x - rootAbsX),
      relY: Math.round(node.absoluteRenderBounds.y - rootAbsY),
      width: Math.round(node.absoluteRenderBounds.width),
      height: Math.round(node.absoluteRenderBounds.height)
    };
  }
  return {
    relX: node.x,
    relY: node.y,
    width: node.width,
    height: node.height
  };
}

const summary = [];

function traverse(node, depth = 0) {
  const rel = getRelativeBounds(node);
  const indent = '  '.repeat(depth);
  console.log(`${indent}- [${node.name}] (${node.type}) => relX: ${rel.relX}, relY: ${rel.relY}, w: ${rel.width}, h: ${rel.height}`);
  summary.push({
    name: node.name,
    type: node.type,
    relX: rel.relX,
    relY: rel.relY,
    width: rel.width,
    height: rel.height,
    depth
  });

  if (node.children) {
    for (const child of node.children) {
      traverse(child, depth + 1);
    }
  }
}

traverse(root);

fs.writeFileSync('figma-parsed-summary.json', JSON.stringify(summary, null, 2), 'utf8');
console.log('\nSaved full tree summary to figma-parsed-summary.json');
