// 主题切换（暗色/亮色）：令牌驱动的全局主题
// 用法：main.js 启动时 initTheme()；任意位置 toggleTheme() 切换

const THEME_KEY = 'app_theme'

export function getTheme() {
  return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'
}

export function applyTheme(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  localStorage.setItem(THEME_KEY, theme)
}

export function toggleTheme() {
  const next = getTheme() === 'dark' ? 'light' : 'dark'
  applyTheme(next)
  return next
}

export function initTheme() {
  applyTheme(getTheme())
}
