import { assert } from "console"
import { createCard, processCard } from "./index"

describe("review testing", () => {
  const config = {
    NEW_STEPS_MINUTES: [1, 10],
    GRADUATING_INTERVAL_DAYS: 1,
    INTERVAL_MODIFIER_PERCENT: 192,
    MAXIMUM_INTERVAL_DAYS: 36500,
    LAPSES_STEPS_MINUTES: [10],
    NEW_INTERVAL_PERCENT: 50,
    MINIMUM_INTERVAL_DAYS: 1,
  }

  it("returns the correct intervals", () => {
    let card = createCard()
    const answers: boolean[] = Array(10).fill(true)
    const intervals = ["0.007", 1, 3, 7, 16, 39, 97, 242, 604, 1507]
    answers.forEach((answer, index) => {
      card = processCard(card, answer, config)
      if (index === 0) {
        assert(card.nextInterval.toFixed(3) === intervals[0])
      } else {
        assert(Math.ceil(card.nextInterval) === intervals[index])
      }
    })
  })
})
