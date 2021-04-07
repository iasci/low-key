import { defaults } from "./defaults"
import { ICardConfig } from "./types"

export class Card {
  status: "learned" | "learning" | "relearning"
  stepsIndex: number
  interval: number | null
  config: ICardConfig

  /**
   *
   * @param config Anki configuration for this card
   */
  constructor(config?: Partial<ICardConfig>) {
    this.status = "learning"
    this.stepsIndex = 0
    this.interval = null

    this.config = {
      ...defaults,
      ...config,
    }
  }

  /**
   * Updates the card's new interval and returns it.
   *
   * @param correct If the user answered correctly or not
   * @returns The new interval
   */
  answer(correct: boolean): number {
    if (this.status === "learned") {
      if (!correct) {
        this.status = "relearning"
        this.stepsIndex = 0

        return this.minutesToDays(this.config.LAPSES_STEPS_MINUTES[0])
      } else {
        this.interval =
          (((this.interval * 130) / 100) *
            this.config.INTERVAL_MODIFIER_PERCENT) /
          100

        return Math.min(this.config.MAXIMUM_INTERVAL_DAYS, this.interval)
      }
    }

    if (this.status === "learning") {
      if (!correct) {
        this.stepsIndex = 0

        return this.minutesToDays(
          this.config.NEW_STEPS_MINUTES[this.stepsIndex]
        )
      } else {
        this.stepsIndex += 1

        if (this.stepsIndex < this.config.NEW_STEPS_MINUTES.length) {
          return this.minutesToDays(
            this.config.NEW_STEPS_MINUTES[this.stepsIndex]
          )
        } else {
          this.status = "learned"
          this.interval = this.config.GRADUATING_INTERVAL_DAYS

          return this.interval
        }
      }
    }

    if (this.status === "relearning") {
      if (!correct) {
        this.stepsIndex = 0

        return this.minutesToDays(this.config.LAPSES_STEPS_MINUTES[0])
      } else {
        this.stepsIndex += 1

        if (this.stepsIndex < this.config.LAPSES_STEPS_MINUTES.length) {
          return this.minutesToDays(
            this.config.LAPSES_STEPS_MINUTES[this.stepsIndex]
          )
        } else {
          this.status = "learned"
          this.interval = Math.max(
            this.config.MINIMUM_INTERVAL_DAYS,
            (this.interval * this.config.NEW_INTERVAL_PERCENT) / 100
          )

          return this.interval
        }
      }
    }

    throw new Error(`Unknown card status ${this.status}`)
  }

  minutesToDays(minutes: number): number {
    return minutes / (60 * 24)
  }
}
