export interface ModalResult {
  confirm: boolean
  cancel: boolean
  content?: string
}

export function showToast(options: { title: string; icon?: string }) {
  const el = document.createElement('div')
  el.className = 'pindou-toast'
  el.textContent = options.title
  document.body.appendChild(el)
  requestAnimationFrame(() => el.classList.add('pindou-toast--show'))
  setTimeout(() => {
    el.classList.remove('pindou-toast--show')
    setTimeout(() => el.remove(), 200)
  }, 1800)
}

export function showModal(options: {
  title?: string
  content?: string
  editable?: boolean
  placeholderText?: string
  showCancel?: boolean
  confirmText?: string
  cancelText?: string
  success?: (res: ModalResult) => void
}) {
  if (options.editable) {
    const defaultValue = options.content ?? ''
    const label = [options.title, options.placeholderText].filter(Boolean).join('\n')
    const input = window.prompt(label || '请输入', defaultValue)
    if (input === null) {
      options.success?.({ confirm: false, cancel: true })
    } else {
      options.success?.({ confirm: true, cancel: false, content: input })
    }
    return
  }

  const message = [options.title, options.content].filter(Boolean).join('\n')
  if (options.showCancel === false) {
    window.alert(message)
    options.success?.({ confirm: true, cancel: false })
    return
  }
  const ok = window.confirm(message)
  options.success?.({ confirm: ok, cancel: !ok })
}

export function showActionSheet(options: {
  itemList: string[]
  success?: (res: { tapIndex: number }) => void
}) {
  const choice = window.prompt(
    `选择操作（输入序号 1-${options.itemList.length}）:\n${options.itemList.map((t, i) => `${i + 1}. ${t}`).join('\n')}`,
  )
  const index = Number(choice) - 1
  if (choice && index >= 0 && index < options.itemList.length) {
    options.success?.({ tapIndex: index })
  }
}

export function setClipboardData(options: { data: string; success?: () => void }) {
  navigator.clipboard?.writeText(options.data).then(() => options.success?.()).catch(() => {
    const ta = document.createElement('textarea')
    ta.value = options.data
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    ta.remove()
    options.success?.()
  })
}

export function getSystemInfoSync() {
  return {
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    pixelRatio: window.devicePixelRatio,
  }
}

export function scanCode(_options: { success?: (res: { result: string }) => void }) {
  showToast({ title: '网页端请粘贴分享码', icon: 'none' })
}

export function chooseMessageFile(_options: unknown) {
  showToast({ title: '网页端请使用文件导入', icon: 'none' })
}

export function getFileSystemManager() {
  return {
    readFile: (_opts: { fail?: () => void }) => _opts.fail?.(),
  }
}

export function request(options: {
  url: string
  success?: (res: { data: unknown }) => void
  fail?: () => void
}) {
  fetch(options.url)
    .then((r) => r.json())
    .then((data) => options.success?.({ data }))
    .catch(() => options.fail?.())
}
