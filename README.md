# 🧪 Alchemist's Cauldron

Mix ingredients, match 3 target ranges, and brew potions before time or lives run out.

Levels and score:

🟣 Precondition 1 Repository setup, tooling, folder structure and quality checks - 58 points  
🟢 Level 1 — Basic One full playable game with one fixed rule set - 170 points  
🟡 Level 2 — Extended Difficulty selection and save / continue - 50 points  
🔴 Level 3 — Full game Drag & drop, tooltip, reactions, Pour Out, keyboard shortcuts and visual feedback - 115 points

## How the game works

1. Start a game. The app picks one random recipe from the recipe pool, and the recipe panel shows how many ingredients you may use, for example Ingredients: 0 / 4. When the run starts, the shelf is filled according to the chosen difficulty, the cauldron is still empty, and the score/time/lives switch from the start screen state to the active game state.
2. Add ingredients from the shelf to the cauldron. The counter grows with every ingredient (1 / 4, 2 / 4 …). At the maximum the shelf is blocked.
3. Watch the 3 bars: Temperature, Density and Magic Power.
4. Try to move every value into the recipe target zones.
5. Click Brew to check the mix. In Level 3, Pour Out is also available.
6. Keep brewing until time ends, you lose all lives, or the ingredients run out.

   Every ingredient has a limited stock. The number on the shelf card shows how many portions are left
