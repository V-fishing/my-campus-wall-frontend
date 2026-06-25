/**
 * 将本地环境变量中的微信小程序 appid 注入到 manifest / project.config。
 * 读取 .env.local（优先）或 .env 中的 MP_WEIXIN_APPID。
 */

const fs = require('fs')
const path = require('path')

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local')
  const fallbackPath = path.resolve(process.cwd(), '.env')
  const target = fs.existsSync(envPath) ? envPath : fallbackPath

  if (!fs.existsSync(target)) {
    console.warn(`[inject-appid] 未找到 ${path.basename(target)}，跳过 appid 注入`)
    return {}
  }

  const content = fs.readFileSync(target, 'utf-8')
  const env = {}
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/)
    if (match) {
      env[match[1]] = match[2]
    }
  })
  return env
}

function inject(filePath, appid) {
  if (!fs.existsSync(filePath)) {
    console.warn(`[inject-appid] 模板不存在: ${filePath}`)
    return
  }
  const template = fs.readFileSync(filePath, 'utf-8')
  const output = template.replace(/__MP_WEIXIN_APPID__/g, appid || '')
  const outPath = filePath.replace(/\.template$/, '')
  fs.writeFileSync(outPath, output)
  console.log(`[inject-appid] 已写入 ${path.relative(process.cwd(), outPath)}`)
}

const env = loadEnv()
const appid = env.MP_WEIXIN_APPID

if (!appid) {
  console.warn('[inject-appid] 未配置 MP_WEIXIN_APPID，生成的 manifest/project.config 将不包含 appid')
}

inject(path.resolve(process.cwd(), 'src/manifest.json.template'), appid)
inject(path.resolve(process.cwd(), 'src/project.config.json.template'), appid)
inject(path.resolve(process.cwd(), 'project.config.json.template'), appid)
