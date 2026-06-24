'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import ConsoleEgg from '@/components/ConsoleEgg'
import CustomCursor from '@/components/CustomCursor'
import MouseGlow from '@/components/MouseGlow'
import Particles from '@/components/Particles'

/* ── types ───────────────────────────────── */

interface SectionMeta { id: string; title: string }
interface ChapterMeta {
  id: string
  label: string
  title: string
  pending?: boolean
  sections: SectionMeta[]
}

/* ── data ────────────────────────────────── */

const chapters: ChapterMeta[] = [
  {
    id: 'wsl2-setup', label: '第一章', title: 'WSL2 & Ubuntu 开发环境搭建',
    sections: [
      { id: 'wsl2-intro',    title: 'WSL2 是什么、为什么用' },
      { id: 'wsl2-install',  title: 'WSL2 安装' },
      { id: 'ubuntu-config', title: 'Ubuntu 基础配置' },
      { id: 'filesystem',    title: '文件系统互通' },
      { id: 'dev-tools',     title: '开发工具链安装' },
      { id: 'wsl2-issues',   title: '常见问题 & 踩坑' },
    ],
  },
  { id: 'commands',    label: '第二章', title: '常用命令速查',              pending: true, sections: [] },
  { id: 'shell',       label: '第三章', title: 'Shell 脚本与自动化',          pending: true, sections: [] },
  { id: 'terminal',    label: '第四章', title: '终端工具链配置',              pending: true, sections: [] },
  { id: 'ssh',         label: '第五章', title: 'SSH 远程开发与服务器运维',     pending: true, sections: [] },
  { id: 'monitoring',  label: '第六章', title: '性能监控与调优',              pending: true, sections: [] },
  { id: 'docker',      label: '第七章', title: 'Docker 基础与实践',          pending: true, sections: [] },
]

const allSectionIds = chapters.flatMap(ch => ch.sections.map(s => s.id))

/* ── helper components ───────────────────── */

function H2({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-xl font-bold text-white mt-12 mb-4 scroll-mt-28 pb-2 border-b border-slate-800">
      {children}
    </h2>
  )
}
function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-semibold text-slate-200 mt-6 mb-2">{children}</h3>
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-slate-400 text-[0.9375rem] leading-relaxed mb-3">{children}</p>
}
function Pre({ code }: { code: string }) {
  return (
    <pre className="bg-slate-800/80 border border-slate-700/60 rounded-lg p-4 overflow-x-auto text-sm font-mono text-slate-300 leading-relaxed my-4">
      <code>{code}</code>
    </pre>
  )
}
function C({ children }: { children: React.ReactNode }) {
  return <code className="px-1.5 py-0.5 rounded bg-slate-800 text-blue-300 text-[0.85em] font-mono">{children}</code>
}
function NB({ children }: { children: React.ReactNode }) {
  return <div className="bg-blue-950/40 border border-blue-800/40 rounded-lg px-4 py-3 my-4 text-sm text-blue-300 leading-relaxed">💡 {children}</div>
}
function Warn({ children }: { children: React.ReactNode }) {
  return <div className="bg-yellow-950/30 border border-yellow-700/30 rounded-lg px-4 py-3 my-4 text-sm text-yellow-300 leading-relaxed">⚠️ {children}</div>
}
function Ul({ items }: { items: React.ReactNode[] }) {
  return <ul className="list-disc list-inside text-slate-400 text-[0.9375rem] leading-relaxed space-y-1 mb-3 ml-2">{items.map((item, i) => <li key={i}>{item}</li>)}</ul>
}

/* ── accordion chapter ───────────────────── */

function ChapterShell({ chapter, expanded, onToggle, children }: {
  chapter: ChapterMeta
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="border border-slate-800 rounded-xl mb-6 overflow-hidden">
      {/* header */}
      <button
        onClick={onToggle}
        className="w-full text-left px-5 py-4 bg-slate-800/60 hover:bg-slate-800/80 transition-colors flex items-center justify-between gap-3 group"
      >
        <div>
          <span className="text-xs font-mono text-slate-500 block">{chapter.label}</span>
          <span className="text-base font-semibold text-slate-200 group-hover:text-white transition-colors">{chapter.title}</span>
        </div>
        {!chapter.pending && (
          <svg className={`w-5 h-5 text-slate-500 transition-transform duration-300 shrink-0 ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>
      {/* content */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          expanded ? 'max-h-[9999px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
        style={expanded ? {} : { maxHeight: 0 }}
      >
        <div className="px-5 pb-6">
          {children}
        </div>
      </div>
    </div>
  )
}

/* ── pending chapter stub ────────────────── */

function PendingChapter({ chapter }: { chapter: ChapterMeta }) {
  return (
    <div className="border border-slate-800 rounded-xl mb-6 overflow-hidden opacity-40">
      <div className="px-5 py-4 bg-slate-800/60">
        <span className="text-xs font-mono text-slate-500 block">{chapter.label}</span>
        <span className="text-base font-semibold text-slate-500">{chapter.title}</span>
      </div>
      <div className="px-5 pb-5">
        <p className="text-slate-600 text-sm">整理中，敬请期待…</p>
      </div>
    </div>
  )
}

/* ── sidebar ─────────────────────────────── */

function Sidebar({ activeId, onNav }: { activeId: string; onNav: (chapterId: string, sectionId?: string) => void }) {
  return (
    <aside className="hidden lg:block w-56 shrink-0">
      <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-3 scrollbar-thin">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">目录</p>
        <nav className="space-y-3">
          {chapters.map((ch) => (
            <div key={ch.id}>
              <button
                onClick={() => onNav(ch.id)}
                className={`w-full text-left px-2 py-1 rounded text-xs font-semibold transition-colors ${
                  ch.pending
                    ? 'text-slate-600 cursor-default'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <span className="font-mono text-[0.65rem] text-slate-600 mr-1.5">{ch.label}</span>
                {ch.title}
              </button>
              {ch.sections.length > 0 && (
                <div className="mt-0.5 space-y-0">
                  {ch.sections.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => onNav(ch.id, s.id)}
                      className={`w-full text-left pl-5 pr-2 py-0.5 rounded text-[0.75rem] transition-colors ${
                        activeId === s.id
                          ? 'text-blue-400 bg-blue-950/30'
                          : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40'
                      }`}
                    >
                      {s.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  )
}

/* ── main page ───────────────────────────── */

export default function NotesLinux() {
  const router = useRouter()
  const [expandedChapter, setExpandedChapter] = useState('wsl2-setup') // 默认展开第一章
  const [activeId, setActiveId] = useState('wsl2-intro')
  const contentRef = useRef<HTMLDivElement>(null)

  /* scroll tracking — highlight current section in sidebar */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
            // also expand the parent chapter if it's not already
            const chapter = chapters.find(ch => ch.sections.some(s => s.id === entry.target.id))
            if (chapter && chapter.id !== 'pending') {
              setExpandedChapter(prev => prev === chapter.id ? prev : chapter.id)
            }
            break
          }
        }
      },
      { rootMargin: '-15% 0px -75% 0px', threshold: 0 }
    )
    allSectionIds.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  const handleNav = (chapterId: string, sectionId?: string) => {
    // expand the target chapter
    setExpandedChapter(chapterId)

    // scroll to section (or chapter start)
    const targetId = sectionId || chapters.find(c => c.id === chapterId)?.sections[0]?.id
    if (targetId) {
      // brief delay to let the accordion expand first
      setTimeout(() => {
        document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
      setActiveId(targetId)
    }
  }

  const toggleChapter = (chapterId: string) => {
    setExpandedChapter(prev => prev === chapterId ? '' : chapterId)
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <ConsoleEgg />
      <CustomCursor />
      <MouseGlow />
      <Particles />

      {/* header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <a
            href="/#notes"
            onClick={(e) => { e.preventDefault(); router.back() }}
            className="text-slate-400 hover:text-blue-400 text-sm font-medium transition-colors cursor-pointer"
          >
            ← 返回首页
          </a>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300 text-sm font-medium">Linux 笔记</span>
        </div>
      </header>

      {/* body: sidebar + content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex gap-10 items-start">
          <Sidebar activeId={activeId} onNav={handleNav} />

          {/* content */}
          <div ref={contentRef} className="flex-1 min-w-0">
            {/* page header */}
            <div className="mb-8">
              <p className="text-blue-400 font-mono text-xs mb-1">// notes / linux</p>
              <h1 className="text-3xl font-bold text-white mb-3">Linux 笔记</h1>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                记录 Linux 开发环境配置、日常使用技巧与服务器运维经验。以实用为导向，覆盖 WSL2、Shell 脚本、性能监控等方向。
              </p>
            </div>

            {/* ══ 第一章：WSL2 ═══════════════════ */}
            <ChapterShell
              chapter={chapters[0]}
              expanded={expandedChapter === 'wsl2-setup'}
              onToggle={() => toggleChapter('wsl2-setup')}
            >
              <H2 id="wsl2-intro">1. WSL2 是什么、为什么用</H2>
              <P>WSL2（Windows Subsystem for Linux 2）是 Windows 内置的 Linux 虚拟化方案，相比虚拟机更轻量，文件系统互通，能直接跑 Linux 二进制程序。</P>
              <P>对我而言最实用的几点：</P>
              <Ul items={[
                <><C>/mnt/c/</C> 挂载 C 盘，Linux 和 Windows 文件系统直接互通</>,
                '能跑 Docker，不需要 Docker Desktop 的额外开销',
                'VSCode 的 WSL 远程插件体验接近原生',
                '比完整虚拟机省内存，启动秒级',
              ]} />
              <Warn>如果机器是 Windows 10 且版本较老（19041 之前），建议先升级。WSL2 对内核版本有要求，老版本装起来很折腾。</Warn>

              <H2 id="wsl2-install">2. WSL2 安装（PowerShell 一行搞定）</H2>
              <P>以管理员身份打开 PowerShell，执行：</P>
              <Pre code={`wsl --install`} />
              <P>这条命令会自动完成：启用 WSL 可选功能、安装 WSL2 内核、设为默认版本、安装 Ubuntu 作为默认发行版。</P>
              <P>安装完成后重启电脑，首次进入 Ubuntu 会要求设置用户名和密码（输入密码时终端不显示字符，正常的）。重启后在开始菜单找 "Ubuntu" 或在 PowerShell 里输入 <C>wsl</C> 进入。</P>
              <NB>如果提示"无法解析服务器地址"或卡在下载，大概率是网络问题。可从 <a href="https://learn.microsoft.com/windows/wsl/install-manual" target="_blank" rel="noopener" className="text-blue-400 hover:underline">Microsoft 官方文档</a> 手动下载离线包安装。</NB>

              <H2 id="ubuntu-config">3. Ubuntu 基础配置</H2>
              <H3>3.1 换国内源（apt 加速）</H3>
              <P>Ubuntu 默认源在国外，<C>apt update</C> 经常超时。换成清华源：</P>
              <Pre code={`# 备份原文件
sudo cp /etc/apt/sources.list /etc/apt/sources.list.bak

# 替换为清华源（Ubuntu 22.04 / jammy）
sudo sed -i "s@http://.*archive.ubuntu.com@https://mirrors.tuna.tsinghua.edu.cn@g" /etc/apt/sources.list
sudo sed -i "s@http://.*security.ubuntu.com@https://mirrors.tuna.tsinghua.edu.cn@g" /etc/apt/sources.list

# 更新索引
sudo apt update && sudo apt upgrade -y`} />
              <P>Ubuntu 24.04（Noble）的 sources.list 格式变了（DEB822），直接编辑 <C>/etc/apt/sources.list.d/ubuntu.sources</C> 改 URL。</P>
              <H3>3.2 安装基础工具包</H3>
              <Pre code={`sudo apt install -y \\
  build-essential \\
  curl wget git \\
  vim tmux \\
  htop tree \\
  net-tools iproute2 \\
  software-properties-common \\
  ca-certificates gnupg lsb-release`} />
              <P>这几个包覆盖了 90% 的日常需求：编译工具链、下载、Git、编辑器、进程监控、网络诊断。</P>
              <H3>3.3 配置 Git</H3>
              <Pre code={`git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
git config --global core.editor "vim"
git config --global pull.rebase false`} />

              <H2 id="filesystem">4. Windows 与 WSL 文件系统互通</H2>
              <H3>4.1 从 WSL 访问 Windows 文件</H3>
              <P>Windows 各盘符自动挂载在 <C>/mnt/</C> 下：</P>
              <Pre code={`cd /mnt/c/Users/你的用户名/
code /mnt/c/Users/你/Desktop/test.py`} />
              <H3>4.2 从 Windows 访问 WSL 文件</H3>
              <P>在文件资源管理器地址栏输入 <C>\\wsl$\Ubuntu\home\用户名\</C>，或在 WSL 里输入 <C>explorer.exe .</C> 直接打开当前目录。</P>
              <H3>4.3 坑：跨文件系统性能差异</H3>
              <P>在 <C>/mnt/c/</C> 下跑 Linux 工具（<C>pip install</C>、<C>npm install</C>）会比 WSL 原生文件系统慢 5-10 倍。</P>
              <NB>最佳实践：开发项目放在 <C>~/projects/</C>（WSL 原生），不要用 Windows 文件系统跑 Linux 工具链。VSCode 用 Remote WSL 插件打开项目，不要直接打开 <C>\\wsl$\...</C> 路径。</NB>

              <H2 id="dev-tools">5. 开发工具链安装</H2>
              <H3>5.1 Python 环境（pyenv + venv）</H3>
              <Pre code={`# 安装 pyenv 编译依赖
sudo apt install -y make build-essential libssl-dev zlib1g-dev \\
  libbz2-dev libreadline-dev libsqlite3-dev \\
  libncursesw5-dev xz-utils tk-dev libffi-dev liblzma-dev

# 安装 pyenv
curl https://pyenv.run | bash

# 添加到 ~/.bashrc（按提示加这三行）
export PYENV_ROOT="$HOME/.pyenv"
export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init -)"

source ~/.bashrc

# 安装 Python
pyenv install 3.11.8
pyenv global 3.11.8`} />
              <H3>5.2 VSCode + WSL 远程开发</H3>
              <P>在 Windows 侧 VSCode 安装 <C>WSL</C> 扩展，然后在 WSL 终端里输入 <C>code .</C>，VSCode 会自动连接 WSL 环境。左下角显示 "WSL: Ubuntu" 即连接成功，终端/解释器/linter 全部在 WSL 里跑。</P>
              <H3>5.3 Docker in WSL2（不装 Docker Desktop）</H3>
              <Pre code={`# 清理旧版本（避免冲突）
sudo apt remove docker docker.io containerd runc 2>/dev/null

# 安装
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 免 sudo
sudo usermod -aG docker $USER
# 重新登录后生效

# 验证
docker run hello-world`} />

              <H2 id="wsl2-issues">6. 常见问题 & 踩坑记录</H2>
              <H3>WSL2 占用内存过高</H3>
              <P>WSL2 默认会吃满宿主机内存。在 <C>%USERPROFILE%\.wslconfig</C>（Windows 侧）限制：</P>
              <Pre code={`[wsl2]
memory=8GB
swap=4GB
localhostForwarding=true`} />
              <P>修改后执行 <C>wsl --shutdown</C> 重启生效。</P>
              <H3>apt update 时 GPG 密钥错误</H3>
              <P>现代 Ubuntu（22.04+）正确处理方式——不要用已废弃的 <C>apt-key</C>：</P>
              <Pre code={`curl -fsSL https://example.com/KEY.gpg | sudo gpg --dearmor -o /etc/apt/keyrings/example.gpg
echo "deb [signed-by=/etc/apt/keyrings/example.gpg] https://example.com/ stable main" \\
  | sudo tee /etc/apt/sources.list.d/example.list`} />
              <H3>WSL IP 每次重启后变化</H3>
              <P>WSL2 是 NAT 网络，IP 会变。访问 WSL 里的服务直接用 <C>localhost</C>，WSL2 会自动端口转发。如果转发失效，确认 <C>.wslconfig</C> 里有 <C>localhostForwarding=true</C>。</P>
            </ChapterShell>

            {/* ══ 待整理章节 ══ */}
            {chapters.slice(1).map(ch => (
              <PendingChapter key={ch.id} chapter={ch} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
