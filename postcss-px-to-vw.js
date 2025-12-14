/**
 * PostCSS 插件：将 px 转换为 vw
 * 设计稿基准：1920px
 * 转换公式：vw = (px / 1920) * 100
 */

module.exports = (options = {}) => {
  const {
    viewportWidth = 1920, // 设计稿宽度，默认 1920px
    unitPrecision = 6, // 保留的小数位数
    minPixelValue = 1, // 小于等于该值的 px 不转换
    exclude = /node_modules/i, // 排除的文件
    include = null, // 包含的文件，如果设置了则只处理匹配的文件
  } = options;

  return {
    postcssPlugin: 'postcss-px-to-vw',
    Once(root, { result }) {
      // 检查文件路径是否需要排除或包含
      if (result.root?.source?.input?.from) {
        const filePath = result.root.source.input.from;
        
        // 如果设置了 include，只处理匹配的文件
        if (include && !include.test(filePath)) {
          return;
        }
        
        // 排除指定的文件
        if (exclude && exclude.test(filePath)) {
          return;
        }
      }

      // 遍历所有声明
      root.walkDecls((decl) => {
        // 跳过包含 /* no */ 或 /* NO */ 注释的值（用于跳过转换）
        if (decl.value.includes('/* no */') || decl.value.includes('/* NO */')) {
          return;
        }

        // 跳过 calc() 函数中的 px（通常需要保持 px）
        if (decl.value.includes('calc(')) {
          return;
        }

        // 匹配 px 值，包括小数和负数
        // 匹配模式：数字（可能包含小数点）后跟 px，前面可能有空格或运算符
        const pxRegex = /(-?\d+\.?\d*)px/g;
        
        decl.value = decl.value.replace(pxRegex, (match, value) => {
          const pxValue = parseFloat(value);
          
          // 小于等于 minPixelValue 的绝对值不转换
          if (Math.abs(pxValue) <= minPixelValue) {
            return match;
          }

          // 计算 vw 值
          const vwValue = ((pxValue / viewportWidth) * 100).toFixed(unitPrecision);
          
          // 移除末尾的 0，保留负数符号
          const finalValue = parseFloat(vwValue);
          return `${finalValue}vw`;
        });
      });
    },
  };
};

module.exports.postcss = true;
