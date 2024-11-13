---
title: 特性检测
lang: zh-CN
---

如下所示，utils库包含一些常量和方法，用于检测某些Web特性。以is开头的都是函数，其他为常量，如果是函数则表明该特性可能可以polyfill，所以改为函数延迟执行。当然未来可能考虑更改，有些特性polyfill意义不大

```ts
import { isSupportElementInternals, supportCSSAutoHeightTransition } from '@lun-web/utils';
```

当前浏览器的检测结果为：
- `isSupportElementInternals()`: {{ isSupportElementInternals() }}
- `supportCSSAutoHeightTransition`: {{ supportCSSAutoHeightTransition }}

## 通用

- `inBrowser`: 是否在浏览器环境中
- `supportClipboard`: 是否支持Clipboard API
- `supportDocumentPictureInPicture`: 是否支持Document Picture-in-Picture API
- `isSupportFileSystemAccess`: 是否支持FileSystem Access API

## HTML

- `supportDialog`: 是否支持Dialog
- `supportPopover`: 是否支持Popover API
- `isInputSupportPicker`: input元素是否支持showPicker
- `isSupportPlaintextEditable`: contenteditable是否支持plaintext-only
- `isSupportCheckVisibility`: 是否支持checkVisibility
- `isSupportInert`: 是否支持inert
- `isSupportSlotAssign`: slot元素是否支持手动assign

## 事件

- `supportTouch`: 是否支持Touch事件
- `isSupportScrollEnd`: 是否支持scrollEnd事件

## CSS

- `supportCSSAnchor`: 是否支持Anchor Positioning
- `supportCSSAutoHeightTransition`: 是否支持Auto Height Transition
- `supportCSSContentVisibility`: 是否支持content-visibility
- `supportCSSDisplayP3`: 是否支持Display P3 Color
- `supportCSSOklch`: 是否支持Oklch Color
- `supportCSSHighLight`: 是否支持Highlight
- `supportCSSLayer`: 是否支持@layer
- `supportCSSSubgrid`: 是否支持Subgrid

## 媒体监测

- `isPreferDark`: 用户是否偏向暗色主题

<script setup>
import { isSupportElementInternals, supportCSSAutoHeightTransition } from '@lun-web/utils';
</script>