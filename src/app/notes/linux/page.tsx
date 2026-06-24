'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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
  {
    id: 'commands', label: '第二章', title: '常用命令速查',
    sections: [
      { id: 'cmd-file',      title: '文件与目录操作' },
      { id: 'cmd-view',      title: '文件查看与编辑' },
      { id: 'cmd-perm',      title: '权限管理' },
      { id: 'cmd-proc',      title: '进程管理' },
      { id: 'cmd-net',       title: '网络诊断' },
      { id: 'cmd-text',      title: '文本处理三剑客' },
    ],
  },
  {
    id: 'shell', label: '第三章', title: 'Shell 脚本与自动化',
    sections: [
      { id: 'shell-basics',  title: '基础语法速览' },
      { id: 'shell-ctrl',    title: '条件判断与循环' },
      { id: 'shell-func',    title: '函数与参数' },
      { id: 'shell-cases',   title: '实用脚本案例' },
      { id: 'shell-cron',    title: '定时任务 cron' },
    ],
  },
  {
    id: 'terminal', label: '第四章', title: '终端工具链配置',
    sections: [
      { id: 'term-zsh',      title: 'Zsh + Oh My Zsh 配置' },
      { id: 'term-tmux',     title: 'Tmux 会话管理' },
      { id: 'term-plugins',  title: '常用插件推荐' },
    ],
  },
  {
    id: 'ssh', label: '第五章', title: 'SSH 远程开发与服务器运维',
    sections: [
      { id: 'ssh-basics',    title: 'SSH 基础与密钥登录' },
      { id: 'ssh-config',    title: 'SSH Config 简化连接' },
      { id: 'ssh-tunnel',    title: '端口转发与隧道' },
      { id: 'ssh-vscode',    title: 'VSCode Remote SSH' },
      { id: 'ssh-transfer',  title: '文件传输与同步' },
    ],
  },
  {
    id: 'monitoring', label: '第六章', title: '性能监控与调优',
    sections: [
      { id: 'mon-cpu-mem',   title: 'CPU 与内存监控' },
      { id: 'mon-gpu',       title: 'GPU 监控 (nvidia-smi)' },
      { id: 'mon-disk',      title: '磁盘与 IO' },
      { id: 'mon-limit',     title: '资源限制' },
    ],
  },
  {
    id: 'docker', label: '第七章', title: 'Docker 基础与实践',
    sections: [
      { id: 'docker-concepts', title: '核心概念' },
      { id: 'docker-cmds',    title: '常用命令' },
      { id: 'docker-df',      title: 'Dockerfile 编写' },
      { id: 'docker-compose', title: 'Docker Compose' },
      { id: 'docker-dl',      title: '深度学习容器化实践' },
    ],
  },
]

/* ── helper components ───────────────────── */

function H2({ id, children }: { id?: string; children: React.ReactNode }) {
  return <h2 id={id} className="text-xl font-bold text-white mt-12 mb-4 scroll-mt-28 pb-2 border-b border-slate-800">{children}</h2>
}
function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-semibold text-slate-200 mt-6 mb-2">{children}</h3>
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-slate-400 text-[0.9375rem] leading-relaxed mb-3">{children}</p>
}
function Pre({ code }: { code: string }) {
  return <pre className="bg-slate-800/80 border border-slate-700/60 rounded-lg p-4 overflow-x-auto text-sm font-mono text-slate-300 leading-relaxed my-4"><code>{code}</code></pre>
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

/* ════════════════════════════════════════════
   Chapter content renderers
   ════════════════════════════════════════════ */

/* ── 第一章：WSL2 ─────────────────────────── */

function ChapterWsl2() {
  return <>
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
  </>
}

/* ── 第二章：常用命令速查 ──────────────────── */

function ChapterCommands() {
  return <>
    <H2 id="cmd-file">1. 文件与目录操作</H2>
    <H3>基础导航</H3>
    <Pre code={`pwd                  # 当前目录路径
ls -lah              # 详细列出（含隐藏文件、人类可读大小）
cd ~                 # 回 home 目录
cd -                 # 回到上一个目录
pushd /some/path     # 入栈并跳转
popd                 # 出栈并跳转`} />
    <H3>目录与文件管理</H3>
    <Pre code={`mkdir -p a/b/c       # 递归创建目录
rm -rf dir           # 递归强制删除（⚠️ 慎用）
cp -r src dst        # 递归复制
mv old new           # 移动/重命名
ln -s target link    # 创建软链接
touch file.txt       # 新建空文件 / 更新时间戳
find . -name "*.py"  # 按名搜索文件
find . -mtime -1     # 近24小时修改过的文件
fd pattern           # 更快的 find 替代（需安装 fd-find）`} />

    <H2 id="cmd-view">2. 文件查看与编辑</H2>
    <Pre code={`cat file.txt         # 全量输出
less file.log        # 分页浏览（q 退出、/搜索、n 下一处）
head -n 20 file      # 前 20 行
tail -f app.log      # 实时追踪末尾
wc -l file           # 统计行数
diff a.txt b.txt     # 对比差异
vim file             # 编辑器`} />
    <NB>日常配 <C>alias less="less -R"</C> 可以让 <C>less</C> 正确显示带颜色的日志（如 pytest 输出）。</NB>

    <H2 id="cmd-perm">3. 权限管理</H2>
    <Pre code={`chmod 755 script.sh   # rwxr-xr-x
chmod +x script.sh    # 添加执行权限
chown user:group file # 修改所有者
ls -l                 # 查看权限
umask 022             # 设置默认权限掩码`} />
    <P>权限三位一组：<C>rwx</C> = 读(4) + 写(2) + 执行(1)。<C>755</C> 即 owner 全权限、group 和 other 读+执行。常见组合：<C>644</C>（文件）、<C>755</C>（目录/脚本）、<C>600</C>（私钥）。</P>
    <Warn><C>chmod 777</C> 是"所有人都能读+写+执行"，除 <C>/tmp</C> 外几乎永远不该用。</Warn>

    <H2 id="cmd-proc">4. 进程管理</H2>
    <Pre code={`ps aux | grep python  # 查找 Python 进程
kill -9 PID           # 强制杀进程（先试 kill PID）
pkill -f "python train.py"  # 按命令行匹配杀
htop                  # 交互式进程浏览器
bg / fg               # 后台/前台任务切换
jobs                  # 列出当前 shell 的后台任务
nohup python train.py > log.txt 2>&1 &   # 后台跑，关终端不中断`} />
    <H3>jobs / bg / fg 用法</H3>
    <Pre code={`python train.py &   # 后台启动
Ctrl+Z               # 暂停当前前台任务
bg %1                # 让 job 1 在后台继续
fg %1                # 让 job 1 回到前台
disown -h %1         # 从 shell 的 job table 移除，关终端不被杀`} />
    <NB>在服务器跑长时间训练任务：优先用 <C>nohup</C> 或 <C>tmux</C>，比 <C>disown</C> 更可靠。</NB>

    <H2 id="cmd-net">5. 网络诊断</H2>
    <Pre code={`ping -c 4 google.com  # 连通性测试（发 4 个包）
curl -I https://api.example.com   # 只返回 HTTP 头
curl -X POST -H "Content-Type: application/json" -d '{"k":"v"}' url
wget -c url           # 断点续传下载
ss -tlnp              # 查看监听端口
ip addr / ifconfig    # 查看 IP 地址
ip route              # 查看路由表
nc -zv host port      # 测试端口是否通
dig example.com       # DNS 查询
lsof -i :8080         # 查看谁占用了 8080 端口`} />

    <H2 id="cmd-text">6. 文本处理三剑客</H2>
    <H3>grep — 搜索过滤</H3>
    <Pre code={`grep "error" app.log           # 基础搜索
grep -r "TODO" src/              # 递归搜索目录
grep -i "warning" log            # 忽略大小写
grep -v "DEBUG" log              # 排除匹配行
grep -A 3 "error" log            # 显示匹配行及后 3 行
grep -c "200" access.log         # 只输出匹配行数
grep -E "err(or|ing)" log        # 扩展正则`} />
    <H3>sed — 流编辑器（替换神器）</H3>
    <Pre code={`sed 's/foo/bar/' file           # 替换每行第一个 foo
sed 's/foo/bar/g' file          # 全局替换
sed -i 's/old/new/g' file       # 原地修改（⚠️ 先备份）
sed '/pattern/d' file           # 删除匹配行
sed -n '5,10p' file             # 只打印第 5-10 行
sed 's/^/PREFIX: /' file        # 每行前面加前缀`} />
    <H3>awk — 列处理</H3>
    <Pre code={`awk '{print $1, $3}' file       # 打印第 1、3 列
awk -F ':' '{print $1}' /etc/passwd  # 指定分隔符
awk '$3 > 100 {print $1}' file  # 条件过滤
awk '{sum+=$2} END {print sum}'  # 求和
awk '{count[$1]++} END {for(k in count) print k, count[k]}'  # 分组统计`} />
    <P>日常最常用的组合拳：</P>
    <Pre code={`# 查找占用最高的 5 个目录
du -sh * | sort -rh | head -5

# 统计 IP 访问次数排名
awk '{print $1}' access.log | sort | uniq -c | sort -rn | head -10

# 批量杀掉所有 python 进程
ps aux | grep python | awk '{print $2}' | xargs kill`} />
  </>
}

/* ── 第三章：Shell 脚本 ───────────────────── */

function ChapterShell() {
  return <>
    <H2 id="shell-basics">1. 基础语法速览</H2>
    <H3>Shebang 与变量</H3>
    <Pre code={`#!/bin/bash
# 上面这行告诉系统用哪个解释器

# 变量（等号两边不能有空格！）
NAME="world"
echo "Hello, $NAME"            # Hello, world
echo "Hello, ${NAME}_suffix"   # 用花括号避免歧义

# 命令替换
NOW=$(date +%Y-%m-%d)
FILES=$(ls *.txt | wc -l)
echo "Today: $NOW, .txt files: $FILES"

# 特殊变量
echo "Script: $0"
echo "Arg1: $1, Arg2: $2"
echo "All args: $@"
echo "Arg count: $#"
echo "Exit code: $?"            # 上一条命令的返回值`} />
    <H3>字符串操作</H3>
    <Pre code={`STR="hello-world.py"
echo ${STR%.py}       # hello-world  (去最短后缀)
echo ${STR##*.}       # py           (去最长前缀)
echo ${STR/-/_}       # hello_world.py (替换第一个)
echo ${STR//-/ }      # hello world.py (替换全部)
echo ${#STR}          # 15           (字符串长度)`} />
    <NB>变量一定要加引号！<C>rm -rf $DIR/</C>（若 <C>$DIR</C> 为空）= <C>rm -rf /</C>。改写成 <C>rm -rf "$DIR/"</C> 或 <C>rm -rf "${DIR:?}"</C> 安全得多。</NB>

    <H2 id="shell-ctrl">2. 条件判断与循环</H2>
    <H3>if 语句</H3>
    <Pre code={`# 文件测试
if [ -f "config.yaml" ]; then
  echo "config found"
elif [ -d "data/" ]; then
  echo "data dir exists"
else
  echo "nothing found"
fi

# 数值比较（中括号内两侧必须有空格！）
if [ "$COUNT" -gt 10 ]; then
  echo "count > 10"
fi

# 字符串比较
if [ "$MODE" = "train" ]; then
  echo "training mode"
fi

# 命令成败判断
if command -v python3 &> /dev/null; then
  echo "python3 available"
fi`} />
    <H3>for / while 循环</H3>
    <Pre code={`# 遍历列表
for seed in 42 123 456; do
  echo "Running with seed $seed"
  python train.py --seed "$seed"
done

# 遍历文件
for config in configs/*.yaml; do
  echo "Processing $config"
  python run.py --config "$config"
done

# while 循环（逐行读文件）
while IFS= read -r line; do
  echo "-> $line"
done < input.txt

# 无限循环 + 检测条件
while true; do
  sleep 3600
  python check_gpu.py || break
done`} />

    <H2 id="shell-func">3. 函数与参数</H2>
    <Pre code={`# 定义
log() {
  local level=$1       # local 限制作用域
  local msg=$2
  echo "[$(date '+%H:%M:%S')] [$level] $msg"
}

log "INFO" "training started"

# 返回值（只能 0-255，0=成功）
check_gpu() {
  nvidia-smi &> /dev/null
  return $?            # 返回 nvidia-smi 的退出码
}

if check_gpu; then
  echo "GPU available"
fi

# 函数输出捕获
get_gpu_count() {
  nvidia-smi -L | wc -l
}

GPU_COUNT=$(get_gpu_count)
echo "Found $GPU_COUNT GPU(s)"`} />

    <H2 id="shell-cases">4. 实用脚本案例</H2>
    <H3>案例 1：批量超参数实验</H3>
    <Pre code={`#!/bin/bash
# run_experiments.sh — 遍历学习率跑实验

LR_LIST=(1e-3 5e-4 1e-4 5e-5)
SEEDS=(42 123 456)

for lr in "${LR_LIST[@]}"; do
  for seed in "${SEEDS[@]}"; do
    echo "=== lr=$lr seed=$seed ==="
    python train.py \
      --lr "$lr" \
      --seed "$seed" \
      --output_dir "outputs/lr${lr}_s${seed}"
  done
done`} />
    <H3>案例 2：日志清理脚本</H3>
    <Pre code={`#!/bin/bash
# clean_logs.sh — 删除 N 天前的日志并报告大小

DAYS=${1:-30}                # 默认 30 天
DIR=${2:-logs}

echo "Cleaning files older than $DAYS days in $DIR..."

SIZE_BEFORE=$(du -sh "$DIR" 2>/dev/null | cut -f1)

find "$DIR" -name "*.log" -mtime +"$DAYS" -delete

SIZE_AFTER=$(du -sh "$DIR" 2>/dev/null | cut -f1)
echo "Done. $DIR: $SIZE_BEFORE → $SIZE_AFTER"`} />
    <H3>案例 3：检查 GPU 空闲后自动跑</H3>
    <Pre code={`#!/bin/bash
# wait_and_train.sh — 等待 GPU 显存低于阈值后启动训练

THRESHOLD_MB=${1:-2000}               # 默认 2GB

while true; do
  FREE=$(nvidia-smi --query-gpu=memory.free --format=csv,noheader,nounits | head -1)
  if [ "$FREE" -gt "$THRESHOLD_MB" ]; then
    echo "[$(date)] GPU free: ${FREE}MB, starting training"
    python train.py --epochs 100
    break
  fi
  echo "[$(date)] GPU free: ${FREE}MB < ${THRESHOLD_MB}MB, waiting..."
  sleep 60
done`} />

    <H2 id="shell-cron">5. 定时任务 cron</H2>
    <Pre code={`# 编辑 crontab
crontab -e

# 格式: 分 时 日 月 周 命令
# ┌────── 分钟 (0-59)
# │ ┌──── 小时 (0-23)
# │ │ ┌── 日 (1-31)
# │ │ │ ┌ 月 (1-12)
# │ │ │ │ ┌ 星期 (0-7, 0=周日)
# │ │ │ │ │
# * * * * * command

# 每天凌晨 2 点清理日志
0 2 * * * /home/user/scripts/clean_logs.sh 7

# 每小时检查一次 GPU 状态并记录
0 * * * * nvidia-smi >> /home/user/logs/gpu_$(date +%Y%m%d).log

# 每周一早上备份
0 9 * * 1 tar -czf /backup/weekly_$(date +%Y%m%d).tar.gz /data/

# 查看 cron 日志
grep CRON /var/log/syslog`} />
    <NB>cron 的环境变量非常精简，<C>$PATH</C> 通常只含 <C>/usr/bin:/bin</C>。脚本中要用绝对路径，或在脚本开头 <C>export PATH=...</C>。</NB>
  </>
}

/* ── 第四章：终端工具链 ───────────────────── */

function ChapterTerminal() {
  return <>
    <H2 id="term-zsh">1. Zsh + Oh My Zsh 配置</H2>
    <H3>安装 Zsh 并设为默认</H3>
    <Pre code={`# 安装 Zsh
sudo apt install -y zsh

# 设为默认 shell
chsh -s $(which zsh)

# 重新登录后生效。验证：
echo $SHELL  # 应输出 /usr/bin/zsh`} />
    <H3>安装 Oh My Zsh</H3>
    <Pre code={`sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"`} />
    <P>安装后在 <C>~/.zshrc</C> 里配置主题和插件：</P>
    <Pre code={`# ~/.zshrc
ZSH_THEME="robbyrussell"     # 内置主题，够用
# ZSH_THEME="agnoster"       # 需要 Powerline 字体

plugins=(git docker python z history)  # 内置插件

# 手动加载 Powerlevel10k（更美观的主题，可选）
# git clone --depth=1 https://github.com/romkatv/powerlevel10k.git \\
#   ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k
# ZSH_THEME="powerlevel10k/powerlevel10k"`} />
    <H3>常用 alias</H3>
    <Pre code={`# 加到 ~/.zshrc
alias l="ls -lah"
alias ..="cd .."
alias ...="cd ../.."
alias gs="git status"
alias gp="git pull"
alias py="python"
alias venv="python -m venv venv && source venv/bin/activate"
alias gpu="watch -n 1 nvidia-smi"
alias dcs="docker compose ps"
alias dc="docker compose"`} />

    <H2 id="term-tmux">2. Tmux 会话管理</H2>
    <H3>为什么要用 Tmux</H3>
    <Ul items={[
      'SSH 断线后训练任务不中断——重新连接后 <C>tmux attach</C> 恢复现场',
      '一个终端窗口切多个面板：左边写代码、右边跑命令、下边看日志',
      '多窗口管理：每个项目一个 tmux session，互不干扰',
    ]} />
    <H3>核心操作（默认前缀键：<C>Ctrl+b</C>）</H3>
    <Pre code={`# 会话管理
tmux new -s dev          # 新建名为 dev 的会话
tmux ls                  # 列出所有会话
tmux attach -t dev       # 连接到 dev 会话
tmux kill-session -t dev # 销毁会话

# 快捷键（按完 Ctrl+b 松开，再按下一个键）
# 面板
Ctrl+b %                 # 竖直分屏
Ctrl+b "                 # 水平分屏
Ctrl+b 方向键            # 切换到相邻面板
Ctrl+b 按住方向键不放     # 调整面板大小
Ctrl+b x                 # 关闭当前面板

# 窗口
Ctrl+b c                 # 新建窗口
Ctrl+b n / p             # 下一个/上一个窗口
Ctrl+b 数字              # 跳到指定窗口
Ctrl+b &                 # 关闭窗口

# 滚动模式
Ctrl+b [                 # 进入滚动模式（用箭头/PgUp/PgDn 翻，q 退出）`} />
    <H3>推荐 .tmux.conf</H3>
    <Pre code={`# ~/.tmux.conf
# 允许鼠标操作（滚轮翻日志、点击切换面板）
set -g mouse on

# 从 1 开始编号（不用 0）
set -g base-index 1
setw -g pane-base-index 1

# 加快按键响应
set -sg escape-time 0

# 用 Alt+方向键 快速切换面板
bind -n M-Left select-pane -L
bind -n M-Right select-pane -R

# 终端内 256 色支持
set -g default-terminal "screen-256color"`} />

    <H2 id="term-plugins">3. 常用插件推荐</H2>
    <H3>zsh-autosuggestions（命令补全建议）</H3>
    <Pre code={`git clone https://github.com/zsh-users/zsh-autosuggestions \\
  ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
# 在 ~/.zshrc 的 plugins 里加入 zsh-autosuggestions`} />
    <P>效果：输入命令时自动弹灰色建议，按 <C>→</C> 补全。长时间敲过的命令不必再翻历史。</P>
    <H3>zsh-syntax-highlighting（命令语法高亮）</H3>
    <Pre code={`git clone https://github.com/zsh-users/zsh-syntax-highlighting.git \\
  ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
# 在 ~/.zshrc 的 plugins 里加入 zsh-syntax-highlighting`} />
    <P>效果：合法命令绿色，不存在的命令红色，帮助你敲完就发现拼写错误。</P>
    <H3>fzf（模糊搜索）</H3>
    <Pre code={`sudo apt install fzf
# Ctrl+T: 模糊搜索文件名并粘贴路径
# Ctrl+R: 模糊搜索命令历史（比默认的 Ctrl+R 好用得多）
# ** + Tab: 模糊补全路径`} />
    <NB>这三个插件加起来，终端操作效率和体验提升非常明显。安装顺序：zsh → oh-my-zsh → 插件 → fzf。</NB>
  </>
}

/* ── 第五章：SSH ──────────────────────────── */

function ChapterSsh() {
  return <>
    <H2 id="ssh-basics">1. SSH 基础与密钥登录</H2>
    <H3>生成密钥对并部署</H3>
    <Pre code={`# 本机生成 ED25519 密钥（比 RSA 更快更安全）
ssh-keygen -t ed25519 -C "your_email@example.com"
# 一路回车即可，私钥: ~/.ssh/id_ed25519，公钥: ~/.ssh/id_ed25519.pub

# 把公钥复制到服务器（两种方式）
# 方式一：自动复制
ssh-copy-id user@server_ip

# 方式二：手动追加
cat ~/.ssh/id_ed25519.pub | ssh user@server_ip "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"

# 登入服务器，修改权限（必须！）
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys`} />
    <H3>安全加固（服务端）</H3>
    <Pre code={`# 编辑 /etc/ssh/sshd_config
PermitRootLogin no             # 禁止 root 直接登录
PasswordAuthentication no      # 禁用密码登录（仅用密钥）
PubkeyAuthentication yes       # 启用密钥认证
Port 2222                      # 换成非标准端口（减少扫描）

# 重启 SSH 服务
sudo systemctl restart sshd`} />
    <Warn>改端口前务必确认密钥登录正常，否则改完把自己锁在外面。</Warn>

    <H2 id="ssh-config">2. SSH Config — 简化连接</H2>
    <Pre code={`# ~/.ssh/config

Host myserver
    HostName 192.168.1.100
    User ubuntu
    Port 2222
    IdentityFile ~/.ssh/id_ed25519

Host myserver-prod
    HostName prod.example.com
    User deploy
    Port 22

Host lab-gpu-*
    User student
    IdentityFile ~/.ssh/lab_key
    StrictHostKeyChecking no     # 实验环境忽略指纹变化

# 使用：ssh myserver 代替 ssh ubuntu@192.168.1.100 -p 2222`} />
    <P>常用配置项：<C>ServerAliveInterval 60</C>（每 60s 发心跳防止断连）、<C>ForwardAgent yes</C>（转发本机 SSH Agent，跳板机场景用）。</P>

    <H2 id="ssh-tunnel">3. 端口转发与隧道</H2>
    <H3>本地端口转发（访问服务器上的服务）</H3>
    <Pre code={`# 把 remote 的 8888 端口映射到本机 8888
# 本机浏览器访问 localhost:8888 即访问远程 Jupyter
ssh -L 8888:localhost:8888 user@remote`} />
    <H3>远程端口转发（让外网访问本机服务）</H3>
    <Pre code={`# 在本地执行，把本机 3000 端口暴露到 remote 的 9000
ssh -R 9000:localhost:3000 user@remote
# 在 remote 上访问 localhost:9000 即访问本机的 3000`} />
    <H3>动态转发（SOCKS 代理）</H3>
    <Pre code={`ssh -D 1080 user@remote
# 浏览器设置 SOCKS 代理: localhost:1080
# 本机所有流量通过 remote 出去`} />
    <H3>跳板机（ProxyJump）</H3>
    <Pre code={`# 通过 jump 跳转访问 target
ssh -J user@jump_host user@target_host

# 或写在 config 里
Host target
    HostName 10.0.0.5
    User ubuntu
    ProxyJump jump_host`} />

    <H2 id="ssh-vscode">4. VSCode Remote SSH</H2>
    <P>安装 <C>Remote - SSH</C> 扩展后，VSCode 自动读取 <C>~/.ssh/config</C> 里的主机列表。点击左下角绿色按钮 → "Connect to Host..." → 选目标主机即可。</P>
    <P>首次连接会在远程安装 VSCode Server，之后所有扩展/终端/linter 都在远程机器运行，体验和本地开发几乎一样。</P>
    <NB>配合 <C>~/.ssh/config</C> 使用体验最佳。所有 Host 别名都会出现在 VSCode 的远程连接列表里。</NB>

    <H2 id="ssh-transfer">5. 文件传输与同步</H2>
    <Pre code={`# SCP：简单文件传输
scp local_file user@server:/remote/path/        # 上传
scp user@server:/remote/file ./local_dir/        # 下载
scp -r local_dir user@server:/remote/            # 递归传目录

# rsync：增量同步（推荐，比 SCP 快且支持断点续传）
rsync -avzP ./data/ user@server:/data/            # 同步本地到远程
rsync -avzP user@server:/data/ ./data/            # 同步远程到本地
# -a: 归档模式 -v: 详细 -z: 压缩 -P: 进度+断点续传
# --exclude='*.pyc' --exclude='__pycache__'        # 排除文件
# --delete                                          # 删除目标端多余文件（慎用）`} />
  </>
}

/* ── 第六章：性能监控 ─────────────────────── */

function ChapterMonitoring() {
  return <>
    <H2 id="mon-cpu-mem">1. CPU 与内存监控</H2>
    <H3>htop — 交互式进程浏览器</H3>
    <Pre code={`sudo apt install htop -y
htop
# F6 选择排序依据（CPU%、MEM%、TIME）
# F9 杀进程
# F5 切换成树状视图（看父子进程关系）`} />
    <P>对比 <C>top</C>：<C>htop</C> 彩色、可鼠标点击、可直接杀进程、横竖滚动都支持，实用性强得多。</P>
    <H3>内存概况</H3>
    <Pre code={`free -h              # 内存总量、使用量、可用量
vmstat 1 5           # 每秒刷新一次，共 5 次
# si/so 列：如果不是 0，说明在用 swap（内存不够了）`} />

    <H2 id="mon-gpu">2. GPU 监控 (nvidia-smi)</H2>
    <H3>基础查询</H3>
    <Pre code={`nvidia-smi                    # 一次性查看全部 GPU 状态
nvidia-smi -l 1               # 每秒刷新（Ctrl+C 停止）
watch -n 1 nvidia-smi         # 同上，watch 也可以
nvidia-smi -q -d MEMORY       # 只查显存详情
nvidia-smi --query-gpu=timestamp,name,temperature.gpu,utilization.gpu,memory.used,memory.total \\
  --format=csv -l 1           # 输出为 CSV 方便记录`} />
    <H3>检查 GPU 被谁占用</H3>
    <Pre code={`# 列出所有 GPU 上的进程
nvidia-smi pmon -c 1          # 每 1 秒快照

# 或直接用 fuser
fuser -v /dev/nvidia*         # 列出所有访问 GPU 的进程
ls -la /dev/nvidia*`} />
    <H3>gpustat — 更清爽的 nvidia-smi</H3>
    <Pre code={`pip install gpustat
gpustat -i 1                  # 每秒刷新，彩色显示显存使用条
gpustat -cp                   # 显示每个 GPU 上的进程（-c 彩色 -p 进程）
watch --color -n 1 gpustat --color`} />
    <P><C>gpustat</C> 输出比 <C>nvidia-smi</C> 紧凑得多，一眼看清哪些 GPU 空闲、谁在用什么。</P>

    <H2 id="mon-disk">3. 磁盘与 IO</H2>
    <Pre code={`df -h                # 各分区使用量
du -sh *             # 当前目录下各子目录大小
du -sh --max-depth=1 ~  # 家目录下一级子目录大小
ncdu                 # 交互式磁盘分析（需 apt install ncdu），比 du 直观

iostat -x 1          # 磁盘 IO 统计（需 apt install sysstat）
# %util 接近 100% = IO 瓶颈
iotop                # 类似 htop，看谁在读写磁盘（需 sudo）`} />

    <H2 id="mon-limit">4. 资源限制</H2>
    <H3>ulimit（进程级别限制）</H3>
    <Pre code={`ulimit -a              # 查看所有限制
ulimit -n 65536       # 设置最大文件描述符数（很多服务器程序需要）
ulimit -u 4096        # 最大用户进程数`} />
    <H3>限制训练任务 GPU 显存（PyTorch）</H3>
    <Pre code={`# 在代码里限制显存
import torch
torch.cuda.set_per_process_memory_fraction(0.5)  # 只用 50% 显存
torch.cuda.empty_cache()                          # 手动释放缓存

# 设置环境变量（只对当前进程生效）
export CUDA_VISIBLE_DEVICES=0,1  # 只用 0 号和 1 号 GPU
export PYTORCH_CUDA_ALLOC_CONF=max_split_size_mb:128  # 减少显存碎片`} />
    <NB>共享服务器上跑实验，务必 <C>nvidia-smi</C> 先看一眼谁在用哪张卡，避免踩到别人的训练任务。</NB>
  </>
}

/* ── 第七章：Docker ───────────────────────── */

function ChapterDocker() {
  return <>
    <H2 id="docker-concepts">1. 核心概念</H2>
    <P>Docker 用"容器"打包应用及其所有依赖，确保在任何机器上运行一致。三个核心概念：</P>
    <Ul items={[
      <><b>镜像（Image）</b>：只读模板，含 OS 文件、依赖库、代码。从 Dockerfile 构建。</>,
      <><b>容器（Container）</b>：镜像的运行实例，轻量级沙箱，共享宿主机内核。</>,
      <><b>仓库（Registry）</b>：镜像的存储和分发中心（Docker Hub / 阿里云镜像仓库）。</>,
    ]} />

    <H2 id="docker-cmds">2. 常用命令</H2>
    <Pre code={`# 镜像
docker pull python:3.11-slim    # 拉取镜像
docker images                   # 列出本地镜像
docker rmi image_id             # 删除镜像

# 容器
docker run -it --rm python:3.11 bash        # 启动交互式容器，退出自动删除
docker run -d --name myapp -p 8080:80 nginx  # 后台运行，端口映射
docker ps                        # 运行中的容器
docker ps -a                     # 所有容器（含已停止）
docker stop / start / restart myapp
docker rm myapp                  # 删除容器
docker logs -f myapp             # 实时查看日志
docker exec -it myapp bash       # 进入运行中的容器

# 清理
docker system prune -a           # 清理所有未用的镜像/容器/网络
# ⚠️ 会删除所有停止的容器和未引用的镜像`} />
    <H3>docker run 常用参数速查</H3>
    <Pre code={`docker run \\
  -d --name myapp \\            # 后台运行 + 命名
  --gpus all \\                 # 挂载所有 GPU
  -p 8080:80 \\                 # 端口映射 宿主机:容器
  -v /host/data:/app/data \\    # 挂载数据卷
  -e ENV_VAR=value \\           # 环境变量
  --shm-size=8g \\              # 共享内存大小（PyTorch 需要）
  --restart=unless-stopped \\   # 崩溃自动重启
  image:tag`} />

    <H2 id="docker-df">3. Dockerfile 编写</H2>
    <H3>Python 项目示例</H3>
    <Pre code={`FROM python:3.11-slim

# 设置工作目录
WORKDIR /app

# 先复制依赖文件（利用 Docker 层缓存）
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 再复制代码
COPY . .

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]`} />
    <H3>PyTorch 项目示例</H3>
    <Pre code={`FROM pytorch/pytorch:2.1.0-cuda12.1-cudnn8-runtime

WORKDIR /workspace

# 安装依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# 训练入口
ENTRYPOINT ["python", "train.py"]`} />
    <NB>先 <C>COPY requirements.txt</C> 再 <C>COPY .</C> 是关键优化——依赖文件变动少，Docker 会复用缓存层，不需要每次重新安装。</NB>

    <H2 id="docker-compose">4. Docker Compose</H2>
    <P>当项目涉及多个容器（如 API + Redis + PostgreSQL），用 Compose 一把管理：</P>
    <Pre code={`# docker-compose.yml
version: "3.8"

services:
  api:
    build: .
    ports:
      - "8000:8000"
    volumes:
      - ./data:/app/data
    environment:
      - REDIS_URL=redis://redis:6379
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/mydb
    depends_on:
      - redis
      - db

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: mydb
    volumes:
      - pg_data:/var/lib/postgresql/data

volumes:
  redis_data:
  pg_data:`} />
    <Pre code={`docker compose up -d        # 后台启动所有服务
docker compose down          # 停止并删除容器
docker compose logs -f api   # 查看 api 服务的日志
docker compose ps            # 查看容器状态
docker compose build         # 重新构建镜像`} />

    <H2 id="docker-dl">5. 深度学习容器化实践</H2>
    <P>把训练环境 Docker 化的几个实际好处：</P>
    <Ul items={[
      '论文复现仓库自带 Dockerfile → 一行命令获得完全相同的环境',
      '多台 GPU 服务器部署同一训练任务，不用担心 CUDA/cuDNN 版本差异',
      '实验环境隔离，Python 包冲突再也跟你没关系',
    ]} />
    <P>常用基础镜像选择：</P>
    <Pre code={`# 官方 PyTorch 镜像（推荐）
pytorch/pytorch:2.1.0-cuda12.1-cudnn8-runtime   # 只跑推理/训练
pytorch/pytorch:2.1.0-cuda12.1-cudnn8-devel      # 需要编译 CUDA 扩展时用

# NVIDIA 官方 CUDA 镜像（需要自己装 PyTorch）
nvidia/cuda:12.1.0-cudnn8-runtime-ubuntu22.04`} />
    <H3>docker-compose 训练配置示例</H3>
    <Pre code={`# docker-compose.train.yml
version: "3.8"

services:
  train:
    image: pytorch/pytorch:2.1.0-cuda12.1-cudnn8-runtime
    working_dir: /workspace
    volumes:
      - ./:/workspace          # 挂载当前目录
      - /data/datasets:/datasets:ro  # 数据集只读挂载
    command: python train.py --epochs 100 --batch-size 64
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    shm_size: "8gb"
    environment:
      - CUDA_VISIBLE_DEVICES=0`} />
  </>
}

/* ── sidebar ─────────────────────────────── */

function Sidebar({ activeChapter, activeSection, onNav }: {
  activeChapter: string
  activeSection: string
  onNav: (chapterId: string, sectionId?: string) => void
}) {
  return (
    <aside className="hidden lg:block w-56 shrink-0">
      <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-3">
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">目录</p>
        <nav className="space-y-3">
          {chapters.map((ch) => (
            <div key={ch.id}>
              <button
                onClick={() => !ch.pending && onNav(ch.id)}
                className={`w-full text-left px-2 py-1 rounded text-sm font-semibold transition-colors ${
                  ch.pending
                    ? 'text-slate-600 cursor-default'
                    : activeChapter === ch.id
                      ? 'text-blue-400 bg-blue-950/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <span className={`font-mono text-[0.75rem] mr-1.5 ${activeChapter === ch.id ? 'text-blue-500' : 'text-slate-600'}`}>{ch.label}</span>
                {ch.title}
              </button>
              {ch.sections.length > 0 && (
                <div className="mt-0.5 space-y-0">
                  {ch.sections.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => onNav(ch.id, s.id)}
                      className={`w-full text-left pl-5 pr-2 py-0.5 rounded text-[0.8125rem] transition-colors ${
                        activeSection === s.id
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

/* ── chapter switcher (mobile / above content) ── */

function ChapterSwitcher({ activeChapter, onSwitch }: { activeChapter: string; onSwitch: (id: string) => void }) {
  return (
    <div className="flex items-center gap-2 mb-6 flex-wrap">
      {chapters.map((ch) => (
        <button
          key={ch.id}
          onClick={() => !ch.pending && onSwitch(ch.id)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
            ch.pending
              ? 'border-slate-800 text-slate-600 cursor-default bg-transparent'
              : activeChapter === ch.id
                ? 'border-blue-800 bg-blue-950/40 text-blue-300'
                : 'border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700'
          }`}
        >
          {ch.label}
        </button>
      ))}
    </div>
  )
}

/* ── render active chapter content ──────── */

function ChapterContent({ chapterId }: { chapterId: string }) {
  switch (chapterId) {
    case 'wsl2-setup':  return <ChapterWsl2 />
    case 'commands':    return <ChapterCommands />
    case 'shell':       return <ChapterShell />
    case 'terminal':    return <ChapterTerminal />
    case 'ssh':         return <ChapterSsh />
    case 'monitoring':  return <ChapterMonitoring />
    case 'docker':      return <ChapterDocker />
    default:            return null
  }
}

/* ── main page ───────────────────────────── */

export default function NotesLinux() {
  const router = useRouter()
  const [activeChapter, setActiveChapter] = useState('wsl2-setup')
  const [activeSection, setActiveSection] = useState('wsl2-intro')
  const contentRef = useRef<HTMLDivElement>(null)

  // scroll tracking — highlight current section in sidebar
  useEffect(() => {
    const chapter = chapters.find(c => c.id === activeChapter)
    if (!chapter || chapter.sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
            break
          }
        }
      },
      { rootMargin: '-15% 0px -75% 0px', threshold: 0 }
    )

    const timer = setTimeout(() => {
      chapter.sections.forEach((s) => {
        const el = document.getElementById(s.id)
        if (el) observer.observe(el)
      })
    }, 200)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [activeChapter])

  const handleNav = useCallback((chapterId: string, sectionId?: string) => {
    setActiveChapter(chapterId)
    const targetId = sectionId || chapters.find(c => c.id === chapterId)?.sections[0]?.id
    if (targetId) {
      setActiveSection(targetId)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        })
      })
    }
  }, [])

  const activeChapterData = chapters.find(c => c.id === activeChapter)!

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
          <Sidebar activeChapter={activeChapter} activeSection={activeSection} onNav={handleNav} />

          {/* content */}
          <div ref={contentRef} className="flex-1 min-w-0">
            {/* page header */}
            <div className="mb-6">
              <p className="text-blue-400 font-mono text-xs mb-1">// notes / linux</p>
              <h1 className="text-3xl font-bold text-white mb-3">Linux 笔记</h1>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                记录 Linux 开发环境配置、日常使用技巧与服务器运维经验。以实用为导向，覆盖 WSL2、Shell 脚本、性能监控等方向。
              </p>
            </div>

            {/* chapter switcher tabs */}
            <ChapterSwitcher activeChapter={activeChapter} onSwitch={(id) => handleNav(id)} />

            {/* chapter content — only current chapter */}
            <div key={activeChapter}>
              <div className="border border-slate-800 rounded-xl mb-6 overflow-hidden">
                <div className="px-5 py-4 bg-slate-800/60 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono text-blue-400 block">{activeChapterData.label}</span>
                    <span className="text-base font-semibold text-white">{activeChapterData.title}</span>
                  </div>
                </div>
                <div className="px-5 pb-6">
                  <ChapterContent chapterId={activeChapter} />
                </div>
              </div>
            </div>

            {/* prev / next navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800">
              <ChapterNavBtn
                chapters={chapters}
                currentId={activeChapter}
                direction="prev"
                onClick={(id) => handleNav(id)}
              />
              <ChapterNavBtn
                chapters={chapters}
                currentId={activeChapter}
                direction="next"
                onClick={(id) => handleNav(id)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── prev / next button ─────────────────── */

function ChapterNavBtn({ chapters, currentId, direction, onClick }: {
  chapters: ChapterMeta[]
  currentId: string
  direction: 'prev' | 'next'
  onClick: (id: string) => void
}) {
  const currentIdx = chapters.findIndex(c => c.id === currentId)
  const targetIdx = direction === 'prev' ? currentIdx - 1 : currentIdx + 1
  const target = chapters[targetIdx]
  const isPending = target?.pending && targetIdx < chapters.length

  if (!target || targetIdx < 0 || targetIdx >= chapters.length) {
    return <div />
  }

  if (isPending) {
    const nextReal = direction === 'prev'
      ? chapters.slice(0, currentIdx).reverse().find(c => !c.pending)
      : chapters.slice(currentIdx + 1).find(c => !c.pending)
    if (!nextReal) return <div />
    return (
      <button
        onClick={() => onClick(nextReal.id)}
        className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
      >
        {direction === 'prev' ? '← 上一章' : '下一章 →'} <span className="text-slate-600">({nextReal.title})</span>
      </button>
    )
  }

  return (
    <button
      onClick={() => onClick(target.id)}
      className="text-slate-400 hover:text-slate-200 text-sm transition-colors flex items-center gap-1"
    >
      {direction === 'prev' ? '←' : ''} {direction === 'prev' ? '上一章' : '下一章'} {direction === 'next' ? '→' : ''}
      <span className="text-slate-600 hidden sm:inline">
        ({target.label} {target.title})
      </span>
    </button>
  )
}
