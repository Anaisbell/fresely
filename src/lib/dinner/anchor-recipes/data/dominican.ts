import type { AnchorRecipe } from "../schema";

/**
 * Dominican curated recipes. One file per culture — see data/index.ts for
 * how these get aggregated and validated. To add another Dominican classic,
 * append another entry to this array; to add a new culture, create a new
 * sibling file here and register it in data/index.ts.
 */
export const dominicanAnchorRecipes: AnchorRecipe[] = [
  {
    id: "dominican-pollo-guisado",
    culture: "Dominican",
    mealContext: "dinner",
    title: "Pollo Guisado (Dominican Stewed Chicken)",
    rationale:
      "A staple of Dominican home cooking — chicken slowly stewed with sofrito, ají, and tomato until deeply savory, traditionally served over white rice.",
    timeMinutes: 60,
    servings: 4,
    coreIngredients: ["chicken", "rice", "onion", "garlic"],
    flexibleIngredients: [
      "bell pepper",
      "tomato paste",
      "cilantro",
      "lime",
      "olives",
      "vegetable oil",
    ],
    steps: [
      "Season chicken pieces with lime juice, salt, and pepper; let sit 10 minutes.",
      "Heat oil in a heavy pot and sear the chicken until browned on all sides; set aside.",
      "In the same pot, sauté onion, garlic, and bell pepper until fragrant.",
      "Stir in tomato paste and cook 1-2 minutes, then return the chicken to the pot.",
      "Add enough water to partially cover the chicken, cover, and simmer until tender, about 35-40 minutes.",
      "Uncover and reduce the sauce to your preferred thickness; finish with cilantro.",
      "Serve hot over white rice.",
    ],
    caution: null,
    allergenTags: [],
    // No real photo exists yet — see the imageUrl comment on AnchorRecipeSchema.
    imageUrl: null,
  },
];
