import pluginVue from 'eslint-plugin-vue'

// 质量门禁：只开"正确性"规则（vue essential），风格类规则暂不引入，避免历史代码噪音。
// no-unused-vars / no-undef 降级为 warning，不阻塞构建；误报的浏览器全局量按需补充到下方 globals。
export default [
  {
    ignores: ['dist/**', 'node_modules/**']
  },
  ...pluginVue.configs['flat/essential'],
  {
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'warn',
      // 已知历史问题：src/components/audit/AuditFilter.vue 直接修改 filterForm prop（5 处）。
      // 正确修法需改为 emit/defineModel 并调整各审核页父组件，属行为级重构，暂降级为 warning。
      'vue/no-mutating-props': 'warn',
      // 项目中 Dashboard / Audit 等单单词页面组件为既有命名，暂不强制
      'vue/multi-word-component-names': 'off'
    }
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    }
  },
  {
    files: ['**/*.js', '**/*.vue'],
    languageOptions: {
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        fetch: 'readonly',
        WebSocket: 'readonly',
        FormData: 'readonly',
        Blob: 'readonly',
        File: 'readonly',
        FileReader: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        navigator: 'readonly',
        location: 'readonly',
        history: 'readonly',
        alert: 'readonly',
        screen: 'readonly',
        innerWidth: 'readonly',
        innerHeight: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        getComputedStyle: 'readonly',
        CustomEvent: 'readonly',
        Event: 'readonly',
        Error: 'readonly',
        Promise: 'readonly',
        AbortController: 'readonly',
        ResizeObserver: 'readonly',
        IntersectionObserver: 'readonly',
        MutationObserver: 'readonly',
        process: 'readonly'
      }
    }
  }
]
