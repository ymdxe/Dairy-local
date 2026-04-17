import dayjs from 'dayjs'
import { NavLink, Outlet, useLocation } from 'react-router-dom'

import { APP_TITLE } from '../../constants'
import { cn } from '../../lib/utils'
import { useAppStore } from '../../store/useAppStore'
import { Panel } from '../ui/Panel'
import { StatusBadge } from '../ui/StatusBadge'

const navigationItems = [
  { to: '/', label: '首页' },
  { to: '/entries', label: '日记' },
  { to: '/review', label: '回顾' },
  { to: '/settings', label: '设置' },
]

export function AppShell() {
  const location = useLocation()
  const aiStatus = useAppStore((state) => state.aiStatus)

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--surface)] text-slate-800">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.85),_transparent_35%),radial-gradient(circle_at_80%_10%,_rgba(196,221,208,0.45),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(207,221,234,0.35),_transparent_30%)]" />
      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-[2.5rem] border border-white/60 bg-white/65 px-6 py-6 shadow-[0_28px_70px_-40px_rgba(15,23,42,0.45)] backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Local-first diary</p>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{APP_TITLE}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
                  给自己留一块安静的位置，记下心情、天气、收获和明天真正重要的一件事。
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start gap-3 lg:items-end">
              <nav className="flex flex-wrap gap-2">
                {navigationItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      cn(
                        'rounded-full px-4 py-2 text-sm transition',
                        isActive ? 'bg-slate-900 text-white' : 'bg-white/80 text-slate-600 hover:bg-white',
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <span>{dayjs().format('YYYY 年 M 月 D 日 dddd')}</span>
                <StatusBadge
                  label={
                    aiStatus === 'available'
                      ? 'AI 已连接'
                      : aiStatus === 'checking'
                        ? 'AI 检测中'
                        : aiStatus === 'disabled'
                          ? 'AI 已关闭'
                          : 'AI 未启用'
                  }
                  tone={aiStatus === 'available' ? 'success' : aiStatus === 'checking' ? 'warning' : 'neutral'}
                />
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_18rem]">
          <main className="min-w-0">
            <Outlet />
          </main>

          <aside className="space-y-4 xl:sticky xl:top-8 xl:self-start">
            <Panel className="space-y-3">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">此刻提醒</p>
              <p className="text-lg font-semibold text-slate-900">
                {location.pathname === '/review' ? '把趋势看清，再把节奏放慢。' : '写下真实感受，比写得漂亮更重要。'}
              </p>
              <p className="text-sm leading-7 text-slate-500">
                这是属于你自己的空间。没有绩效压力，也不需要完美表达，只要持续留下一点真实就很好。
              </p>
            </Panel>

            <Panel className="space-y-3">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">使用提示</p>
              <ul className="space-y-2 text-sm leading-7 text-slate-500">
                <li>• 所有内容优先保存在浏览器本地。</li>
                <li>• AI 分析仅在你手动触发时发送。</li>
                <li>• 导出 JSON 后可随时重新导入恢复。</li>
              </ul>
            </Panel>
          </aside>
        </div>
      </div>
    </div>
  )
}
