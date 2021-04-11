import { defaults } from "./defaults"
import { ICardConfig } from "./types"

export interface ICard {
  status: "learned" | "learning" | "relearning"
  stepsIndex: number
  lastInterval: number | null
  nextInterval: number
}

export function createCard(): ICard {
  return {
    status: "learning",
    stepsIndex: 0,
    lastInterval: null,
    nextInterval: null,
  }
}

export function processCard(
  card: ICard,
  correct: boolean,
  configArg?: Partial<ICardConfig>
): ICard {
  const config = {
    ...defaults,
    ...configArg,
  }

  if (card.status === "learned") {
    if (correct) {
      const interval =
        (((card.lastInterval * 130) / 100) * config.INTERVAL_MODIFIER_PERCENT) /
        100

      return {
        ...card,
        lastInterval: interval,
        nextInterval: Math.min(config.MAXIMUM_INTERVAL_DAYS, interval),
      }
    } else {
      return {
        ...card,
        status: "relearning",
        stepsIndex: 0,
        nextInterval: minutesToDays(config.LAPSES_STEPS_MINUTES[0]),
      }
    }
  }

  if (card.status === "learning") {
    if (correct) {
      const stepsIndex = card.stepsIndex + 1
      if (stepsIndex < config.NEW_STEPS_MINUTES.length) {
        return {
          ...card,
          stepsIndex,
          nextInterval: minutesToDays(config.NEW_STEPS_MINUTES[stepsIndex]),
        }
      } else {
        const interval = config.GRADUATING_INTERVAL_DAYS
        return {
          ...card,
          status: "learned",
          lastInterval: interval,
          nextInterval: interval,
        }
      }
    } else {
      const stepsIndex = 0
      return {
        ...card,
        stepsIndex,
        nextInterval: minutesToDays(config.NEW_STEPS_MINUTES[stepsIndex]),
      }
    }
  }

  if (card.status === "relearning") {
    if (correct) {
      const stepsIndex = card.stepsIndex + 1
      if (stepsIndex < config.LAPSES_STEPS_MINUTES.length) {
        return {
          ...card,
          stepsIndex,
          nextInterval: minutesToDays(config.LAPSES_STEPS_MINUTES[stepsIndex]),
        }
      } else {
        const interval = Math.max(
          config.MINIMUM_INTERVAL_DAYS,
          (card.lastInterval * config.NEW_INTERVAL_PERCENT) / 100
        )
        return {
          ...card,
          status: "learned",
          stepsIndex: card.stepsIndex + 1,
          lastInterval: interval,
          nextInterval: interval,
        }
      }
    } else {
      return {
        ...card,
        stepsIndex: 0,
        nextInterval: minutesToDays(config.LAPSES_STEPS_MINUTES[0]),
      }
    }
  }

  throw new Error(`Unknown card status ${card.status}`)
}

function minutesToDays(minutes: number): number {
  return minutes / (60 * 24)
}
