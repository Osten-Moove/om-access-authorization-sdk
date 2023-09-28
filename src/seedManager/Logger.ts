import { LoggerLevel, TextColor } from '@duaneoli/logger'

export function LoggerTotal(message: string) {
  return new LoggerLevel('Total', message, {
    level: { textColor: TextColor.CYAN },
    message: { textColor: TextColor.CYAN },
  })
}
export function LoggerAdd(message: string) {
  return new LoggerLevel('Add', message, {
    level: { textColor: TextColor.GREEN },
    message: { textColor: TextColor.GREEN },
  })
}
export function LoggerKeep(message: string) {
  return new LoggerLevel('Keep', message, {
    level: { textColor: TextColor.GRAY },
    message: { textColor: TextColor.GRAY },
  })
}
export function LoggerDelete(message: string) {
  return new LoggerLevel('Keep', message, {
    level: { textColor: TextColor.YELLOW },
    message: { textColor: TextColor.YELLOW },
  })
}

export function LoggerDetails(startMessage: string, seed: number, backup: number, result: any) {
  LoggerTotal(`${startMessage} loaded by seed: ${seed}`)
  LoggerTotal(`${startMessage} loaded by backup: ${backup}`)
  LoggerKeep(`${startMessage} not changed: ${result.update.length}`)
  LoggerAdd(`${startMessage} to be created: ${result.onlyInA.length}`)
  LoggerDelete(`${startMessage} to be deleted: ${result.onlyInB.length}`)
}
