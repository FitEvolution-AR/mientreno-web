import { describe, expect, it } from "vitest"

import { cloneMeal, cloneMealFood, emptyMeal, type EditorMeal } from "./nutrition-plan.model"

const meal = (overrides: Partial<EditorMeal> = {}): EditorMeal => ({
  ...emptyMeal(0),
  name: "Desayuno",
  calories: "520",
  proteinG: "30",
  carbsG: "60",
  fatG: "15",
  notes: "Antes de entrenar",
  foods: [
    {
      key: "food-a",
      foodName: "Avena",
      quantity: "80",
      unit: "g",
      macros: { calories: 300, protein: 10, carbs: 55, fat: 6, fiber: 8 },
    },
  ],
  ...overrides,
})

describe("cloneMealFood", () => {
  it("keeps the macros scaled at pick time", () => {
    const copy = cloneMealFood(meal().foods[0])
    expect(copy.macros).toEqual({ calories: 300, protein: 10, carbs: 55, fat: 6, fiber: 8 })
  })

  it("does not share the macros object with the original", () => {
    const original = meal().foods[0]
    const copy = cloneMealFood(original)

    copy.macros!.calories = 999
    expect(original.macros!.calories).toBe(300)
  })

  it("gives the copy a fresh key", () => {
    expect(cloneMealFood(meal().foods[0]).key).not.toBe("food-a")
  })
})

describe("cloneMeal", () => {
  it("carries the macros and the foods across", () => {
    const copy = cloneMeal(meal())

    expect(copy.calories).toBe("520")
    expect(copy.proteinG).toBe("30")
    expect(copy.notes).toBe("Antes de entrenar")
    expect(copy.foods).toHaveLength(1)
    expect(copy.foods[0].foodName).toBe("Avena")
  })

  it("marks the name as a copy so two meals never read the same", () => {
    expect(cloneMeal(meal()).name).toBe("Desayuno (copia)")
  })

  it("leaves an unnamed meal unnamed", () => {
    expect(cloneMeal(meal({ name: "  " })).name).toBe("")
  })

  it("regenerates the meal and food keys", () => {
    const original = meal()
    const copy = cloneMeal(original)

    expect(copy.key).not.toBe(original.key)
    expect(copy.foods[0].key).not.toBe(original.foods[0].key)
  })
})
