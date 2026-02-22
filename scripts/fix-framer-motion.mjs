import fs from 'node:fs';
import path from 'node:path';

function ensureFile(filePath, content, label) {
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[fix-motion] created missing ${label}`);
  } else {
    console.log(`[fix-motion] ${label} already present`);
  }
}

const framerTimelineFile = path.resolve(
  process.cwd(),
  'node_modules/framer-motion/dist/es/render/dom/scroll/utils/can-use-native-timeline.mjs'
);
const motionMaskFile = path.resolve(
  process.cwd(),
  'node_modules/motion-dom/dist/es/value/types/complex/mask.mjs'
);

ensureFile(
  framerTimelineFile,
  "import { supportsScrollTimeline } from 'motion-dom';\n\nfunction canUseNativeTimeline(target) {\n  return (typeof window !== 'undefined' && !target && supportsScrollTimeline());\n}\n\nexport { canUseNativeTimeline };\n",
  'framer-motion can-use-native-timeline.mjs'
);

ensureFile(
  motionMaskFile,
  "import { complex } from './index.mjs';\n\nconst mask = {\n  ...complex,\n  getAnimatableNone: (v) => {\n    const parsed = complex.parse(v);\n    const transformer = complex.createTransformer(v);\n    return transformer(\n      parsed.map((value) =>\n        typeof value === 'number' ? 0 : typeof value === 'object' ? { ...value, alpha: 1 } : value\n      )\n    );\n  },\n};\n\nexport { mask };\n",
  'motion-dom complex/mask.mjs'
);
