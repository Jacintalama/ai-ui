// Salt & Pan — bundled app state (no ES-module imports, runs synchronously).
// The modular src/lib/*.js and src/data.js files are preserved for bundler
// workflows (Vite, Rollup, etc.). This file is what index.html loads directly.

// ── Block A: Router ───────────────────────────────────────────────────────────
function createRouter(opts) {
  var initial = opts.initial, views = opts.views;
  return {
    view: initial,
    history: [initial],
    setView: function(name) {
      if (views.indexOf(name) === -1) return;
      if (this.view !== name) {
        this.history.push(name);
        this.view = name;
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          window.scrollTo(0, 0);
        }
      }
    },
    back: function() {
      if (this.history.length <= 1) return;
      this.history.pop();
      this.view = this.history[this.history.length - 1];
      window.scrollTo(0, 0);
    },
  };
}

// ── Block B: Persistence ──────────────────────────────────────────────────────
function createPersistence(opts) {
  var namespace = opts.namespace, keys = opts.keys;
  var ns = function(k) { return "io-template:" + namespace + ":" + k; };
  var obj = {
    _hydrate: function() {
      for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        try {
          var raw = localStorage.getItem(ns(k));
          if (raw !== null) this[k] = JSON.parse(raw);
        } catch(e) { /* ignore */ }
      }
    },
    _save: function(k) {
      try {
        localStorage.setItem(ns(k), JSON.stringify(this[k]));
      } catch(e) { /* ignore */ }
    },
  };
  for (var i = 0; i < keys.length; i++) obj[keys[i]] = [];
  return obj;
}

// ── Data ──────────────────────────────────────────────────────────────────────
var _photoIds = [
  "1565299624946-b28f40a0ae38", "1490645935967-10de6ba17061",
  "1565958011703-44f9829ba187", "1546069901-ba9599a7e63c",
  "1565557623262-b51c2513a641", "1551782450-a2132b4ba21d",
  "1567620905732-2d1ec7ab7445", "1551183053-bf91a1d81141",
  "1565299507177-b0ac66763828", "1540189549336-e6e99c3679fe",
  "1502301197179-65228ab57f78", "1572441710269-fda88a25dc46",
  "1543353071-873f17a7a088", "1490645935967-10de6ba17061",
  "1565958011703-44f9829ba187", "1546069901-ba9599a7e63c",
  "1565557623262-b51c2513a641", "1542010589-c5d49a40c69e",
  "1546069901-ba9599a7e63c", "1547592180-85f173990554",
  "1540189549336-e6e99c3679fe", "1502301197179-65228ab57f78",
  "1572441710269-fda88a25dc46", "1543353071-873f17a7a088",
  "1543339494-b4cd0e80c1c8", "1546069901-ba9599a7e63c",
  "1551782450-a2132b4ba21d", "1567620905732-2d1ec7ab7445",
  "1551183053-bf91a1d81141", "1565299507177-b0ac66763828",
];

var _recipeSeeds = [
  ["Lemon Garlic Pasta", ["vegan"], "easy", 25, "A bright weeknight pasta with lemon and toasted garlic."],
  ["Cacio e Pepe", ["vegetarian"], "medium", 20, "Three ingredients, all about technique."],
  ["Mushroom Risotto", ["vegetarian", "gluten-free"], "medium", 45, "Wild mushrooms, white wine, parmesan."],
  ["Chickpea Curry", ["vegan", "gluten-free"], "easy", 30, "Coconut, garam masala, basmati rice."],
  ["Roasted Tomato Soup", ["vegan", "gluten-free"], "easy", 40, "Slow-roasted tomatoes blended smooth."],
  ["Bibimbap Bowl", ["vegetarian"], "medium", 45, "Korean rice bowl with sauteed veg and egg."],
  ["Lentil Bolognese", ["vegan"], "medium", 35, "Hearty plant-based ragu."],
  ["Cauliflower Tacos", ["vegan"], "easy", 25, "Spiced cauliflower, salsa verde, cashew cream."],
  ["Greek Salad", ["vegetarian", "gluten-free"], "easy", 12, "Crisp vegetables, feta, olive oil."],
  ["Coconut Curry Soup", ["vegan", "gluten-free"], "easy", 25, "Thai-inspired, lime and ginger."],
  ["Caprese Skewers", ["vegetarian", "gluten-free"], "easy", 10, "Tomato, mozzarella, basil, balsamic."],
  ["Sweet Potato Hash", ["vegan", "gluten-free"], "easy", 30, "Breakfast hash with peppers and onions."],
  ["Beef & Broccoli", [], "medium", 30, "Classic stir-fry with garlic sauce."],
  ["Chicken Tikka Masala", ["gluten-free"], "medium", 45, "Marinated chicken in spiced tomato cream."],
  ["Salmon Teriyaki", ["gluten-free", "dairy-free"], "easy", 20, "Glazed salmon, jasmine rice, edamame."],
  ["Shakshuka", ["vegetarian", "gluten-free"], "easy", 25, "Eggs poached in spiced tomato."],
  ["Roasted Veg Bowl", ["vegan", "gluten-free"], "easy", 35, "Seasonal veg, tahini drizzle."],
  ["Carbonara", ["dairy-free"], "easy", 20, "Pancetta, egg, pecorino, pepper."],
  ["Spinach Lasagna", ["vegetarian"], "medium", 60, "Layered with bechamel and ricotta."],
  ["Pesto Gnocchi", ["vegetarian"], "easy", 15, "Fresh basil pesto, toasted pine nuts."],
  ["Crispy Tofu Bowl", ["vegan", "gluten-free"], "easy", 25, "Cornstarch-crisped tofu, sticky rice."],
  ["Chana Masala", ["vegan", "gluten-free"], "easy", 30, "Chickpeas, onion, ginger, garam masala."],
  ["Quinoa Buddha Bowl", ["vegan", "gluten-free"], "easy", 25, "Roasted veg, tahini, lemon."],
  ["Eggplant Parmesan", ["vegetarian"], "medium", 50, "Layered, baked, golden."],
  ["Banh Mi Bowl", ["dairy-free"], "easy", 30, "Pork, pickled veg, sriracha mayo."],
  ["Black Bean Tacos", ["vegan"], "easy", 15, "Smoky black beans, lime crema."],
  ["Tuscan Bean Soup", ["vegan", "gluten-free"], "easy", 35, "White beans, kale, rosemary."],
  ["Stuffed Bell Peppers", ["gluten-free"], "medium", 50, "Rice, beef, herbs, tomato."],
  ["Spring Rolls", ["vegan", "gluten-free"], "easy", 20, "Rice paper, herbs, peanut sauce."],
  ["Apple Crumble", ["vegetarian"], "easy", 45, "Cinnamon apples, buttery oat topping."],
];

var _stepTemplates = [
  "Prep ingredients: wash, chop, and measure everything before heating the stove.",
  "Heat oil in a large skillet or pot over medium-high heat until shimmering.",
  "Add aromatics (onion, garlic, ginger) and cook 2-3 minutes until fragrant.",
  "Add the main ingredient and stir to coat evenly with the aromatics.",
  "Pour in liquids (broth, sauce, or water) and bring to a gentle simmer.",
  "Cover and cook for 10-15 minutes, stirring occasionally to prevent sticking.",
  "Taste and adjust seasoning: salt, pepper, and a squeeze of lemon or splash of vinegar.",
  "Plate, garnish with fresh herbs, and serve immediately while hot.",
];

var _ingredientTemplates = [
  { qty: 1,    unit: "lb",    name: "main protein or base (substitute as needed)" },
  { qty: 2,    unit: "tbsp",  name: "olive oil" },
  { qty: 3,    unit: "clove", name: "garlic, minced" },
  { qty: 1,    unit: "cup",   name: "broth or stock" },
  { qty: 0.5,  unit: "tsp",   name: "salt" },
  { qty: 0.25, unit: "tsp",   name: "black pepper" },
  { qty: 1,    unit: "",      name: "lemon, juiced" },
  { qty: 2,    unit: "tbsp",  name: "fresh herbs, chopped" },
];

var recipes = _recipeSeeds.map(function(seed, i) {
  var title = seed[0], diet = seed[1], difficulty = seed[2], minutes = seed[3], intro = seed[4];
  var pid = _photoIds[i] || _photoIds[0];
  return {
    id: "rec-" + String(i + 1).padStart(3, "0"),
    title: title, diet: diet, difficulty: difficulty, minutes: minutes, intro: intro,
    hero:  "https://images.unsplash.com/photo-" + pid + "?w=800&q=80&auto=format",
    thumb: "https://images.unsplash.com/photo-" + pid + "?w=400&q=80&auto=format",
    baseServings: 2,
    ingredients: _ingredientTemplates.map(function(ing, j) {
      return { qty: ing.qty, unit: ing.unit, name: j === 0 ? title.toLowerCase().split(" ")[0] + " (main)" : ing.name };
    }),
    steps: _stepTemplates,
  };
});

// ── Fraction glyphs ───────────────────────────────────────────────────────────
var FRACTIONS = [
  [0.125, "⅛"],  // ⅛
  [0.25,  "¼"],  // ¼
  [0.333, "⅓"],  // ⅓
  [0.5,   "½"],  // ½
  [0.667, "⅔"],  // ⅔
  [0.75,  "¾"],  // ¾
];

function formatQuantity(value) {
  if (value === 0) return "";
  var whole = Math.floor(value);
  var frac  = Math.round((value - whole) * 1000) / 1000;
  var glyph = "";
  for (var i = 0; i < FRACTIONS.length; i++) {
    if (Math.abs(frac - FRACTIONS[i][0]) < 0.04) { glyph = FRACTIONS[i][1]; break; }
  }
  if (whole === 0 && glyph)     return glyph;
  if (whole >  0 && glyph)      return whole + " " + glyph;
  if (whole >  0 && frac === 0) return "" + whole;
  return value.toFixed(2).replace(/\.?0+$/, "");
}

// ── App state factory ─────────────────────────────────────────────────────────
// Returns a plain object literal — NOT via Object.assign, so getters are preserved.
window.appState = function() {
  var router = createRouter({ initial: "catalog", views: ["catalog", "recipe", "cook-mode", "completed"] });
  var persist = createPersistence({ namespace: "recipe-site", keys: ["favorites", "cookingHistory"] });

  return {
    // Router state
    view:    router.view,
    history: router.history,
    setView: router.setView,
    back:    router.back,

    // Persistence state
    favorites:      persist.favorites,
    cookingHistory: persist.cookingHistory,
    _hydrate:       persist._hydrate,
    _save:          persist._save,

    // App state
    recipes:         recipes,
    filteredRecipes: recipes.slice(),
    filters: { ingredientSearch: "", diet: [], timeBucket: "any", difficulty: "any" },
    isLoading: false,
    selectedRecipeId: null,
    servings:  2,
    stepIndex: 0,
    timer: { remaining: 0, running: false, _interval: null },
    wakeLock:  null,
    toastMsg:  "",

    init: function() {
      this._hydrate();
      this.applyFilters();
      try {
        this._chime = new Audio(
          "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA="
        );
      } catch(e) { this._chime = null; }
    },

    applyFilters: function() {
      var q = this.filters.ingredientSearch.trim().toLowerCase();
      var self = this;
      this.filteredRecipes = this.recipes.filter(function(r) {
        var matchesSearch =
          q === "" ||
          r.ingredients.some(function(ing) { return ing.name.toLowerCase().indexOf(q) !== -1; }) ||
          r.title.toLowerCase().indexOf(q) !== -1;
        var matchesDiet =
          self.filters.diet.length === 0 ||
          self.filters.diet.every(function(d) { return r.diet.indexOf(d) !== -1; });
        var matchesTime =
          self.filters.timeBucket === "any" ||
          (self.filters.timeBucket === "<15" ? r.minutes < 15  :
           self.filters.timeBucket === "<30" ? r.minutes < 30  :
           self.filters.timeBucket === "<60" ? r.minutes < 60  : true);
        var matchesDiff =
          self.filters.difficulty === "any" || r.difficulty === self.filters.difficulty;
        return matchesSearch && matchesDiet && matchesTime && matchesDiff;
      });
    },

    toggleDiet: function(d) {
      var i = this.filters.diet.indexOf(d);
      if (i >= 0) this.filters.diet.splice(i, 1);
      else         this.filters.diet.push(d);
      this.applyFilters();
    },

    isDietActive: function(d) { return this.filters.diet.indexOf(d) !== -1; },

    openRecipe: function(id) {
      this.selectedRecipeId = id;
      // find recipe manually (no getter on this)
      var r = null;
      for (var i = 0; i < this.recipes.length; i++) {
        if (this.recipes[i].id === id) { r = this.recipes[i]; break; }
      }
      this.servings = r ? r.baseServings : 2;
      this.setView("recipe");
    },

    // Computed getter — Alpine v3 supports getters on the component data object
    get selectedRecipe() {
      var id = this.selectedRecipeId;
      if (!id) return null;
      for (var i = 0; i < this.recipes.length; i++) {
        if (this.recipes[i].id === id) return this.recipes[i];
      }
      return null;
    },

    scaledQty: function(ing) {
      var r = this.selectedRecipe;
      if (!r) return "";
      var scale = this.servings / r.baseServings;
      return formatQuantity(ing.qty * scale);
    },

    toggleFavorite: function(id) {
      var i = this.favorites.indexOf(id);
      if (i >= 0) this.favorites.splice(i, 1);
      else         this.favorites.push(id);
      this._save("favorites");
      var saved = this.favorites.indexOf(id) !== -1;
      this.toast(saved ? "Saved to favorites" : "Removed from favorites");
    },

    isFavorite: function(id) { return this.favorites.indexOf(id) !== -1; },

    startCookMode: async function() {
      this.stepIndex = 0;
      this.timer = { remaining: 0, running: false, _interval: null };
      try {
        if ("wakeLock" in navigator) {
          this.wakeLock = await navigator.wakeLock.request("screen");
        }
      } catch(e) { /* unsupported or denied: silently no-op */ }
      this.setView("cook-mode");
    },

    exitCookMode: function() {
      if (this.timer._interval) clearInterval(this.timer._interval);
      if (this.wakeLock) { this.wakeLock.release().catch(function(){}); this.wakeLock = null; }
      this.setView("recipe");
    },

    nextStep: function() {
      var r = this.selectedRecipe;
      if (!r) return;
      if (this.stepIndex < r.steps.length - 1) {
        this.stepIndex++;
        if (this.timer._interval) clearInterval(this.timer._interval);
        this.timer = { remaining: 0, running: false, _interval: null };
      } else {
        this.completeCooking();
      }
    },

    prevStep: function() {
      if (this.stepIndex > 0) this.stepIndex--;
    },

    startTimer: function(seconds) {
      seconds = seconds || 180;
      if (this.timer._interval) clearInterval(this.timer._interval);
      this.timer.remaining = seconds;
      this.timer.running   = true;
      var self = this;
      this.timer._interval = setInterval(function() {
        self.timer.remaining--;
        if (self.timer.remaining <= 0) {
          clearInterval(self.timer._interval);
          self.timer.running = false;
          try { if (self._chime) self._chime.play().catch(function(){}); } catch(e) {}
          self.toast("Timer done");
        }
      }, 1000);
    },

    timerLabel: function() {
      if (this.timer.remaining <= 0) return "—"; // —
      var m = Math.floor(this.timer.remaining / 60);
      var s = this.timer.remaining % 60;
      return m + ":" + String(s).padStart(2, "0");
    },

    completeCooking: function() {
      if (this.selectedRecipeId) {
        this.cookingHistory.push({
          recipeId: this.selectedRecipeId,
          completedAt: new Date().toISOString(),
        });
        this._save("cookingHistory");
      }
      if (this.wakeLock) { this.wakeLock.release().catch(function(){}); this.wakeLock = null; }
      if (this.timer._interval) clearInterval(this.timer._interval);
      this.setView("completed");
    },

    toast: function(msg) {
      this.toastMsg = msg;
      var self = this;
      setTimeout(function() { self.toastMsg = ""; }, 2000);
    },
  };
};
