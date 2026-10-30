import fs from 'fs';

// Helper to safely patch a file
function patchFile(filePath, search, replacement) {
  if (!fs.existsSync(filePath)) return false;
  let code = fs.readFileSync(filePath, 'utf8');
  if (code.includes(replacement)) return false;
  if (typeof search === 'string' ? code.includes(search) : search.test(code)) {
    code = code.replace(search, replacement);
    fs.writeFileSync(filePath, code, 'utf8');
    console.log(`[fix-deps] Patched: ${filePath}`);
    return true;
  }
  return false;
}

// 1. Clean createLucideIcon.mjs in @lucide/vue
const cleanCreateLucideIconMjs = `/**
 * @license @lucide/vue v1.61.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */

import { h } from 'vue';
import Icon from './Icon.mjs';

function createLucideIcon(iconDataOrName, iconNode = []) {
  const icon = typeof iconDataOrName === "string" ? {
    name: iconDataOrName,
    node: iconNode
  } : iconDataOrName;
  return (props = {}, context = {}) => {
    const slots = (context && context.slots) ? context.slots : {};
    return h(
      Icon,
      {
        ...props,
        icon
      },
      slots.default ? { default: slots.default } : void 0
    );
  };
}

export { createLucideIcon as default };
`;

fs.writeFileSync(
  'node_modules/@lucide/vue/dist/esm/createLucideIcon.mjs',
  cleanCreateLucideIconMjs,
  'utf8'
);
console.log('[fix-deps] Cleaned @lucide/vue createLucideIcon.mjs');

// 2. Clean Icon.mjs in @lucide/vue
const cleanIconMjs = `/**
 * @license @lucide/vue v1.61.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */

import { h } from 'vue';
import buildLucideIconNode from './shared/src/build/buildLucideIconNode.mjs';
import { hasA11yProp } from './shared/src/utils/hasA11yProp.mjs';
import { isEmptyString } from './shared/src/utils/isEmptyString.mjs';
import { toKebabCase } from './shared/src/utils/toKebabCase.mjs';
import { useLucideProps } from './context.mjs';

const Icon = (rawProps = {}, context = {}) => {
  const slots = (context && context.slots) ? context.slots : {};
  const {
    name,
    iconNode,
    "icon-node": iconNodeKebabCase,
    icon = {
      name: name && toKebabCase(name),
      node: iconNode ?? iconNodeKebabCase ?? [],
      size: 24,
      aliases: []
    },
    absoluteStrokeWidth,
    "absolute-stroke-width": absoluteStrokeWidthKebabCase,
    nonScalingStroke,
    "non-scaling-stroke": nonScalingStrokeKebabCase,
    strokeWidth,
    "stroke-width": strokeWidthKebabCase,
    size,
    width = size,
    height = size,
    color,
    ...props
  } = rawProps || {};
  const {
    size: contextSize,
    color: contextColor,
    strokeWidth: contextStrokeWidth = 2,
    absoluteStrokeWidth: contextAbsoluteStrokeWidth = false,
    nonScalingStroke: contextNonScalingStroke = false,
    class: contextClass = ""
  } = useLucideProps();
  const isAbsoluteStrokeWidth = isEmptyString(absoluteStrokeWidth) || isEmptyString(absoluteStrokeWidthKebabCase) || absoluteStrokeWidth === true || absoluteStrokeWidthKebabCase === true || contextAbsoluteStrokeWidth === true;
  const isNonScalingStroke = isEmptyString(nonScalingStroke) || isEmptyString(nonScalingStrokeKebabCase) || nonScalingStroke === true || nonScalingStrokeKebabCase === true || contextNonScalingStroke === true;
  delete props.class;
  const defaultSlot = slots.default?.();
  const [, svgAttributes, builtIconNode = []] = buildLucideIconNode(icon, {
    color: color ?? contextColor,
    width: width ?? size ?? contextSize,
    height: height ?? size ?? contextSize,
    strokeWidth: strokeWidth ?? strokeWidthKebabCase ?? contextStrokeWidth,
    absoluteStrokeWidth: isAbsoluteStrokeWidth,
    nonScalingStroke: isNonScalingStroke,
    className: contextClass,
    hasA11yProp: defaultSlot != null && defaultSlot.length > 0 || hasA11yProp(props),
    attributes: props
  });
  return h("svg", svgAttributes, [
    ...builtIconNode.map(([tag, attrs]) => h(tag, attrs)),
    ...defaultSlot ?? []
  ]);
};

export { Icon as default };
`;

fs.writeFileSync('node_modules/@lucide/vue/dist/esm/Icon.mjs', cleanIconMjs, 'utf8');
console.log('[fix-deps] Cleaned @lucide/vue Icon.mjs');

// 3. Clean createLucideIcon.js in lucide-vue-next
const cleanCreateLucideIconJs = `/**
 * @license lucide-vue-next v1.0.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */

import { h } from 'vue';
import Icon from './Icon.js';

const createLucideIcon = (iconName, iconNode) => (props = {}, context = {}) => {
  const slots = (context && context.slots) ? context.slots : {};
  const attrs = (context && context.attrs) ? context.attrs : {};
  return h(
    Icon,
    {
      ...attrs,
      ...props,
      iconNode,
      name: iconName,
    },
    slots
  );
};

export { createLucideIcon as default };
`;

if (fs.existsSync('node_modules/lucide-vue-next/dist/esm/createLucideIcon.js')) {
  fs.writeFileSync(
    'node_modules/lucide-vue-next/dist/esm/createLucideIcon.js',
    cleanCreateLucideIconJs,
    'utf8'
  );
  console.log('[fix-deps] Cleaned lucide-vue-next createLucideIcon.js');
}

// 4. Clean Icon.js in lucide-vue-next
const cleanLucideNextIconJs = String.raw`/**
 * @license lucide-vue-next v1.0.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */

import { h } from 'vue';
import { hasA11yProp } from './shared/src/utils/hasA11yProp.js';
import { isEmptyString } from './shared/src/utils/isEmptyString.js';
import { mergeClasses } from './shared/src/utils/mergeClasses.js';
import { toKebabCase } from './shared/src/utils/toKebabCase.js';
import { toPascalCase } from './shared/src/utils/toPascalCase.js';
import defaultAttributes from './defaultAttributes.js';

const Icon = (rawProps = {}, context = {}) => {
  const slots = (context && context.slots) ? context.slots : {};
  const {
    name,
    iconNode,
    absoluteStrokeWidth,
    "absolute-stroke-width": absoluteStrokeWidthKebabCase,
    strokeWidth,
    "stroke-width": strokeWidthKebabCase,
    size = defaultAttributes.width,
    color = defaultAttributes.stroke,
    ...props
  } = rawProps || {};
  return h(
    "svg",
    {
      ...defaultAttributes,
      ...props,
      width: size,
      height: size,
      stroke: color,
      "stroke-width": isEmptyString(absoluteStrokeWidth) || isEmptyString(absoluteStrokeWidthKebabCase) || absoluteStrokeWidth === true || absoluteStrokeWidthKebabCase === true ? Number(strokeWidth || strokeWidthKebabCase || defaultAttributes["stroke-width"]) * 24 / Number(size) : strokeWidth || strokeWidthKebabCase || defaultAttributes["stroke-width"],
      class: mergeClasses(
        "lucide",
        props.class,
        ...name ? ['lucide-' + toKebabCase(toPascalCase(name)) + '-icon', 'lucide-' + toKebabCase(name)] : ["lucide-icon"]
      ),
      ...!slots.default && !hasA11yProp(props) && { "aria-hidden": "true" }
    },
    [...iconNode.map((child) => h(...child)), ...slots.default ? [slots.default()] : []]
  );
};

export { Icon as default };
`;

if (fs.existsSync('node_modules/lucide-vue-next/dist/esm/Icon.js')) {
  fs.writeFileSync('node_modules/lucide-vue-next/dist/esm/Icon.js', cleanLucideNextIconJs, 'utf8');
  console.log('[fix-deps] Cleaned lucide-vue-next Icon.js');
}

// 5. Clean CommonJS bundle if present
if (fs.existsSync('node_modules/@lucide/vue/dist/cjs/lucide-vue.js')) {
  let cjs = fs.readFileSync('node_modules/@lucide/vue/dist/cjs/lucide-vue.js', 'utf8');
  cjs = cjs.replace(
    /\(props,\s*\{\s*slots\s*\}\)\s*=>\s*vue\.h\(/g,
    '(props = {}, context = {}) => { const slots = context?.slots || {}; return vue.h('
  );
  fs.writeFileSync('node_modules/@lucide/vue/dist/cjs/lucide-vue.js', cjs, 'utf8');
  console.log('[fix-deps] Cleaned @lucide/vue CJS');
}

// 6. Patch Vue 3 unmountComponent null safety guard (prevents "can't access property type, instance is null")
const runtimeCoreFiles = [
  'node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js',
  'node_modules/@vue/runtime-core/dist/runtime-core.cjs.js',
  'node_modules/@vue/runtime-core/dist/runtime-core.cjs.prod.js',
];
for (const file of runtimeCoreFiles) {
  patchFile(
    file,
    'const unmountComponent = (instance, parentSuspense, doRemove) => {',
    'const unmountComponent = (instance, parentSuspense, doRemove) => {\n    if (!instance) return;'
  );
  patchFile(
    file,
    'function formatTraceEntry({ vnode, recurseCount }) {',
    'function formatTraceEntry({ vnode, recurseCount } = {}) {\n  if (!vnode) return [];'
  );
}

// 7. Patch @vue/devtools-kit and @vue/devtools-api destructured parameters
const devtoolsFiles = [
  'node_modules/@vue/devtools-kit/dist/index.js',
  'node_modules/@vue/devtools-api/dist/vue-devtools-api.esm-browser.js',
  'node_modules/@vue/devtools-api/dist/vue-devtools-api.global.js',
];
for (const file of devtoolsFiles) {
  patchFile(file, 'async ({ instance }) =>', 'async ({ instance } = {}) =>');
  patchFile(file, '({ instance }) =>', '({ instance } = {}) =>');
  patchFile(file, '({ uid }) =>', '({ uid } = {}) =>');
  patchFile(file, 'async ({ app }) =>', 'async ({ app } = {}) =>');
  patchFile(file, '({ options, plugin }) =>', '({ options, plugin } = {}) =>');
}

// Remove sourcemaps that point to old unpatched code
const mapFiles = [
  'node_modules/@lucide/vue/dist/esm/createLucideIcon.mjs.map',
  'node_modules/@lucide/vue/dist/esm/Icon.mjs.map',
  'node_modules/lucide-vue-next/dist/esm/createLucideIcon.js.map',
  'node_modules/lucide-vue-next/dist/esm/Icon.js.map',
];
for (const m of mapFiles) {
  if (fs.existsSync(m)) fs.unlinkSync(m);
}

console.log('[fix-deps] All dependency hardening complete.');
