import { Card } from "./index"

describe("review testing", () => {
  const sampleCard = new Card()
  const responses: boolean[] = Array(10).fill(true)
  responses.forEach((response) => {
    const time = sampleCard.answer(response)
    console.log(time)
  })
})
