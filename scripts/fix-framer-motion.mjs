import fs from 'node:fs';
import path from 'node:path';

const targetFile = path.resolve(
  process.cwd(),
  'node_modules/framer-motion/dist/es/render/dom/scroll/utils/can-use-native-timeline.mjs'
);

if (!fs.existsSync(targetFile)) {
  fs.mkdirSync(path.dirname(targetFile), { recursive: true });
  fs.writeFileSync(
    targetFile,
    "import { supportsScrollTimeline } from 'motion-dom';\n\nfunction canUseNativeTimeline(target) {\n  return (typeof window !== 'undefined' && !target && supportsScrollTimeline());\n}\n\nexport { canUseNativeTimeline };\n",
    'utf8'
  );
  console.log('[fix-framer-motion] created missing can-use-native-timeline.mjs');
} else {
  console.log('[fix-framer-motion] file already present');
}
