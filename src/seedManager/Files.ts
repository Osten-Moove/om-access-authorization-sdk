import { execSync } from 'child_process'
import * as fs from 'fs'

export function writeFile(path: string, data: any) {
  fs.writeFileSync(path, JSON.stringify(data))
  execSync(`prettier --write ${path}`, { stdio: 'inherit' })
}

export function readFile<T>(path: string): Array<T> {
  return fs.existsSync(path) ? JSON.parse(fs.readFileSync(path, 'utf8')) : []
}

export function generatePlanFile(obj: { onlyInA: any; onlyInB: any; update: any }) {
  return { add: obj.onlyInA, remove: obj.onlyInB, update: obj.update }
}

export function createDirectory(path: string, apply: boolean = false) {
  let folderPlan = (path[path.length - 1] !== '/' ? path : path.slice(0, path.length - 1)) + '/plan'
  let folderBackup = (path[path.length - 1] !== '/' ? path : path.slice(0, path.length - 1)) + '/backup'

  if (!apply) folderPlan += '/' + Date.now()
  fs.mkdirSync(folderPlan, { recursive: true })
  fs.mkdirSync(folderBackup, { recursive: true })

  return { folderPlan, folderBackup }
}
