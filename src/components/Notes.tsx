const noteTopics = [
  {
    icon: '🤖',
    title: 'LLM & Agent 开发',
    desc: '覆盖 Prompt Engineering、Agent 设计模式、RAG 架构、LangChain / LangGraph 实践要点与踩坑记录。',
    tags: ['Prompt', 'RAG', 'Agent', 'LangGraph'],
    href: '/notes/agent/',
  },
  {
    icon: '🐍',
    title: 'Python 工程实践',
    desc: '包含项目结构设计、依赖管理（Poetry/uv）、异步编程、测试策略、FastAPI 开发与性能调优。',
    tags: ['FastAPI', 'asyncio', 'pytest', 'Poetry'],
    href: '/notes/python/',
  },
  {
    icon: '🐧',
    title: 'Linux 开发环境',
    desc: '整理 Ubuntu 配置、Shell 脚本、终端工具链（tmux/zsh/nvim）、SSH 与服务器运维常用操作。',
    tags: ['Ubuntu', 'Shell', 'tmux', 'nvim'],
    href: '/notes/linux/',
  },
]

import Link from 'next/link'
import TiltCard from './TiltCard'

export default function Notes() {
  return (
    <section id="notes" className="py-24 px-6 bg-slate-900/50">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12">
          <p className="text-blue-400 font-mono text-sm mb-2">{'// 04. notes'}</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">学习笔记</h2>
          <div className="w-16 h-1 bg-blue-600 rounded mt-3" />
          <p className="text-slate-400 text-sm mt-4 max-w-xl">
            持续整理技术笔记，以覆盖广度为先，逐步加深每个方向的体系化程度。
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {noteTopics.map((note) => (
            <Link key={note.title} href={note.href} className="block">
              <TiltCard max={6} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:border-slate-600 transition-colors group">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{note.icon}</span>
                  <h3 className="text-white font-semibold">{note.title}</h3>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">{note.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {note.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded bg-slate-700/60 text-slate-400 border border-slate-700 font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </TiltCard>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
